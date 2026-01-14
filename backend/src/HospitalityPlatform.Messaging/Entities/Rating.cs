using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Messaging.Entities;

/// <summary>
/// Represents a rating/review for a conversation.
/// Users can rate their interaction experience after a conversation.
/// </summary>
public class Rating : TenantEntity
{
    /// <summary>The conversation being rated.</summary>
    public Guid ConversationId { get; set; }

    /// <summary>The user who submitted the rating.</summary>
    public required string UserId { get; set; }

    /// <summary>Rating score (1-5).</summary>
    public int Score { get; set; }

    /// <summary>Optional comment/review text.</summary>
    public string? Comment { get; set; }

    /// <summary>Navigation property for the conversation.</summary>
    public Conversation? Conversation { get; set; }
}
