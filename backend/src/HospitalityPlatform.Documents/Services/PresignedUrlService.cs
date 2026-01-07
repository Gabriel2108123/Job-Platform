using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Documents.Services;

/// <summary>
/// Implementation of presigned URL service using AWS S3.
/// </summary>
public class PresignedUrlService : IPresignedUrlService
{
    private readonly IAmazonS3 _s3Client;
    private readonly ILogger<PresignedUrlService> _logger;
    private readonly string _bucketName;

    public PresignedUrlService(
        IAmazonS3 s3Client,
        ILogger<PresignedUrlService> logger,
        string bucketName = "hospitality-platform-documents")
    {
        _s3Client = s3Client ?? throw new ArgumentNullException(nameof(s3Client));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _bucketName = bucketName ?? "hospitality-platform-documents";
    }

    /// <summary>
    /// Generate a presigned upload URL for a document.
    /// </summary>
    public Task<string> GenerateUploadUrlAsync(Guid documentId, string fileName, int expiryMinutes = 15)
    {
        if (documentId == Guid.Empty || string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException("DocumentId and FileName cannot be empty");
        }

        try
        {
            // S3 key format: documents/{documentId}/{fileName}
            var s3Key = $"documents/{documentId:N}/{Uri.EscapeDataString(fileName)}";

            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = s3Key,
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
                Verb = HttpVerb.PUT,
                ContentType = "application/octet-stream"
            };

            var presignedUrl = _s3Client.GetPreSignedURL(request);

            _logger.LogInformation(
                "Generated presigned upload URL. DocumentId={DocumentId}, S3Key={S3Key}, ExpiryMinutes={ExpiryMinutes}",
                documentId, s3Key, expiryMinutes);

            return Task.FromResult(presignedUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate presigned upload URL. DocumentId={DocumentId}, FileName={FileName}", documentId, fileName);
            throw;
        }
    }

    /// <summary>
    /// Generate a presigned download URL for a document.
    /// </summary>
    public Task<string> GenerateDownloadUrlAsync(Guid documentId, int expiryMinutes = 60)
    {
        if (documentId == Guid.Empty)
        {
            throw new ArgumentException("DocumentId cannot be empty");
        }

        try
        {
            // Retrieve document to get S3 key
            // Note: In production, this would fetch from DB
            // For now, we'll use a standard key format
            var s3Key = $"documents/{documentId:N}/*";

            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = s3Key,
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
                Verb = HttpVerb.GET
            };

            var presignedUrl = _s3Client.GetPreSignedURL(request);

            _logger.LogInformation(
                "Generated presigned download URL. DocumentId={DocumentId}, ExpiryMinutes={ExpiryMinutes}",
                documentId, expiryMinutes);

            return Task.FromResult(presignedUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate presigned download URL. DocumentId={DocumentId}", documentId);
            throw;
        }
    }
}
