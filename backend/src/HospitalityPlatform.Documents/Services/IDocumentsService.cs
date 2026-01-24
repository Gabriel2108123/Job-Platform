using HospitalityPlatform.Documents.DTOs;
using HospitalityPlatform.Documents.Entities;

namespace HospitalityPlatform.Documents.Services;

/// <summary>
/// Interface for document management service.
/// Handles S3 uploads with presigned URLs, per-application sharing rules, and audit logging.
/// </summary>
public interface IDocumentsService
{
    /// <summary>Create document upload request and generate presigned URL.</summary>
    Task<PresignedUrlDto> CreateUploadAsync(Guid organizationId, CreateDocumentUploadDto dto, string userId);

    /// <summary>Get a document by ID with organization isolation.</summary>
    Task<DocumentDto?> GetDocumentAsync(Guid organizationId, Guid documentId);

    /// <summary>Get all documents uploaded by user in organization.</summary>
    Task<PagedResult<DocumentDto>> GetUserDocumentsAsync(Guid organizationId, string userId, int pageNumber = 1, int pageSize = 10);

    /// <summary>Get all documents shared with an application.</summary>
    Task<PagedResult<DocumentDto>> GetApplicationDocumentsAsync(Guid organizationId, Guid applicationId, int pageNumber = 1, int pageSize = 10);

    /// <summary>Share a document with an application.</summary>
    Task<DocumentAccessDto> ShareDocumentAsync(Guid organizationId, Guid documentId, ShareDocumentDto dto, string userId);

    /// <summary>Revoke document access from an application.</summary>
    Task RevokeAccessAsync(Guid organizationId, Guid accessId, string userId);

    /// <summary>Get access rules for a document.</summary>
    Task<List<DocumentAccessDto>> GetAccessRulesAsync(Guid organizationId, Guid documentId);

    /// <summary>Generate presigned URL for downloading a document (with access check). Optionally force inline.</summary>
    Task<DownloadUrlDto> GetDownloadUrlAsync(Guid organizationId, Guid documentId, Guid? applicationId, string userId, bool inline = false);

    /// <summary>Delete a document (soft delete).</summary>
    Task DeleteDocumentAsync(Guid organizationId, Guid documentId, string userId);

    /// <summary>Verify user has access to document (for download).</summary>
    Task<bool> UserHasAccessToDocumentAsync(Guid organizationId, Guid documentId, Guid? applicationId, string userId);

    /// <summary>Complete document upload (called after S3 upload succeeds).</summary>
    Task<DocumentDto> CompleteUploadAsync(Guid organizationId, Guid documentId, string s3Key, long fileSizeBytes);
}
