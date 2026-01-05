using HospitalityPlatform.Entitlements.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Entitlements.Services;

/// <summary>
/// Interface for database access in Entitlements module (breaks circular dependencies)
/// </summary>
public interface IEntitlementsDbContext
{
    DbSet<EntitlementLimit> EntitlementLimits { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
