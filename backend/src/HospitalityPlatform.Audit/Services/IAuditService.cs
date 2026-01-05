using HospitalityPlatform.Audit.Entities;

namespace HospitalityPlatform.Audit.Services;

/// <summary>
/// Service interface for audit logging
/// </summary>
public interface IAuditService
{
    Task LogAsync(AuditLog auditLog, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Convenience method for logging audit events
    /// </summary>
    Task LogAsync(string action, string entityType, string entityId, object details, string userId, Guid organizationId, CancellationToken cancellationToken = default);
    
    Task<IEnumerable<AuditLog>> GetLogsAsync(Guid? userId = null, Guid? organizationId = null, 
        DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
}
