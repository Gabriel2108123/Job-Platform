using HospitalityPlatform.Audit.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Audit.Services;

public class AuditService : IAuditService
{
    private readonly DbContext _context;
    private readonly ILogger<AuditService> _logger;

    public AuditService(DbContext context, ILogger<AuditService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogAsync(AuditLog auditLog, CancellationToken cancellationToken = default)
    {
        _context.Set<AuditLog>().Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogDebug("Audit logged: {Action} on {EntityType} {EntityId}", auditLog.Action, auditLog.EntityType, auditLog.EntityId);
    }

    /// <summary>
    /// Convenience method for logging audit events
    /// </summary>
    public async Task LogAsync(string action, string entityType, string entityId, object details, string userId, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var userIdGuid = Guid.TryParse(userId, out var parsed) ? parsed : Guid.Empty;
        
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = System.Text.Json.JsonSerializer.Serialize(details),
            UserId = userIdGuid,
            UserName = userId,
            OrganizationId = organizationId,
            Timestamp = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await LogAsync(auditLog, cancellationToken);
    }

    public async Task<IEnumerable<AuditLog>> GetLogsAsync(Guid? userId = null, Guid? organizationId = null, 
        DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Set<AuditLog>().AsQueryable();

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            query = query.Where(x => x.UserId == userId.Value);
        }

        if (organizationId.HasValue && organizationId.Value != Guid.Empty)
        {
            query = query.Where(x => x.OrganizationId == organizationId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(x => x.Timestamp >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(x => x.Timestamp <= endDate.Value);
        }

        return await query.OrderByDescending(x => x.Timestamp).ToListAsync(cancellationToken);
    }
}
