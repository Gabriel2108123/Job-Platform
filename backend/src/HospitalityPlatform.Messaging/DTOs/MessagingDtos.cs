namespace HospitalityPlatform.Messaging.DTOs;

/// <summary>DTO for creating a new conversation.</summary>
public class CreateConversationDto
{
    public required string Subject { get; set; }
    public string? Description { get; set; }
    public Guid? ApplicationId { get; set; }
    /// <summary>List of user IDs to add as participants (creator is auto-added).</summary>
    public required List<string> ParticipantUserIds { get; set; } = [];
}

/// <summary>DTO for sending a new message.</summary>
public class SendMessageDto
{
    public required string Content { get; set; }
}

/// <summary>DTO for editing a message.</summary>
public class EditMessageDto
{
    public required string Content { get; set; }
}

/// <summary>DTO for adding participants to a conversation.</summary>
public class AddParticipantsDto
{
    public required List<string> UserIds { get; set; }
}

/// <summary>DTO for rating a conversation.</summary>
public class RateConversationDto
{
    public int Score { get; set; }
    public string? Comment { get; set; }
}

/// <summary>DTO for the conversation response.</summary>
public class ConversationDto
{
    public Guid Id { get; set; }
    public string Subject { get; set; } = null!;
    public string? Description { get; set; }
    public Guid? ApplicationId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserId { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
}

/// <summary>DTO for the message response.</summary>
public class MessageDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public string SentByUserId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime SentAt { get; set; }
    public DateTime? EditedAt { get; set; }
    public string? EditedByUserId { get; set; }
    public bool IsDeleted { get; set; }
}

/// <summary>DTO for conversation participant info.</summary>
public class ConversationParticipantDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = null!;
    public DateTime JoinedAt { get; set; }
    public DateTime? LastReadAt { get; set; }
    public bool HasLeft { get; set; }
}

/// <summary>DTO for rating response.</summary>
public class RatingDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public string UserId { get; set; } = null!;
    public int Score { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>DTO for paginated results.</summary>
public class PagedResult<T>
{
    public required List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

