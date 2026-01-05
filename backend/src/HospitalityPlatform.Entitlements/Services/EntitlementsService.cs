using HospitalityPlatform.Entitlements.DTOs;
using HospitalityPlatform.Entitlements.Entities;
using HospitalityPlatform.Entitlements.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Entitlements.Services;

public class EntitlementsService : IEntitlementsService
{
    private readonly IEntitlementsDbContext _dbContext;
    private readonly ILogger<EntitlementsService> _logger;

    // Default limits per plan type
    private static readonly Dictionary<PlanType, Dictionary<LimitType, int>> DefaultLimits = new()
    {
        {
            PlanType.Free, new()
            {
                { LimitType.JobsPostingLimit, 5 },
                { LimitType.CandidateSearchLimit, 10 },
                { LimitType.StaffSeats, 1 }
            }
        },
        {
            PlanType.Pro, new()
            {
                { LimitType.JobsPostingLimit, 50 },
                { LimitType.CandidateSearchLimit, 500 },
                { LimitType.StaffSeats, 5 }
            }
        },
        {
            PlanType.Enterprise, new()
            {
                { LimitType.JobsPostingLimit, 999999 },
                { LimitType.CandidateSearchLimit, 999999 },
                { LimitType.StaffSeats, 999999 }
            }
        }
    };

    public EntitlementsService(IEntitlementsDbContext dbContext, ILogger<EntitlementsService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<bool> HasReachedLimitAsync(Guid organizationId, LimitType limitType)
    {
        var limit = await _dbContext.EntitlementLimits
            .FirstOrDefaultAsync(l => l.OrganizationId == organizationId && l.LimitType == limitType);

        if (limit == null)
        {
            _logger.LogWarning("No entitlement limit found for organization {OrganizationId}, limit type {LimitType}",
                organizationId, limitType);
            return true; // Assume limit reached if not found
        }

        return limit.CurrentUsage >= limit.MaxLimit;
    }

    public async Task<int> GetRemainingLimitAsync(Guid organizationId, LimitType limitType)
    {
        var limit = await _dbContext.EntitlementLimits
            .FirstOrDefaultAsync(l => l.OrganizationId == organizationId && l.LimitType == limitType);

        if (limit == null)
        {
            return 0;
        }

        return Math.Max(0, limit.MaxLimit - limit.CurrentUsage);
    }

    public async Task<List<EntitlementLimitDto>> GetOrganizationEntitlementsAsync(Guid organizationId)
    {
        var entitlements = await _dbContext.EntitlementLimits
            .Where(l => l.OrganizationId == organizationId)
            .Select(l => MapToDto(l))
            .ToListAsync();

        return entitlements;
    }

    public async Task<bool> IncrementUsageAsync(Guid organizationId, LimitType limitType, int amount = 1)
    {
        var limit = await _dbContext.EntitlementLimits
            .FirstOrDefaultAsync(l => l.OrganizationId == organizationId && l.LimitType == limitType);

        if (limit == null)
        {
            _logger.LogWarning("No entitlement limit found to increment for organization {OrganizationId}, limit type {LimitType}",
                organizationId, limitType);
            return false;
        }

        limit.CurrentUsage += amount;
        _dbContext.EntitlementLimits.Update(limit);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Incremented {LimitType} usage for organization {OrganizationId} by {Amount}",
            limitType, organizationId, amount);

        return true;
    }

    public async Task<bool> ResetUsageAsync(Guid organizationId, LimitType limitType)
    {
        var limit = await _dbContext.EntitlementLimits
            .FirstOrDefaultAsync(l => l.OrganizationId == organizationId && l.LimitType == limitType);

        if (limit == null)
        {
            return false;
        }

        limit.CurrentUsage = 0;
        limit.ResetDate = DateTime.UtcNow.AddMonths(1);

        _dbContext.EntitlementLimits.Update(limit);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Reset {LimitType} usage for organization {OrganizationId}",
            limitType, organizationId);

        return true;
    }

    public async Task<bool> SetEntitlementsForPlanAsync(Guid organizationId, string planType)
    {
        if (!Enum.TryParse<PlanType>(planType, out var parsedPlanType))
        {
            throw new ArgumentException($"Invalid plan type: {planType}");
        }

        if (!DefaultLimits.TryGetValue(parsedPlanType, out var limits))
        {
            throw new InvalidOperationException($"No default limits defined for plan type: {planType}");
        }

        // Remove old entitlements
        var existingLimits = _dbContext.EntitlementLimits
            .Where(l => l.OrganizationId == organizationId)
            .ToList();

        foreach (var existing in existingLimits)
        {
            _dbContext.EntitlementLimits.Remove(existing);
        }

        // Add new entitlements
        foreach (var (limitType, maxLimit) in limits)
        {
            var entitlementLimit = new EntitlementLimit
            {
                OrganizationId = organizationId,
                LimitType = limitType,
                MaxLimit = maxLimit,
                CurrentUsage = 0,
                PlanType = parsedPlanType,
                ResetDate = DateTime.UtcNow.AddMonths(1)
            };

            _dbContext.EntitlementLimits.Add(entitlementLimit);
        }

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Set entitlements for organization {OrganizationId} with plan {PlanType}",
            organizationId, planType);

        return true;
    }

    private static EntitlementLimitDto MapToDto(EntitlementLimit limit) => new()
    {
        Id = limit.Id,
        OrganizationId = limit.OrganizationId,
        LimitType = limit.LimitType.ToString(),
        MaxLimit = limit.MaxLimit,
        CurrentUsage = limit.CurrentUsage,
        PlanType = limit.PlanType.ToString(),
        ResetDate = limit.ResetDate
    };
}
