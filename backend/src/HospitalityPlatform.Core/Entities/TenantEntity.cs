namespace HospitalityPlatform.Core.Entities;

/// <summary>
/// Base entity for tenant-scoped entities
/// </summary>
public abstract class TenantEntity : BaseEntity
{
    public Guid OrganizationId { get; set; }
}
