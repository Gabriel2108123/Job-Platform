using HospitalityPlatform.Audit.Entities;
using HospitalityPlatform.Documents.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Documents.Services;

/// <summary>
/// Interface for documents database context.
/// Breaks circular dependencies by providing abstraction for DB access.
/// </summary>
public interface IDocumentsDbContext
{
    DbSet<Document> Documents { get; }
    DbSet<DocumentAccess> DocumentAccesses { get; }
    DbSet<DocumentRequest> DocumentRequests { get; }
    DbSet<DocumentShareGrant> DocumentShareGrants { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task SaveAuditLogAsync(AuditLog auditLog);
}
