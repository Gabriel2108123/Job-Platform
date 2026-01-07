using HospitalityPlatform.Api.DTOs;
using HospitalityPlatform.Audit.Entities;
using HospitalityPlatform.Billing.Entities;
using HospitalityPlatform.Database;
using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Jobs.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Api.Services;

/// <summary>
/// Implementation of admin service with comprehensive audit logging and soft suspension.
/// </summary>
public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<AdminService> _logger;

    public AdminService(ApplicationDbContext dbContext, ILogger<AdminService> logger)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    // ==================== USERS ====================

    public async Task<AdminUsersPagedDto> GetUsersAsync(int pageNumber = 1, int pageSize = 20)
    {
        try
        {
            var query = _dbContext.Users.AsQueryable();
            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Email = u.Email ?? "",
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    OrganizationId = u.OrganizationId,
                    IsActive = u.IsActive,
                    EmailVerified = u.EmailVerified,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            return new AdminUsersPagedDto
            {
                Items = users,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            throw;
        }
    }

    public async Task<AdminUserDto?> GetUserAsync(Guid userId)
    {
        try
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return null;

            return new AdminUserDto
            {
                Id = user.Id,
                Email = user.Email ?? "",
                FirstName = user.FirstName,
                LastName = user.LastName,
                OrganizationId = user.OrganizationId,
                IsActive = user.IsActive,
                EmailVerified = user.EmailVerified,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", userId);
            throw;
        }
    }

    public async Task SuspendUserAsync(Guid userId, SuspendUserDto dto, Guid adminId, string? adminName = null)
    {
        try
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            if (!user.IsActive)
                throw new InvalidOperationException("User is already suspended");

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            // Audit log
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                Action = "UserSuspended",
                EntityType = "User",
                EntityId = userId.ToString(),
                UserId = adminId,
                UserName = adminName,
                Details = $"User suspended. Reason: {dto.Reason}",
                Timestamp = DateTime.UtcNow
            };
            _dbContext.AuditLogs.Add(auditLog);

            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("User {UserId} suspended by admin {AdminId}. Reason: {Reason}", userId, adminId, dto.Reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suspending user {UserId}", userId);
            throw;
        }
    }

    public async Task UnsuspendUserAsync(Guid userId, Guid adminId, string? adminName = null)
    {
        try
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            if (user.IsActive)
                throw new InvalidOperationException("User is not suspended");

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            // Audit log
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                Action = "UserUnsuspended",
                EntityType = "User",
                EntityId = userId.ToString(),
                UserId = adminId,
                UserName = adminName,
                Details = "User unsuspended",
                Timestamp = DateTime.UtcNow
            };
            _dbContext.AuditLogs.Add(auditLog);

            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("User {UserId} unsuspended by admin {AdminId}", userId, adminId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unsuspending user {UserId}", userId);
            throw;
        }
    }

    // ==================== ORGANIZATIONS ====================

    public async Task<AdminOrganizationsPagedDto> GetOrganizationsAsync(int pageNumber = 1, int pageSize = 20)
    {
        try
        {
            var query = _dbContext.Organizations
                .Include(o => o.Users)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var organizations = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new AdminOrganizationDto
                {
                    Id = o.Id,
                    Name = o.Name,
                    Description = o.Description,
                    IsActive = o.IsActive,
                    UserCount = o.Users.Count,
                    JobCount = _dbContext.Jobs.Count(j => j.OrganizationId == o.Id),
                    SubscriptionStatus = _dbContext.Subscriptions
                        .Where(s => s.OrganizationId == o.Id)
                        .Select(s => s.Status.ToString())
                        .FirstOrDefault(),
                    CreatedAt = o.CreatedAt
                })
                .ToListAsync();

            return new AdminOrganizationsPagedDto
            {
                Items = organizations,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving organizations");
            throw;
        }
    }

    public async Task<AdminOrganizationDto?> GetOrganizationAsync(Guid organizationId)
    {
        try
        {
            var org = await _dbContext.Organizations
                .Include(o => o.Users)
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (org == null)
                return null;

            return new AdminOrganizationDto
            {
                Id = org.Id,
                Name = org.Name,
                Description = org.Description,
                IsActive = org.IsActive,
                UserCount = org.Users.Count,
                JobCount = await _dbContext.Jobs.CountAsync(j => j.OrganizationId == org.Id),
                SubscriptionStatus = await _dbContext.Subscriptions
                    .Where(s => s.OrganizationId == org.Id)
                    .Select(s => s.Status.ToString())
                    .FirstOrDefaultAsync(),
                CreatedAt = org.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving organization {OrgId}", organizationId);
            throw;
        }
    }

    public async Task SuspendOrganizationAsync(Guid organizationId, SuspendOrganizationDto dto, Guid adminId, string? adminName = null)
    {
        try
        {
            var org = await _dbContext.Organizations.FirstOrDefaultAsync(o => o.Id == organizationId);
            if (org == null)
                throw new InvalidOperationException("Organization not found");

            if (!org.IsActive)
                throw new InvalidOperationException("Organization is already suspended");

            org.IsActive = false;

            // Audit log
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                Action = "OrganizationSuspended",
                EntityType = "Organization",
                EntityId = organizationId.ToString(),
                UserId = adminId,
                UserName = adminName,
                OrganizationId = organizationId,
                Details = $"Organization suspended. Reason: {dto.Reason}",
                Timestamp = DateTime.UtcNow
            };
            _dbContext.AuditLogs.Add(auditLog);

            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Organization {OrgId} suspended by admin {AdminId}. Reason: {Reason}", organizationId, adminId, dto.Reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suspending organization {OrgId}", organizationId);
            throw;
        }
    }

    public async Task UnsuspendOrganizationAsync(Guid organizationId, Guid adminId, string? adminName = null)
    {
        try
        {
            var org = await _dbContext.Organizations.FirstOrDefaultAsync(o => o.Id == organizationId);
            if (org == null)
                throw new InvalidOperationException("Organization not found");

            if (org.IsActive)
                throw new InvalidOperationException("Organization is not suspended");

            org.IsActive = true;

            // Audit log
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                Action = "OrganizationUnsuspended",
                EntityType = "Organization",
                EntityId = organizationId.ToString(),
                UserId = adminId,
                UserName = adminName,
                OrganizationId = organizationId,
                Details = "Organization unsuspended",
                Timestamp = DateTime.UtcNow
            };
            _dbContext.AuditLogs.Add(auditLog);

            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Organization {OrgId} unsuspended by admin {AdminId}", organizationId, adminId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unsuspending organization {OrgId}", organizationId);
            throw;
        }
    }

    // ==================== SUBSCRIPTIONS (Read-Only) ====================

    public async Task<AdminSubscriptionsPagedDto> GetSubscriptionsAsync(int pageNumber = 1, int pageSize = 20)
    {
        try
        {
            var subscriptions = await _dbContext.Subscriptions
                .Join(
                    _dbContext.Organizations,
                    sub => sub.OrganizationId,
                    org => org.Id,
                    (sub, org) => new { sub, org }
                )
                .OrderByDescending(x => x.sub.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AdminSubscriptionDto
                {
                    Id = x.sub.Id,
                    OrganizationId = x.sub.OrganizationId,
                    OrganizationName = x.org.Name,
                    StripeSubscriptionId = x.sub.StripeSubscriptionId,
                    StripeCustomerId = x.sub.StripeCustomerId,
                    Status = x.sub.Status.ToString(),
                    MonthlyAmount = x.sub.PriceInCents / 100m,
                    PlanName = null,  // Plan lookup deferred to maintain simplicity
                    CreatedAt = x.sub.CreatedAt,
                    CancelledAt = x.sub.CancelledAt
                })
                .ToListAsync();

            var totalCount = await _dbContext.Subscriptions.CountAsync();

            return new AdminSubscriptionsPagedDto
            {
                Items = subscriptions,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving subscriptions");
            throw;
        }
    }

    public async Task<AdminSubscriptionDto?> GetSubscriptionAsync(Guid subscriptionId)
    {
        try
        {
            var result = await _dbContext.Subscriptions
                .Join(
                    _dbContext.Organizations,
                    sub => sub.OrganizationId,
                    org => org.Id,
                    (sub, org) => new { sub, org }
                )
                .Where(x => x.sub.Id == subscriptionId)
                .Select(x => new AdminSubscriptionDto
                {
                    Id = x.sub.Id,
                    OrganizationId = x.sub.OrganizationId,
                    OrganizationName = x.org.Name,
                    StripeSubscriptionId = x.sub.StripeSubscriptionId,
                    StripeCustomerId = x.sub.StripeCustomerId,
                    Status = x.sub.Status.ToString(),
                    MonthlyAmount = x.sub.PriceInCents / 100m,
                    PlanName = null,  // Plan lookup deferred to maintain simplicity
                    CreatedAt = x.sub.CreatedAt,
                    CancelledAt = x.sub.CancelledAt
                })
                .FirstOrDefaultAsync();

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving subscription {SubId}", subscriptionId);
            throw;
        }
    }

    public async Task<List<AdminSubscriptionDto>> GetSubscriptionsByStatusAsync(string status)
    {
        try
        {
            // Parse status string to enum for comparison
            if (!Enum.TryParse<HospitalityPlatform.Billing.Enums.SubscriptionStatus>(status, ignoreCase: true, out var statusEnum))
            {
                return []; // Return empty list if status is invalid
            }

            return await _dbContext.Subscriptions
                .Join(
                    _dbContext.Organizations,
                    sub => sub.OrganizationId,
                    org => org.Id,
                    (sub, org) => new { sub, org }
                )
                .Where(x => x.sub.Status == statusEnum)
                .OrderByDescending(x => x.sub.CreatedAt)
                .Select(x => new AdminSubscriptionDto
                {
                    Id = x.sub.Id,
                    OrganizationId = x.sub.OrganizationId,
                    OrganizationName = x.org.Name,
                    StripeSubscriptionId = x.sub.StripeSubscriptionId,
                    StripeCustomerId = x.sub.StripeCustomerId,
                    Status = x.sub.Status.ToString(),
                    MonthlyAmount = x.sub.PriceInCents / 100m,
                    PlanName = null,  // Plan lookup deferred to maintain simplicity
                    CreatedAt = x.sub.CreatedAt,
                    CancelledAt = x.sub.CancelledAt
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving subscriptions by status {Status}", status);
            throw;
        }
    }

    // ==================== METRICS ====================

    public async Task<PlatformMetricsDto> GetPlatformMetricsAsync()
    {
        try
        {
            var totalUsers = await _dbContext.Users.CountAsync();
            var activeUsers = await _dbContext.Users.CountAsync(u => u.IsActive);
            var suspendedUsers = totalUsers - activeUsers;

            var totalOrgs = await _dbContext.Organizations.CountAsync();
            var activeOrgs = await _dbContext.Organizations.CountAsync(o => o.IsActive);
            var suspendedOrgs = totalOrgs - activeOrgs;

            var totalJobs = await _dbContext.Jobs.CountAsync();
            var totalApplications = await _dbContext.Applications.CountAsync();

            var totalSubs = await _dbContext.Subscriptions.CountAsync();
            var activeSubs = await _dbContext.Subscriptions.CountAsync(s => s.Status == HospitalityPlatform.Billing.Enums.SubscriptionStatus.Active);
            var pastDueSubs = await _dbContext.Subscriptions.CountAsync(s => s.Status == HospitalityPlatform.Billing.Enums.SubscriptionStatus.PastDue);
            var cancelledSubs = await _dbContext.Subscriptions.CountAsync(s => s.Status == HospitalityPlatform.Billing.Enums.SubscriptionStatus.Cancelled);

            var mrrActive = await _dbContext.Subscriptions
                .Where(s => s.Status == HospitalityPlatform.Billing.Enums.SubscriptionStatus.Active)
                .SumAsync(s => s.PriceInCents / 100m);

            var totalAuditLogs = await _dbContext.AuditLogs.CountAsync();

            return new PlatformMetricsDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                SuspendedUsers = suspendedUsers,
                TotalOrganizations = totalOrgs,
                ActiveOrganizations = activeOrgs,
                SuspendedOrganizations = suspendedOrgs,
                TotalJobs = totalJobs,
                TotalApplications = totalApplications,
                TotalSubscriptions = totalSubs,
                ActiveSubscriptions = activeSubs,
                PastDueSubscriptions = pastDueSubs,
                CancelledSubscriptions = cancelledSubs,
                MrrActive = mrrActive,
                TotalAuditLogs = totalAuditLogs
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving platform metrics");
            throw;
        }
    }

    // ==================== AUDIT LOGS ====================

    public async Task<AdminAuditLogsPagedDto> GetAuditLogsAsync(int pageNumber = 1, int pageSize = 50)
    {
        try
        {
            var query = _dbContext.AuditLogs.AsQueryable();
            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdminAuditLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    UserId = a.UserId,
                    UserName = a.UserName,
                    OrganizationId = a.OrganizationId,
                    Details = a.Details,
                    IpAddress = a.IpAddress,
                    Timestamp = a.Timestamp
                })
                .ToListAsync();

            return new AdminAuditLogsPagedDto
            {
                Items = logs,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs");
            throw;
        }
    }

    public async Task<AdminAuditLogsPagedDto> GetAuditLogsByActionAsync(string action, int pageNumber = 1, int pageSize = 50)
    {
        try
        {
            var query = _dbContext.AuditLogs.Where(a => a.Action == action);
            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdminAuditLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    UserId = a.UserId,
                    UserName = a.UserName,
                    OrganizationId = a.OrganizationId,
                    Details = a.Details,
                    IpAddress = a.IpAddress,
                    Timestamp = a.Timestamp
                })
                .ToListAsync();

            return new AdminAuditLogsPagedDto
            {
                Items = logs,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs by action {Action}", action);
            throw;
        }
    }

    public async Task<AdminAuditLogsPagedDto> GetAuditLogsByUserAsync(Guid userId, int pageNumber = 1, int pageSize = 50)
    {
        try
        {
            var query = _dbContext.AuditLogs.Where(a => a.UserId == userId);
            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdminAuditLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    UserId = a.UserId,
                    UserName = a.UserName,
                    OrganizationId = a.OrganizationId,
                    Details = a.Details,
                    IpAddress = a.IpAddress,
                    Timestamp = a.Timestamp
                })
                .ToListAsync();

            return new AdminAuditLogsPagedDto
            {
                Items = logs,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs by user {UserId}", userId);
            throw;
        }
    }

    public async Task<AdminAuditLogsPagedDto> GetAuditLogsByOrganizationAsync(Guid organizationId, int pageNumber = 1, int pageSize = 50)
    {
        try
        {
            var query = _dbContext.AuditLogs.Where(a => a.OrganizationId == organizationId);
            var totalCount = await query.CountAsync();

            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdminAuditLogDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    UserId = a.UserId,
                    UserName = a.UserName,
                    OrganizationId = a.OrganizationId,
                    Details = a.Details,
                    IpAddress = a.IpAddress,
                    Timestamp = a.Timestamp
                })
                .ToListAsync();

            return new AdminAuditLogsPagedDto
            {
                Items = logs,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs by organization {OrgId}", organizationId);
            throw;
        }
    }
}
