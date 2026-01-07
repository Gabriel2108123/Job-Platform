namespace HospitalityPlatform.Documents.Services;

/// <summary>
/// Generates presigned URLs for document uploads and downloads.
/// Abstracts S3 or Azure Blob Storage specifics.
/// </summary>
public interface IPresignedUrlService
{
    /// <summary>
    /// Generate a presigned upload URL for a document.
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="fileName">Original filename</param>
    /// <param name="expiryMinutes">URL expiry time (default 15 minutes)</param>
    /// <returns>Presigned URL for uploading to S3/Azure</returns>
    Task<string> GenerateUploadUrlAsync(Guid documentId, string fileName, int expiryMinutes = 15);

    /// <summary>
    /// Generate a presigned download URL for a document.
    /// Only issued when a valid share grant exists.
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="expiryMinutes">URL expiry time (default 60 minutes)</param>
    /// <returns>Presigned URL for downloading from S3/Azure</returns>
    Task<string> GenerateDownloadUrlAsync(Guid documentId, int expiryMinutes = 60);
}

/// <summary>
/// Manages document share grants and authorization.
/// </summary>
public interface IDocumentShareService
{
    /// <summary>
    /// Check if a user has access to download a document.
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="userId">User requesting access</param>
    /// <param name="applicationId">Optional: application context</param>
    /// <returns>True if user has active share grant</returns>
    Task<bool> UserHasAccessAsync(Guid documentId, string userId, Guid? applicationId = null);

    /// <summary>
    /// Grant explicit access to a document (candidate approves sharing).
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="candidateUserId">Document owner</param>
    /// <param name="businessUserId">Recipient</param>
    /// <param name="applicationId">Optional: application context</param>
    /// <param name="documentRequestId">Optional: request being fulfilled</param>
    /// <returns>New share grant ID</returns>
    Task<Guid> GrantAccessAsync(
        Guid documentId,
        string candidateUserId,
        string businessUserId,
        Guid? applicationId = null,
        Guid? documentRequestId = null);

    /// <summary>
    /// Revoke access to a document.
    /// </summary>
    /// <param name="documentId">Document ID</param>
    /// <param name="businessUserId">User losing access</param>
    /// <param name="revokedByUserId">User revoking access</param>
    /// <param name="reason">Revocation reason</param>
    Task RevokeAccessAsync(Guid documentId, string businessUserId, string revokedByUserId, string? reason = null);
}
