using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Documents.Entities;

/// <summary>
/// Represents an explicit share grant: candidate approves sharing a document with a business.
/// This is the authorization mechanism - no access without an active share grant.
/// </summary>
public class DocumentShareGrant : TenantEntity
{
    /// <summary>Unique identifier for the share grant.</summary>
    public new Guid Id { get; set; }

    /// <summary>The document being shared.</summary>
    public Guid DocumentId { get; set; }

    /// <summary>The candidate who owns the document.</summary>
    public required string CandidateUserId { get; set; }

    /// <summary>The business user ID receiving access.</summary>
    public required string BusinessUserId { get; set; }

    /// <summary>Optional: the application this share is tied to.</summary>
    public Guid? ApplicationId { get; set; }

    /// <summary>Optional: the document request this grant fulfills.</summary>
    public Guid? DocumentRequestId { get; set; }

    /// <summary>When the share grant was created (candidate approved).</summary>
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    /// <summary>When the share grant expires (if at all).</summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>When the share was revoked (if at all).</summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>User who revoked the access.</summary>
    public string? RevokedByUserId { get; set; }

    /// <summary>Reason for revocation.</summary>
    public string? RevocationReason { get; set; }

    /// <summary>Whether this grant is currently active.</summary>
    public bool IsActive => RevokedAt == null && (!ExpiresAt.HasValue || ExpiresAt > DateTime.UtcNow);

    // Navigation properties
    public Document? Document { get; set; }
    public DocumentRequest? DocumentRequest { get; set; }
}
