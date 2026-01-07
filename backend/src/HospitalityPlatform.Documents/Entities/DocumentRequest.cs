using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Documents.Enums;

namespace HospitalityPlatform.Documents.Entities;

/// <summary>
/// Represents a business request for a candidate to share specific documents.
/// Used in the hiring process to request CV, certifications, etc.
/// </summary>
public class DocumentRequest : TenantEntity
{
    /// <summary>Unique identifier for the request.</summary>
    public new Guid Id { get; set; }

    /// <summary>The application this request is tied to (optional, for workflow context).</summary>
    public Guid? ApplicationId { get; set; }

    /// <summary>The candidate user ID being asked to share documents.</summary>
    public required string CandidateUserId { get; set; }

    /// <summary>The business user ID requesting the documents.</summary>
    public required string RequestedByUserId { get; set; }

    /// <summary>Type of document requested (e.g., Resume, Certification).</summary>
    public DocumentType DocumentType { get; set; }

    /// <summary>Optional description of why documents are needed.</summary>
    public string? Description { get; set; }

    /// <summary>Status of the request (Pending, Approved, Rejected, Cancelled).</summary>
    public DocumentRequestStatus Status { get; set; } = DocumentRequestStatus.Pending;

    /// <summary>When the request was created.</summary>
    public new DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>When the request was responded to (approved/rejected).</summary>
    public DateTime? RespondedAt { get; set; }

    /// <summary>User who responded to the request.</summary>
    public string? RespondedByUserId { get; set; }

    /// <summary>Reason for rejection (if rejected).</summary>
    public string? RejectionReason { get; set; }

    /// <summary>When the request expires (candidate no longer needs to respond).</summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>Whether the request is still active.</summary>
    public bool IsExpired => ExpiresAt.HasValue && ExpiresAt < DateTime.UtcNow;
}

/// <summary>
/// Status of a document request.
/// </summary>
public enum DocumentRequestStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4
}
