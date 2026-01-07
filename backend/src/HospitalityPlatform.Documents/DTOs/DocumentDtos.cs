namespace HospitalityPlatform.Documents.DTOs;

/// <summary>DTO for creating a document upload request (generates presigned URL).</summary>
public class CreateDocumentUploadDto
{
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public long FileSizeBytes { get; set; }
}

/// <summary>DTO for sharing a document with an application.</summary>
public class ShareDocumentDto
{
    public Guid ApplicationId { get; set; }
}

/// <summary>DTO for the presigned URL response.</summary>
public class PresignedUrlDto
{
    public Guid DocumentId { get; set; }
    public required string PresignedUrl { get; set; }
    public required string S3Key { get; set; }
    public int ExpirationSeconds { get; set; } = 3600; // 1 hour
}

/// <summary>DTO for the document response.</summary>
public class DocumentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = null!;
    public long FileSizeBytes { get; set; }
    public string ContentType { get; set; } = null!;
    public string UploadedByUserId { get; set; } = null!;
    public DateTime UploadedAt { get; set; }
    public DateTime? LastAccessedAt { get; set; }
    public int AccessRuleCount { get; set; }
}

/// <summary>DTO for document access rule.</summary>
public class DocumentAccessDto
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public Guid ApplicationId { get; set; }
    public string GrantedByUserId { get; set; } = null!;
    public DateTime GrantedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>DTO for presigned download URL.</summary>
public class DownloadUrlDto
{
    public required string Url { get; set; }
    public int ExpirationSeconds { get; set; } = 3600; // 1 hour
}

/// <summary>DTO for paginated results.</summary>
public class PagedResult<T>
{
    public required List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
