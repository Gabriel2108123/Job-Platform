using HospitalityPlatform.Applications.Services;
using HospitalityPlatform.Audit.Entities;
using HospitalityPlatform.Messaging.DTOs;
using HospitalityPlatform.Messaging.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Messaging.Services;

/// <summary>
/// Implementation of messaging service with rate limiting, eligibility enforcement, and audit logging.
/// 
/// KEY SECURITY RULE: Chat unlock after match
/// - Messaging is only allowed between users with an application status >= Screening
/// - Uses IApplicationsReadService to check eligibility without querying Applications tables directly
/// - Rate limit: 30 messages per user per hour
/// - All sensitive operations are audited
/// </summary>
public class MessagingService : IMessagingService
{
    private readonly IMessagingDbContext _dbContext;
    private readonly IApplicationsReadService _applicationsReadService;
    private readonly ILogger<MessagingService> _logger;
    private const int MaxMessagesPerHour = 30;

    public MessagingService(
        IMessagingDbContext dbContext,
        IApplicationsReadService applicationsReadService,
        ILogger<MessagingService> logger)
    {
        _dbContext = dbContext;
        _applicationsReadService = applicationsReadService ?? throw new ArgumentNullException(nameof(applicationsReadService));
        _logger = logger;
    }

    /// <summary>
    /// Create a new conversation with eligibility enforcement.
    /// If ApplicationId is provided, checks that the application is in Screening or later.
    /// </summary>
    public async Task<ConversationDto> CreateConversationAsync(Guid organizationId, CreateConversationDto dto, string userId)
    {
        // Validate participants (prevent self-messaging)
        var allParticipants = dto.ParticipantUserIds.Append(userId).Distinct().ToList();
        if (allParticipants.Count < 2)
        {
            throw new InvalidOperationException("Conversation requires at least 2 participants");
        }

        // If ApplicationId is specified, enforce screening gate
        if (dto.ApplicationId.HasValue)
        {
            var isEligible = await _applicationsReadService.IsApplicationInScreeningOrLaterAsync(
                dto.ApplicationId.Value, organizationId);

            if (!isEligible)
            {
                _logger.LogWarning(
                    "Conversation creation blocked: application not in screening. AppId: {AppId}, UserId: {UserId}",
                    dto.ApplicationId, userId);
                throw new InvalidOperationException(
                    "Cannot create conversation - application is not in screening or later stage");
            }

            // Verify all participants are involved in this application
            foreach (var participantId in dto.ParticipantUserIds)
            {
                var isInvolved = await _applicationsReadService.IsUserInApplicationAsync(
                    dto.ApplicationId.Value, organizationId, participantId);

                if (!isInvolved)
                {
                    _logger.LogWarning(
                        "Conversation creation blocked: participant not in application. AppId: {AppId}, UserId: {UserId}",
                        dto.ApplicationId, participantId);
                    throw new InvalidOperationException(
                        $"Participant {participantId} is not involved in this application");
                }
            }
        }

        // Check for idempotent conversation creation (same participants + same application)
        var existingConversation = await GetOrCreateIdempotentConversationAsync(
            organizationId, dto, userId);

        if (existingConversation != null)
        {
            _logger.LogInformation("Conversation already exists (idempotent). ConvId: {ConvId}", existingConversation.Id);
            return existingConversation;
        }

        // Create new conversation
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Subject = dto.Subject,
            Description = dto.Description,
            ApplicationId = dto.ApplicationId,
            CreatedByUserId = userId
        };

        _dbContext.Conversations.Add(conversation);

        // Add creator as participant
        var creatorParticipant = new ConversationParticipant
        {
            Id = Guid.NewGuid(),
            ConversationId = conversation.Id,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        };
        _dbContext.ConversationParticipants.Add(creatorParticipant);

