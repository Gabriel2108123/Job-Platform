using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Messaging.Entities;

/// <summary>
/// Represents a conversation between users within an organization.
/// Conversations can span multiple applications or be organization-scoped.
/// </summary>
public class Conversation : TenantEntity
{
    /// <summary>Conversation subject/title.</summary>
    public string Subject { get; set; } = null!;

    /// <summary>Conversation description (optional).</summary>
    public string? Description { get; set; }

    /// <summary>The application this conversation is associated with (if any).</summary>
    public Guid? ApplicationId { get; set; }

    /// <summary>Whether the conversation is active (archived conversations are read-only).</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>User who created the conversation.</summary>
    public required string CreatedByUserId { get; set; }

    /// <summary>Timestamp when the conversation was archived (if any).</summary>
    public DateTime? ArchivedAt { get; set; }

    /// <summary>User who archived the conversation.</summary>
    public string? ArchivedByUserId { get; set; }

    /// <summary>Navigation property for participants.</summary>
    public ICollection<ConversationParticipant> Participants { get; set; } = [];

    /// <summary>Navigation property for messages.</summary>
    public ICollection<Message> Messages { get; set; } = [];
}
