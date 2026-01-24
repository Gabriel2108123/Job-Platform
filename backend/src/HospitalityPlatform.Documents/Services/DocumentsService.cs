using Amazon.S3;
using Amazon.S3.Model;
using HospitalityPlatform.Audit.Entities;
using HospitalityPlatform.Documents.DTOs;
using HospitalityPlatform.Documents.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Documents.Services;

/// <summary>
/// Implementation of document service with S3 presigned URLs and access control.
/// Enforces per-application sharing rules and organization isolation.
/// </summary>
public class DocumentsService : IDocumentsService
{
    private readonly IDocumentsDbContext _dbContext;
    private readonly IAmazonS3 _s3Client;
    private readonly ILogger<DocumentsService> _logger;
    private const string BucketName = "hospitality-platform-documents";
    private const int PresignedUrlExpirationSeconds = 3600; // 1 hour

    public DocumentsService(IDocumentsDbContext dbContext, IAmazonS3 s3Client, ILogger<DocumentsService> logger)
    {
        _dbContext = dbContext;
        _s3Client = s3Client;
        _logger = logger;
    }

    public async Task<PresignedUrlDto> CreateUploadAsync(Guid organizationId, CreateDocumentUploadDto dto, string userId)
    {
        var documentId = Guid.NewGuid();
        var s3Key = $"org-{organizationId}/user-{userId}/{documentId}/{dto.FileName}";

        // Create placeholder document record (s3Key will be confirmed after upload)
        var document = new Document
        {
            Id = documentId,
            OrganizationId = organizationId,
            FileName = dto.FileName,
            S3Key = s3Key,
            FileSizeBytes = dto.FileSizeBytes,
            ContentType = dto.ContentType,
            UploadedByUserId = userId
        };

        _dbContext.Documents.Add(document);
        await LogAuditAsync(organizationId, userId, "DocumentUploadInitiated", documentId.ToString(), 
            $"Initiated upload of {dto.FileName}");
        await _dbContext.SaveChangesAsync();

        // Generate presigned URL for upload
        var request = new PutObjectRequest
        {
            BucketName = BucketName,
            Key = s3Key,
            ContentType = dto.ContentType
        };

        var presignedUrl = _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = BucketName,
            Key = s3Key,
            Expires = DateTime.UtcNow.AddSeconds(PresignedUrlExpirationSeconds),
            Verb = HttpVerb.PUT
        });

        _logger.LogInformation("Presigned upload URL generated for document {DocumentId}", documentId);

        return new PresignedUrlDto
        {
            DocumentId = documentId,
            PresignedUrl = presignedUrl,
            S3Key = s3Key,
            ExpirationSeconds = PresignedUrlExpirationSeconds
        };
    }

    public async Task<DocumentDto?> GetDocumentAsync(Guid organizationId, Guid documentId)
    {
        var document = await _dbContext.Documents
            .Where(d => d.Id == documentId && d.OrganizationId == organizationId && !d.IsDeleted)
            .FirstOrDefaultAsync();

        return document != null ? MapDocumentDto(document) : null;
    }

    public async Task<PagedResult<DocumentDto>> GetUserDocumentsAsync(Guid organizationId, string userId, int pageNumber = 1, int pageSize = 10)
    {
        var query = _dbContext.Documents
            .Where(d => d.OrganizationId == organizationId && d.UploadedByUserId == userId && !d.IsDeleted)
            .OrderByDescending(d => d.UploadedAt);

        var totalCount = await query.CountAsync();

        var documents = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = documents.Select(MapDocumentDto).ToList();

        return new PagedResult<DocumentDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<DocumentDto>> GetApplicationDocumentsAsync(Guid organizationId, Guid applicationId, int pageNumber = 1, int pageSize = 10)
    {
        var query = _dbContext.Documents
            .Where(d => d.OrganizationId == organizationId && !d.IsDeleted)
            .Join(
                _dbContext.DocumentAccesses.Where(da => da.ApplicationId == applicationId && da.IsActive),
                d => d.Id,
                da => da.DocumentId,
                (d, da) => d
            )
            .OrderByDescending(d => d.UploadedAt);

        var totalCount = await query.CountAsync();

        var documents = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = documents.Select(MapDocumentDto).ToList();

        return new PagedResult<DocumentDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<DocumentAccessDto> ShareDocumentAsync(Guid organizationId, Guid documentId, ShareDocumentDto dto, string userId)
    {
        // Verify document exists and belongs to organization
        var document = await _dbContext.Documents
            .Where(d => d.Id == documentId && d.OrganizationId == organizationId && !d.IsDeleted)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            throw new ArgumentException("Document not found.");
        }

        // Verify document uploader is the one sharing (or admin)
        if (document.UploadedByUserId != userId)
        {
            throw new InvalidOperationException("Only the document uploader can share it.");
        }

        // Check if access rule already exists and is active
        var existingAccess = await _dbContext.DocumentAccesses
            .Where(da => da.DocumentId == documentId && da.ApplicationId == dto.ApplicationId && da.IsActive)
            .FirstOrDefaultAsync();

        if (existingAccess != null)
        {
            return MapAccessDto(existingAccess);
        }

        // Create new access rule
        var access = new DocumentAccess
        {
            Id = Guid.NewGuid(),
            DocumentId = documentId,
            ApplicationId = dto.ApplicationId,
            GrantedByUserId = userId
        };

        _dbContext.DocumentAccesses.Add(access);

        await LogAuditAsync(organizationId, userId, "DocumentShared", documentId.ToString(), 
            $"Shared document with application {dto.ApplicationId}");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Document {DocumentId} shared with application {ApplicationId} by user {UserId}", 
            documentId, dto.ApplicationId, userId);

        return MapAccessDto(access);
    }

    public async Task RevokeAccessAsync(Guid organizationId, Guid accessId, string userId)
    {
        var access = await _dbContext.DocumentAccesses
            .Include(da => da.Document)
            .Where(da => da.Id == accessId && da.Document.OrganizationId == organizationId && da.IsActive)
            .FirstOrDefaultAsync();

        if (access == null)
        {
            throw new ArgumentException("Access rule not found.");
        }

        if (access.Document.UploadedByUserId != userId)
        {
            throw new InvalidOperationException("Only the document uploader can revoke access.");
        }

        access.RevokedAt = DateTime.UtcNow;
        access.RevokedByUserId = userId;

        await LogAuditAsync(organizationId, userId, "AccessRevoked", access.DocumentId.ToString(), 
            $"Revoked access from application {access.ApplicationId}");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Access revoked: {AccessId} by user {UserId}", accessId, userId);
    }

    public async Task<List<DocumentAccessDto>> GetAccessRulesAsync(Guid organizationId, Guid documentId)
    {
        // Verify document belongs to organization
        var document = await _dbContext.Documents
            .Where(d => d.Id == documentId && d.OrganizationId == organizationId)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            throw new ArgumentException("Document not found.");
        }

        var accessRules = await _dbContext.DocumentAccesses
            .Where(da => da.DocumentId == documentId)
            .Select(da => MapAccessDto(da))
            .ToListAsync();

        return accessRules;
    }

    public async Task<DownloadUrlDto> GetDownloadUrlAsync(Guid organizationId, Guid documentId, Guid? applicationId, string userId, bool inline = false)
    {
        // Verify user has access
        var hasAccess = await UserHasAccessToDocumentAsync(organizationId, documentId, applicationId, userId);
        if (!hasAccess)
        {
            throw new InvalidOperationException("User does not have access to this document.");
        }

        var document = await _dbContext.Documents
            .Where(d => d.Id == documentId && d.OrganizationId == organizationId && !d.IsDeleted)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            throw new ArgumentException("Document not found.");
        }

        // Update last accessed timestamp
        document.LastAccessedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        // Generate presigned download URL
        var request = new GetPreSignedUrlRequest
        {
            BucketName = BucketName,
            Key = document.S3Key,
            Expires = DateTime.UtcNow.AddSeconds(PresignedUrlExpirationSeconds),
            Verb = HttpVerb.GET
        };

        if (inline)
        {
            request.ResponseHeaderOverrides.ContentDisposition = "inline";
        }

        var presignedUrl = _s3Client.GetPreSignedURL(request);

        _logger.LogInformation("Download URL generated for document {DocumentId} by user {UserId}", documentId, userId);

        return new DownloadUrlDto
        {
            Url = presignedUrl,
            ExpirationSeconds = PresignedUrlExpirationSeconds
        };
    }

    public async Task DeleteDocumentAsync(Guid organizationId, Guid documentId, string userId)
    {
        var document = await _dbContext.Documents
            .Where(d => d.Id == documentId && d.OrganizationId == organizationId && !d.IsDeleted)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            throw new ArgumentException("Document not found.");
        }

        if (document.UploadedByUserId != userId)
        {
            throw new InvalidOperationException("Only the document uploader can delete it.");
        }

        document.IsDeleted = true;
        document.DeletedAt = DateTime.UtcNow;
        document.DeletedByUserId = userId;

        // Revoke all active access rules
        var activeAccess = await _dbContext.DocumentAccesses
            .Where(da => da.DocumentId == documentId && da.IsActive)
            .ToListAsync();

        foreach (var access in activeAccess)
        {
            access.RevokedAt = DateTime.UtcNow;
            access.RevokedByUserId = userId;
        }

        await LogAuditAsync(organizationId, userId, "DocumentDeleted", documentId.ToString(), 
            $"Deleted document {document.FileName}");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Document deleted: {DocumentId} by user {UserId}", documentId, userId);
    }

    public async Task<bool> UserHasAccessToDocumentAsync(Guid organizationId, Guid documentId, Guid? applicationId, string userId)
    {
        var document = await _dbContext.Documents
            .Where(d => d.Id == documentId && d.OrganizationId == organizationId && !d.IsDeleted)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            return false;
        }

        // Document uploader always has access
        if (document.UploadedByUserId == userId)
        {
            return true;
        }

        // Check if document is shared with the specified application
        if (applicationId.HasValue)
        {
            var hasAccessToApp = await _dbContext.DocumentAccesses
                .Where(da => da.DocumentId == documentId && 
                             da.ApplicationId == applicationId && 
                             da.IsActive)
                .AnyAsync();

            return hasAccessToApp;
        }

        return false;
    }

    public async Task<DocumentDto> CompleteUploadAsync(Guid organizationId, Guid documentId, string s3Key, long fileSizeBytes)
    {
        var document = await _dbContext.Documents
            .Where(d => d.Id == documentId && d.OrganizationId == organizationId && !d.IsDeleted)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            throw new ArgumentException("Document not found.");
        }

        document.S3Key = s3Key;
        document.FileSizeBytes = fileSizeBytes;

        await LogAuditAsync(organizationId, document.UploadedByUserId, "DocumentUploadCompleted", documentId.ToString(), 
            $"Completed upload of {document.FileName}");

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Document upload completed: {DocumentId}", documentId);

        return MapDocumentDto(document);
    }

    private DocumentDto MapDocumentDto(Document document)
    {
        return new DocumentDto
        {
            Id = document.Id,
            FileName = document.FileName,
            FileSizeBytes = document.FileSizeBytes,
            ContentType = document.ContentType,
            UploadedByUserId = document.UploadedByUserId,
            UploadedAt = document.UploadedAt,
            LastAccessedAt = document.LastAccessedAt,
            AccessRuleCount = document.AccessRules.Count(a => a.IsActive)
        };
    }

    private DocumentAccessDto MapAccessDto(DocumentAccess access)
    {
        return new DocumentAccessDto
        {
            Id = access.Id,
            DocumentId = access.DocumentId,
            ApplicationId = access.ApplicationId,
            GrantedByUserId = access.GrantedByUserId,
            GrantedAt = access.GrantedAt,
            RevokedAt = access.RevokedAt,
            IsActive = access.IsActive
        };
    }

    private async Task LogAuditAsync(Guid organizationId, string userId, string action, string entityId, string description)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            UserId = string.IsNullOrEmpty(userId) ? null : Guid.Parse(userId),
            Action = action,
            EntityType = "Document",
            EntityId = entityId,
            Details = description,
            Timestamp = DateTime.UtcNow,
            IpAddress = "N/A"
        };

        await _dbContext.SaveAuditLogAsync(auditLog);
    }
}