        // Add other participants
        foreach (var participantId in dto.ParticipantUserIds.Where(p => p != userId).Distinct())
        {
            var participant = new ConversationParticipant
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                UserId = participantId,
                JoinedAt = DateTime.UtcNow
            };
            _dbContext.ConversationParticipants.Add(participant);
        }

        // Audit log
        await LogAuditAsync(organizationId, userId, "ConversationCreated", conversation.Id.ToString(),
            $"Created conversation: {conversation.Subject} with {dto.ParticipantUserIds.Count()} participants");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation(
            "Conversation created: {ConversationId} by user {UserId} with {ParticipantCount} participants",
            conversation.Id, userId, allParticipants.Count);

        return MapConversationDto(conversation);
    }

    /// <summary>
    /// Check for existing conversation with same participants and application (idempotent).
    /// </summary>
    private async Task<ConversationDto?> GetOrCreateIdempotentConversationAsync(
        Guid organizationId, CreateConversationDto dto, string userId)
    {
        var allParticipantIds = dto.ParticipantUserIds.Append(userId).Distinct().OrderBy(p => p).ToList();

        var existingConversations = await _dbContext.Conversations
            .Where(c => c.OrganizationId == organizationId
                && c.ApplicationId == dto.ApplicationId
                && c.IsActive)
            .ToListAsync();

        foreach (var conv in existingConversations)
        {
            var convParticipants = await _dbContext.ConversationParticipants
                .Where(p => p.ConversationId == conv.Id && !p.HasLeft)
                .Select(p => p.UserId)
                .OrderBy(u => u)
                .ToListAsync();

            if (convParticipants.SequenceEqual(allParticipantIds))
            {
                return MapConversationDto(conv);
            }
        }

        return null;
    }

    /// <summary>
    /// Get a single conversation.
    /// </summary>
    public async Task<ConversationDto?> GetConversationAsync(Guid organizationId, Guid conversationId)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId && c.IsActive)
            .FirstOrDefaultAsync();

        return conversation != null ? MapConversationDto(conversation) : null;
    }

    /// <summary>
    /// Get paginated list of conversations.
    /// </summary>
    public async Task<PagedResult<ConversationDto>> GetConversationsAsync(Guid organizationId, int pageNumber = 1, int pageSize = 10)
    {
        var query = _dbContext.Conversations
            .Where(c => c.OrganizationId == organizationId && c.IsActive)
            .OrderByDescending(c => c.UpdatedAt);

        var totalCount = await query.CountAsync();

        var conversations = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = conversations.Select(MapConversationDto).ToList();

        return new PagedResult<ConversationDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Get paginated messages in a conversation.
    /// </summary>
    public async Task<PagedResult<MessageDto>> GetMessagesAsync(Guid organizationId, Guid conversationId, int pageNumber = 1, int pageSize = 20)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        var query = _dbContext.Messages
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
            .OrderByDescending(m => m.SentAt);

        var totalCount = await query.CountAsync();

        var messages = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = messages.Select(MapMessageDto).ToList();

        return new PagedResult<MessageDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Send a message with eligibility and rate limit enforcement.
    /// </summary>
    public async Task<MessageDto> SendMessageAsync(Guid organizationId, Guid conversationId, SendMessageDto dto, string userId)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId && c.IsActive)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        var isParticipant = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId == userId && !p.HasLeft)
            .AnyAsync();

        if (!isParticipant)
        {
            _logger.LogWarning("Message send blocked: user not a participant. ConvId: {ConvId}, UserId: {UserId}",
                conversationId, userId);
            throw new UnauthorizedAccessException("User is not a participant in this conversation");
        }

        // If conversation is application-scoped, enforce eligibility
        if (conversation.ApplicationId.HasValue)
        {
            var isEligible = await _applicationsReadService.IsApplicationInScreeningOrLaterAsync(
                conversation.ApplicationId.Value, organizationId);

            if (!isEligible)
            {
                _logger.LogWarning(
                    "Message send blocked: application not eligible. AppId: {AppId}, ConvId: {ConvId}, UserId: {UserId}",
                    conversation.ApplicationId, conversationId, userId);
                throw new InvalidOperationException(
                    "Cannot send message - application is no longer in screening or later stage");
            }
        }

        // Check rate limit
        var messageCountLastHour = await _dbContext.Messages
            .Where(m => m.ConversationId == conversationId && m.SentByUserId == userId
                && m.SentAt > DateTime.UtcNow.AddHours(-1) && !m.IsDeleted)
            .CountAsync();

        if (messageCountLastHour >= MaxMessagesPerHour)
        {
            _logger.LogWarning("Message send blocked: rate limit exceeded. UserId: {UserId}", userId);
            throw new InvalidOperationException($"Rate limit exceeded: maximum {MaxMessagesPerHour} messages per hour");
        }

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SentByUserId = userId,
            Content = dto.Content,
            SentAt = DateTime.UtcNow
        };

        _dbContext.Messages.Add(message);

        await LogAuditAsync(organizationId, userId, "MessageSent", message.Id.ToString(),
            $"Message sent in conversation {conversationId}");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Message sent: {MessageId} in conversation {ConversationId} by user {UserId}",
            message.Id, conversationId, userId);

        return MapMessageDto(message);
    }

    /// <summary>
    /// Edit a message (only sender can edit).
    /// </summary>
    public async Task<MessageDto> EditMessageAsync(Guid organizationId, Guid messageId, EditMessageDto dto, string userId)
    {
        var message = await _dbContext.Messages
            .Where(m => m.Id == messageId && !m.IsDeleted)
            .FirstOrDefaultAsync();

        if (message == null)
        {
            throw new InvalidOperationException("Message not found");
        }

        if (message.SentByUserId != userId)
        {
            throw new UnauthorizedAccessException("You can only edit your own messages");
        }

        message.Content = dto.Content;
        message.EditedAt = DateTime.UtcNow;
        message.EditedByUserId = userId;

        await LogAuditAsync(organizationId, userId, "MessageEdited", message.Id.ToString(),
            $"Edited message in conversation {message.ConversationId}");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Message edited: {MessageId} by user {UserId}", message.Id, userId);

        return MapMessageDto(message);
    }

    /// <summary>
    /// Delete a message (soft delete).
    /// </summary>
    public async Task DeleteMessageAsync(Guid organizationId, Guid messageId, string userId)
    {
        var message = await _dbContext.Messages
            .Where(m => m.Id == messageId && !m.IsDeleted)
            .FirstOrDefaultAsync();

        if (message == null)
        {
            throw new InvalidOperationException("Message not found");
        }

        if (message.SentByUserId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own messages");
        }

        message.IsDeleted = true;

        await LogAuditAsync(organizationId, userId, "MessageDeleted", message.Id.ToString(),
            $"Deleted message in conversation {message.ConversationId}");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Message deleted: {MessageId} by user {UserId}", message.Id, userId);
    }

    /// <summary>
    /// Add a participant with eligibility enforcement.
    /// </summary>
    public async Task AddParticipantAsync(Guid organizationId, Guid conversationId, string participantId, string userId)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId && c.IsActive)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        var userIsParticipant = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId == userId && !p.HasLeft)
            .AnyAsync();

        if (!userIsParticipant)
        {
            throw new UnauthorizedAccessException("Only conversation participants can add others");
        }

        var participantExists = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId == participantId && !p.HasLeft)
            .AnyAsync();

        if (participantExists)
        {
            throw new InvalidOperationException("Participant already exists in conversation");
        }

        // If application-scoped, verify new participant is involved
        if (conversation.ApplicationId.HasValue)
        {
            var isInvolved = await _applicationsReadService.IsUserInApplicationAsync(
                conversation.ApplicationId.Value, organizationId, participantId);

            if (!isInvolved)
            {
                _logger.LogWarning(
                    "Participant add blocked: user not in application. AppId: {AppId}, ParticipantId: {ParticipantId}",
                    conversation.ApplicationId, participantId);
                throw new InvalidOperationException(
                    $"Participant {participantId} cannot be added - not involved in this application");
            }
        }

        var participant = new ConversationParticipant
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            UserId = participantId,
            JoinedAt = DateTime.UtcNow
        };

        _dbContext.ConversationParticipants.Add(participant);

        await LogAuditAsync(organizationId, userId, "ParticipantAdded", conversationId.ToString(),
            $"Added participant {participantId} to conversation");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Participant added: {ParticipantId} to conversation {ConversationId} by user {UserId}",
            participantId, conversationId, userId);
    }

    /// <summary>
    /// Remove a participant (soft removal).
    /// </summary>
    public async Task RemoveParticipantAsync(Guid organizationId, Guid conversationId, string participantId, string userId)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId && c.IsActive)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        if (participantId != userId && conversation.CreatedByUserId != userId)
        {
            throw new UnauthorizedAccessException("You can only remove yourself or you must be the conversation creator");
        }

        var participant = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId == participantId && !p.HasLeft)
            .FirstOrDefaultAsync();

        if (participant == null)
        {
            throw new InvalidOperationException("Participant not found in conversation");
        }

        participant.HasLeft = true;

        await LogAuditAsync(organizationId, userId, "ParticipantRemoved", conversationId.ToString(),
            $"Removed participant {participantId} from conversation");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Participant removed: {ParticipantId} from conversation {ConversationId} by user {UserId}",
            participantId, conversationId, userId);
    }

    /// <summary>
    /// Add multiple participants to a conversation in bulk.
    /// Each participant is subject to the same eligibility enforcement as AddParticipantAsync.
    /// </summary>
    public async Task AddParticipantsAsync(Guid organizationId, Guid conversationId, AddParticipantsDto dto, string userId)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId && c.IsActive)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        // Verify user is a participant
        var userIsParticipant = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId == userId && !p.HasLeft)
            .AnyAsync();

        if (!userIsParticipant)
        {
            throw new UnauthorizedAccessException("Only conversation participants can add others");
        }

        // Get existing participants
        var existingParticipants = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && !p.HasLeft)
            .Select(p => p.UserId)
            .ToListAsync();

        var addedCount = 0;

        foreach (var newParticipantId in dto.UserIds.Where(id => !existingParticipants.Contains(id)).Distinct())
        {
            // If conversation is application-scoped, verify participant is involved
            if (conversation.ApplicationId.HasValue)
            {
                var isInvolved = await _applicationsReadService.IsUserInApplicationAsync(
                    conversation.ApplicationId.Value, organizationId, newParticipantId);

                if (!isInvolved)
                {
                    _logger.LogWarning(
                        "Bulk participant add skipped for ineligible user. UserId: {UserId}, ConvId: {ConvId}",
                        newParticipantId, conversationId);
                    continue; // Skip this participant, but continue with others
                }
            }

            var participant = new ConversationParticipant
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                UserId = newParticipantId,
                JoinedAt = DateTime.UtcNow
            };

            _dbContext.ConversationParticipants.Add(participant);
            addedCount++;
        }

        if (addedCount > 0)
        {
            await LogAuditAsync(organizationId, userId, "BulkParticipantsAdded", conversationId.ToString(),
                $"Added {addedCount} participants to conversation");

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Bulk participants added: {Count} to conversation {ConversationId} by user {UserId}",
                addedCount, conversationId, userId);
        }
    }

    /// <summary>
    /// Get all participants in a conversation.
    /// </summary>
    public async Task<List<ConversationParticipantDto>> GetParticipantsAsync(Guid organizationId, Guid conversationId)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        var participants = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && !p.HasLeft)
            .Select(p => new ConversationParticipantDto
            {
                Id = p.Id,
                UserId = p.UserId,
                JoinedAt = p.JoinedAt,
                LastReadAt = p.LastReadAt,
                HasLeft = p.HasLeft
            })
            .ToListAsync();

        return participants;
    }

    /// <summary>
    /// Mark conversation as read.
    /// </summary>
    public async Task MarkAsReadAsync(Guid organizationId, Guid conversationId, string userId)
    {
        var participant = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId == userId && !p.HasLeft)
            .FirstOrDefaultAsync();

        if (participant == null)
        {
            throw new InvalidOperationException("Participant not found in conversation");
        }

        participant.LastReadAt = DateTime.UtcNow;

        await LogAuditAsync(organizationId, userId, "ConversationMarkedAsRead", conversationId.ToString(),
            "Marked conversation as read");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Conversation marked as read: {ConversationId} by user {UserId}", conversationId, userId);
    }

    /// <summary>
    /// Archive a conversation (soft deactivation).
    /// </summary>
    public async Task ArchiveConversationAsync(Guid organizationId, Guid conversationId, string userId)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId && c.IsActive)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        var isParticipant = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId == userId && !p.HasLeft)
            .AnyAsync();

        if (!isParticipant)
        {
            throw new UnauthorizedAccessException("Only participants can archive conversations");
        }

        conversation.IsActive = false;
        conversation.ArchivedAt = DateTime.UtcNow;
        conversation.ArchivedByUserId = userId;

        await LogAuditAsync(organizationId, userId, "ConversationArchived", conversationId.ToString(),
            "Archived conversation");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Conversation archived: {ConversationId} by user {UserId}", conversationId, userId);
    }

    /// <summary>
    /// Rate a conversation.
    /// </summary>
    public async Task<RatingDto> RateConversationAsync(Guid organizationId, Guid conversationId, RateConversationDto dto, string userId)
    {
        var conversation = await _dbContext.Conversations
            .Where(c => c.Id == conversationId && c.OrganizationId == organizationId)
            .FirstOrDefaultAsync();

        if (conversation == null)
        {
            throw new InvalidOperationException("Conversation not found");
        }

        var isParticipant = await _dbContext.ConversationParticipants
            .Where(p => p.ConversationId == conversationId && p.UserId == userId && !p.HasLeft)
            .AnyAsync();

        if (!isParticipant)
        {
            throw new UnauthorizedAccessException("Only participants can rate conversations");
        }

        // Safety check: at least 1 message must exist in conversation
        var messageCount = await _dbContext.Messages
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
            .CountAsync();

        if (messageCount == 0)
        {
            throw new InvalidOperationException("Cannot rate conversation with no messages");
        }

        // Safety check: one rating per user per conversation
        var existingRating = await _dbContext.Ratings
            .Where(r => r.ConversationId == conversationId && r.UserId == userId)
            .FirstOrDefaultAsync();

        if (existingRating != null)
        {
            throw new InvalidOperationException("User has already rated this conversation");
        }

        var rating = new Rating
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            UserId = userId,
            Score = dto.Score,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await LogAuditAsync(organizationId, userId, "ConversationRated", conversationId.ToString(),
            $"Rated conversation: {dto.Score}/5");

        return new RatingDto
        {
            Id = rating.Id,
            ConversationId = rating.ConversationId,
            UserId = rating.UserId,
            Score = rating.Score,
            Comment = rating.Comment,
            CreatedAt = rating.CreatedAt
        };
    }

    /// <summary>
    /// Get the count of unread messages for a user in the organization.
    /// A message is unread if it was sent after the participant joined and after they last read the conversation.
    /// </summary>
    public async Task<int> GetUnreadCountAsync(Guid organizationId, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return 0;

        try
        {
            var unreadCount = await _dbContext.ConversationParticipants
                .Where(p => p.UserId == userId && !p.HasLeft)
                .Join(
                    _dbContext.Conversations,
                    p => p.ConversationId,
                    c => c.Id,
                    (p, c) => new { p, c })
                .Where(x => x.c.OrganizationId == organizationId)
                .Join(
                    _dbContext.Messages,
                    x => x.c.Id,
                    m => m.ConversationId,
                    (x, m) => new { x.p, x.c, m })
                .Where(x => x.m.SentAt > (x.p.LastReadAt ?? x.p.JoinedAt) && !x.m.IsDeleted)
                .Select(x => x.m.Id)
                .Distinct()
                .CountAsync();

            return unreadCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count for user {UserId} in org {OrgId}", userId, organizationId);
            return 0; // Return 0 on error (safe default)
        }
    }

    /// <summary>
    /// Mapping and audit helpers.
    /// </summary>
    private ConversationDto MapConversationDto(Conversation conversation)
    {
        return new ConversationDto
        {
            Id = conversation.Id,
            Subject = conversation.Subject,
            Description = conversation.Description,
            ApplicationId = conversation.ApplicationId,
            IsActive = conversation.IsActive,
            CreatedAt = conversation.CreatedAt,
            CreatedByUserId = conversation.CreatedByUserId,
            UpdatedAt = conversation.UpdatedAt
        };
    }

    private MessageDto MapMessageDto(Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SentByUserId = message.SentByUserId,
            Content = message.Content,
            SentAt = message.SentAt,
            EditedAt = message.EditedAt,
            EditedByUserId = message.EditedByUserId,
            IsDeleted = message.IsDeleted
        };
    }

    private async Task LogAuditAsync(Guid organizationId, string userId, string action, string entityId, string description)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            UserId = string.IsNullOrEmpty(userId) ? null : Guid.Parse(userId),
            Action = action,
            EntityType = "Message",
            EntityId = entityId,
            Details = description,
            Timestamp = DateTime.UtcNow,
            IpAddress = "N/A"
        };

        await _dbContext.SaveAuditLogAsync(auditLog);
    }
}
