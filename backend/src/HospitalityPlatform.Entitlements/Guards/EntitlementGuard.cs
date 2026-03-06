using HospitalityPlatform.Entitlements.Enums;
using HospitalityPlatform.Entitlements.Exceptions;
using HospitalityPlatform.Entitlements.Services;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Entitlements.Guards;

/// <summary>
/// Central guard for enforcing entitlement limits.
/// Throws EntitlementException if a limit is exceeded.
/// </summary>
public class EntitlementGuard : IEntitlementGuard
{
    private readonly IEntitlementsService _entitlementsService;
    private readonly ILogger<EntitlementGuard> _logger;

    public EntitlementGuard(IEntitlementsService entitlementsService, ILogger<EntitlementGuard> logger)
    {
        _entitlementsService = entitlementsService;
        _logger = logger;
    }

    public async Task MustHaveAvailableLimitAsync(Guid organizationId, LimitType limitType)
    {
        var isReached = await _entitlementsService.HasReachedLimitAsync(organizationId, limitType);
        
        if (isReached)
        {
            var remaining = await _entitlementsService.GetRemainingLimitAsync(organizationId, limitType);
            var entitlements = await _entitlementsService.GetOrganizationEntitlementsAsync(organizationId);
            var specificLimit = entitlements.FirstOrDefault(e => e.LimitType == limitType.ToString());
            
            _logger.LogWarning("Entitlement limit {LimitType} reached for organization {OrganizationId}", 
                limitType, organizationId);

            throw new EntitlementException(
                $"Limit for {limitType} has been reached. Please upgrade your plan to increase limits.",
                limitType.ToString(),
                specificLimit?.CurrentUsage ?? 0,
                specificLimit?.MaxLimit ?? 0
            );
        }
    }
}

public interface IEntitlementGuard
{
    Task MustHaveAvailableLimitAsync(Guid organizationId, LimitType limitType);
}
