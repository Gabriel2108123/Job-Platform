using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Audit.Entities;

/// <summary>
/// Append-only audit log entry for sensitive actions.
/// </summary>
public class AuditLog : BaseEntity
{
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
