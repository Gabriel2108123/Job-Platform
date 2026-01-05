using HospitalityPlatform.Entitlements.DTOs;
using HospitalityPlatform.Entitlements.Enums;

namespace HospitalityPlatform.Entitlements.Services;

public interface IEntitlementsService
{
    /// <summary>
    /// Check if organization has reached limit for a specific limit type
    /// </summary>
    Task<bool> HasReachedLimitAsync(Guid organizationId, LimitType limitType);
    
    /// <summary>
    /// Get remaining usage for a limit type
    /// </summary>
    Task<int> GetRemainingLimitAsync(Guid organizationId, LimitType limitType);
    
    /// <summary>
    /// Get all entitlements for organization
    /// </summary>
    Task<List<EntitlementLimitDto>> GetOrganizationEntitlementsAsync(Guid organizationId);
    
    /// <summary>
    /// Increment usage for a limit type
    /// </summary>
    Task<bool> IncrementUsageAsync(Guid organizationId, LimitType limitType, int amount = 1);
    
    /// <summary>
    /// Reset usage for a limit type
    /// </summary>
    Task<bool> ResetUsageAsync(Guid organizationId, LimitType limitType);
    
    /// <summary>
    /// Set entitlements based on subscription plan
    /// </summary>
    Task<bool> SetEntitlementsForPlanAsync(Guid organizationId, string planType);
}
