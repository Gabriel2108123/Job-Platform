namespace HospitalityPlatform.Documents.Entities;

/// <summary>
/// Represents access control for a document at the application level.
/// Enforces per-application sharing rules.
/// </summary>
public class DocumentAccess
{
    /// <summary>Unique identifier for the access record.</summary>
    public Guid Id { get; set; }

    /// <summary>The document being shared.</summary>
    public Guid DocumentId { get; set; }

    /// <summary>The application this document is shared with.</summary>
    public Guid ApplicationId { get; set; }

    /// <summary>The user ID who granted access.</summary>
    public required string GrantedByUserId { get; set; }

    /// <summary>Timestamp when access was granted.</summary>
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Timestamp when access was revoked (if any).</summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>User who revoked the access.</summary>
    public string? RevokedByUserId { get; set; }

    /// <summary>Whether this access rule is currently active.</summary>
    public bool IsActive => RevokedAt == null;

    /// <summary>Navigation property for the document.</summary>
    public Document Document { get; set; } = null!;
}
