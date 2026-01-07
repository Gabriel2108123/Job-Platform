using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Messaging.Entities;

/// <summary>
/// Represents a message within a conversation.
/// Messages are immutable once created (soft delete via IsDeleted flag).
/// </summary>
public class Message : TenantEntity
{
    /// <summary>Unique identifier for the message.</summary>
    public Guid Id { get; set; }

    /// <summary>The conversation this message belongs to.</summary>
    public Guid ConversationId { get; set; }

    /// <summary>The user ID who sent the message.</summary>
    public required string SentByUserId { get; set; }

    /// <summary>The message content (plain text).</summary>
    public required string Content { get; set; }

    /// <summary>Timestamp when the message was sent.</summary>
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    /// <summary>Timestamp when the message was last edited (if any).</summary>
    public DateTime? EditedAt { get; set; }

    /// <summary>User who edited the message.</summary>
    public string? EditedByUserId { get; set; }

    /// <summary>Whether the message has been deleted (soft delete).</summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>Timestamp when the message was deleted.</summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>User who deleted the message.</summary>
    public string? DeletedByUserId { get; set; }

    /// <summary>Navigation property for the conversation.</summary>
    public Conversation Conversation { get; set; } = null!;
}
