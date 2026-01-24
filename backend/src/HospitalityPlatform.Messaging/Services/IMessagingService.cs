using HospitalityPlatform.Messaging.DTOs;
using HospitalityPlatform.Messaging.Entities;

namespace HospitalityPlatform.Messaging.Services;

/// <summary>
/// Interface for messaging service operations.
/// Enforces organization isolation, eligibility checks, rate limiting, and audit logging.
/// 
/// KEY SECURITY RULE: Chat unlock after match
/// - CreateConversationAsync enforces application status >= Screening
/// - SendMessageAsync enforces the same eligibility rule
/// - AddParticipantAsync verifies new participant involvement in application
/// </summary>
public interface IMessagingService
{
    /// <summary>Create a new conversation with eligibility enforcement (if ApplicationId provided).</summary>
    Task<ConversationDto> CreateConversationAsync(Guid organizationId, CreateConversationDto dto, string userId);

    /// <summary>Get a conversation by ID.</summary>
    Task<ConversationDto?> GetConversationAsync(Guid organizationId, Guid conversationId);

    /// <summary>Get all conversations for organization (paginated).</summary>
    Task<PagedResult<ConversationDto>> GetConversationsAsync(Guid organizationId, int pageNumber = 1, int pageSize = 10);

    /// <summary>Send a message with eligibility and rate limit enforcement.</summary>
    Task<MessageDto> SendMessageAsync(Guid organizationId, Guid conversationId, SendMessageDto dto, string userId);

    /// <summary>Edit a message (sender only).</summary>
    Task<MessageDto> EditMessageAsync(Guid organizationId, Guid messageId, EditMessageDto dto, string userId);

    /// <summary>Delete a message (soft delete, sender only).</summary>
    Task DeleteMessageAsync(Guid organizationId, Guid messageId, string userId);

    /// <summary>Get messages in a conversation (paginated).</summary>
    Task<PagedResult<MessageDto>> GetMessagesAsync(Guid organizationId, Guid conversationId, int pageNumber = 1, int pageSize = 20);

    /// <summary>Add a single participant with eligibility enforcement.</summary>
    Task AddParticipantAsync(Guid organizationId, Guid conversationId, string participantId, string userId);

    /// <summary>Add multiple participants to a conversation (bulk).</summary>
    Task AddParticipantsAsync(Guid organizationId, Guid conversationId, AddParticipantsDto dto, string userId);

    /// <summary>Get participants in a conversation.</summary>
    Task<List<ConversationParticipantDto>> GetParticipantsAsync(Guid organizationId, Guid conversationId);

    /// <summary>Remove a participant from conversation.</summary>
    Task RemoveParticipantAsync(Guid organizationId, Guid conversationId, string participantId, string userId);

    /// <summary>Mark conversation as read.</summary>
    Task MarkAsReadAsync(Guid organizationId, Guid conversationId, string userId);

    /// <summary>Archive a conversation.</summary>
    Task ArchiveConversationAsync(Guid organizationId, Guid conversationId, string userId);

    /// <summary>Rate a conversation.</summary>
    Task<RatingDto> RateConversationAsync(Guid organizationId, Guid conversationId, RateConversationDto dto, string userId);

    /// <summary>Get unread message count for a user in organization.</summary>
    Task<int> GetUnreadCountAsync(Guid organizationId, string userId);

    /// <summary>Update participant's LastSeenAt timestamp.</summary>
    Task UpdateParticipantLastSeenAsync(Guid conversationId, string userId);
}
