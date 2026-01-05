using HospitalityPlatform.Audit.Entities;

namespace HospitalityPlatform.Audit.Services;

/// <summary>
/// Service interface for audit logging
/// </summary>
public interface IAuditService
{
    Task LogAsync(AuditLog auditLog, CancellationToken cancellationToken = default);
    Task<IEnumerable<AuditLog>> GetLogsAsync(Guid? userId = null, Guid? organizationId = null, 
        DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
}
