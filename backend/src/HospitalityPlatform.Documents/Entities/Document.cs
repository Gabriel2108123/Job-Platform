using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Documents.Enums;

namespace HospitalityPlatform.Documents.Entities;

/// <summary>
/// Represents a document uploaded by a user.
/// Documents have per-application sharing rules enforced by DocumentAccess records.
/// </summary>
public class Document : TenantEntity
{
    /// <summary>Unique identifier for the document.</summary>
    public new Guid Id { get; set; }

    /// <summary>Original filename as uploaded by user.</summary>
    public required string FileName { get; set; }

    /// <summary>S3 object key for the document.</summary>
    public required string S3Key { get; set; }

    /// <summary>File size in bytes.</summary>
    public long FileSizeBytes { get; set; }

    /// <summary>MIME type of the document (e.g., application/pdf).</summary>
    public required string ContentType { get; set; }

    /// <summary>The user ID who uploaded the document.</summary>
    public required string UploadedByUserId { get; set; }

    /// <summary>Timestamp when the document was uploaded.</summary>
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Timestamp when the document was last accessed.</summary>
    public DateTime? LastAccessedAt { get; set; }

    /// <summary>Whether the document has been deleted (soft delete).</summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>Timestamp when the document was deleted.</summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>User who deleted the document.</summary>
    public string? DeletedByUserId { get; set; }

    /// <summary>The explicitly declared type of the document (allowlisted).</summary>
    public DocumentType DocumentType { get; set; }

    /// <summary>Expected date when the document should be purged for compliance.</summary>
    public DateTime? RetentionDate { get; set; }

    /// <summary>Navigation property for access rules.</summary>
    public ICollection<DocumentAccess> AccessRules { get; set; } = [];
}

