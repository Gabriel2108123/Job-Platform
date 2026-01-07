using HospitalityPlatform.Api.DTOs;
using HospitalityPlatform.Audit.Entities;

namespace HospitalityPlatform.Api.Services;

/// <summary>
/// Admin service for platform-wide management with strict authorization and audit logging.
/// All actions are audit-logged and operation is fail-safe.
/// </summary>
public interface IAdminService
{
    // Users
    Task<AdminUsersPagedDto> GetUsersAsync(int pageNumber = 1, int pageSize = 20);
    Task<AdminUserDto?> GetUserAsync(Guid userId);
    Task SuspendUserAsync(Guid userId, SuspendUserDto dto, Guid adminId, string? adminName = null);
    Task UnsuspendUserAsync(Guid userId, Guid adminId, string? adminName = null);

    // Organizations
    Task<AdminOrganizationsPagedDto> GetOrganizationsAsync(int pageNumber = 1, int pageSize = 20);
    Task<AdminOrganizationDto?> GetOrganizationAsync(Guid organizationId);
    Task SuspendOrganizationAsync(Guid organizationId, SuspendOrganizationDto dto, Guid adminId, string? adminName = null);
    Task UnsuspendOrganizationAsync(Guid organizationId, Guid adminId, string? adminName = null);

    // Subscriptions (read-only)
    Task<AdminSubscriptionsPagedDto> GetSubscriptionsAsync(int pageNumber = 1, int pageSize = 20);
    Task<AdminSubscriptionDto?> GetSubscriptionAsync(Guid subscriptionId);
    Task<List<AdminSubscriptionDto>> GetSubscriptionsByStatusAsync(string status);

    // Metrics
    Task<PlatformMetricsDto> GetPlatformMetricsAsync();

    // Audit Logs
    Task<AdminAuditLogsPagedDto> GetAuditLogsAsync(int pageNumber = 1, int pageSize = 50);
    Task<AdminAuditLogsPagedDto> GetAuditLogsByActionAsync(string action, int pageNumber = 1, int pageSize = 50);
    Task<AdminAuditLogsPagedDto> GetAuditLogsByUserAsync(Guid userId, int pageNumber = 1, int pageSize = 50);
    Task<AdminAuditLogsPagedDto> GetAuditLogsByOrganizationAsync(Guid organizationId, int pageNumber = 1, int pageSize = 50);
}
