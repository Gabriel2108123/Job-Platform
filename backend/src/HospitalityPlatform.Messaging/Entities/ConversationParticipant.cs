namespace HospitalityPlatform.Messaging.Entities;

/// <summary>
/// Represents a participant in a conversation.
/// Tracks read status and last read timestamp for notifications.
/// </summary>
public class ConversationParticipant
{
    /// <summary>Unique identifier for the participant record.</summary>
    public Guid Id { get; set; }

    /// <summary>The conversation this participant belongs to.</summary>
    public Guid ConversationId { get; set; }

    /// <summary>The user ID of the participant.</summary>
    public required string UserId { get; set; }

    /// <summary>Timestamp when the participant was added to the conversation.</summary>
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Timestamp when the participant last read messages in this conversation.</summary>
    public DateTime? LastReadAt { get; set; }

    /// <summary>Timestamp when the participant was last active in the conversation context.</summary>
    public DateTime? LastSeenAt { get; set; }

    /// <summary>Whether the participant has left the conversation (soft delete).</summary>
    public bool HasLeft { get; set; } = false;

    /// <summary>Timestamp when the participant left the conversation.</summary>
    public DateTime? LeftAt { get; set; }

    /// <summary>Navigation property for the conversation.</summary>
    public Conversation Conversation { get; set; } = null!;
}
