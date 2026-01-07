using HospitalityPlatform.Audit.Services;
using HospitalityPlatform.Documents.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Documents.Services;

/// <summary>
/// Implementation of document share service.
/// Manages share grants and authorization checks.
/// </summary>
public class DocumentShareService : IDocumentShareService
{
    private readonly IDocumentsDbContext _context;
    private readonly IAuditService _auditService;
    private readonly ILogger<DocumentShareService> _logger;

    public DocumentShareService(
        IDocumentsDbContext context,
        IAuditService auditService,
        ILogger<DocumentShareService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _auditService = auditService ?? throw new ArgumentNullException(nameof(auditService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Check if a user has access to download a document.
    /// </summary>
    public async Task<bool> UserHasAccessAsync(Guid documentId, string userId, Guid? applicationId = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        var query = _context.DocumentShareGrants
            .Where(sg => sg.DocumentId == documentId && sg.BusinessUserId == userId && sg.IsActive);

        if (applicationId.HasValue)
        {
            query = query.Where(sg => sg.ApplicationId == null || sg.ApplicationId == applicationId);
        }

        var hasAccess = await query.AnyAsync();

        _logger.LogInformation(
            "Document access check: DocumentId={DocumentId}, UserId={UserId}, ApplicationId={ApplicationId}, HasAccess={HasAccess}",
            documentId, userId, applicationId, hasAccess);

        return hasAccess;
    }

    /// <summary>
    /// Grant explicit access to a document.
    /// </summary>
    public async Task<Guid> GrantAccessAsync(
        Guid documentId,
        string candidateUserId,
        string businessUserId,
        Guid? applicationId = null,
        Guid? documentRequestId = null)
    {
        if (string.IsNullOrWhiteSpace(candidateUserId) || string.IsNullOrWhiteSpace(businessUserId))
        {
            throw new ArgumentException("User IDs cannot be empty");
        }

        // Check if document exists and belongs to candidate
        var document = await _context.Documents.FindAsync(documentId)
            ?? throw new KeyNotFoundException($"Document {documentId} not found");

        if (document.UploadedByUserId != candidateUserId)
        {
            throw new UnauthorizedAccessException("Only the document owner can grant access");
        }

        // Check if grant already exists
        var existingGrant = await _context.DocumentShareGrants
            .Where(sg => sg.DocumentId == documentId && sg.BusinessUserId == businessUserId)
            .FirstOrDefaultAsync();

        if (existingGrant?.IsActive == true)
        {
            _logger.LogWarning(
                "Share grant already exists and is active. DocumentId={DocumentId}, CandidateId={CandidateId}, BusinessId={BusinessId}",
                documentId, candidateUserId, businessUserId);
            return existingGrant.Id;
        }

        // Create new grant
        var grant = new DocumentShareGrant
        {
            Id = Guid.NewGuid(),
            DocumentId = documentId,
            CandidateUserId = candidateUserId,
            BusinessUserId = businessUserId,
            ApplicationId = applicationId,
            DocumentRequestId = documentRequestId,
            GrantedAt = DateTime.UtcNow,
            OrganizationId = document.OrganizationId
        };

        _context.DocumentShareGrants.Add(grant);
        await _context.SaveChangesAsync();

        // Audit log
        await _auditService.LogAsync(
            action: "DocumentAccessGranted",
            entityType: "DocumentShareGrant",
            entityId: grant.Id.ToString(),
            details: new
            {
                DocumentId = documentId,
                CandidateUserId = candidateUserId,
                BusinessUserId = businessUserId,
                ApplicationId = applicationId,
                DocumentRequestId = documentRequestId
            },
            userId: candidateUserId,
            organizationId: document.OrganizationId
        );

        _logger.LogInformation(
            "Share grant created. GrantId={GrantId}, DocumentId={DocumentId}, CandidateId={CandidateId}, BusinessId={BusinessId}",
            grant.Id, documentId, candidateUserId, businessUserId);

        return grant.Id;
    }

    /// <summary>
    /// Revoke access to a document.
    /// </summary>
    public async Task RevokeAccessAsync(Guid documentId, string businessUserId, string revokedByUserId, string? reason = null)
    {
        if (string.IsNullOrWhiteSpace(businessUserId) || string.IsNullOrWhiteSpace(revokedByUserId))
        {
            throw new ArgumentException("User IDs cannot be empty");
        }

        var grant = await _context.DocumentShareGrants
            .Where(sg => sg.DocumentId == documentId && sg.BusinessUserId == businessUserId && sg.IsActive)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"No active share grant found for document {documentId} and user {businessUserId}");

        grant.RevokedAt = DateTime.UtcNow;
        grant.RevokedByUserId = revokedByUserId;
        grant.RevocationReason = reason;

        await _context.SaveChangesAsync();

        // Audit log
        await _auditService.LogAsync(
            action: "DocumentAccessRevoked",
            entityType: "DocumentShareGrant",
            entityId: grant.Id.ToString(),
            details: new
            {
                DocumentId = documentId,
                BusinessUserId = businessUserId,
                RevokedByUserId = revokedByUserId,
                Reason = reason
            },
            userId: revokedByUserId,
            organizationId: grant.OrganizationId
        );

        _logger.LogInformation(
            "Share grant revoked. GrantId={GrantId}, DocumentId={DocumentId}, BusinessId={BusinessId}, RevokedBy={RevokedBy}",
            grant.Id, documentId, businessUserId, revokedByUserId);
    }
}
