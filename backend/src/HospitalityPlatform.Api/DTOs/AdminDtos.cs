namespace HospitalityPlatform.Api.DTOs;

/// <summary>
/// Admin panel DTOs for users, organizations, subscriptions, metrics, and audit logs
/// </summary>
/// 
// User Management DTOs
public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid? OrganizationId { get; set; }
    public bool IsActive { get; set; }
    public bool EmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class AdminUsersPagedDto
{
    public List<AdminUserDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

public class SuspendUserDto
{
    public string Reason { get; set; } = null!;
}

// Organization Management DTOs
public class AdminOrganizationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int UserCount { get; set; }
    public int JobCount { get; set; }
    public string? SubscriptionStatus { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminOrganizationsPagedDto
{
    public List<AdminOrganizationDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

public class SuspendOrganizationDto
{
    public string Reason { get; set; } = null!;
}

// Subscription DTOs
public class AdminSubscriptionDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = null!;
    public string? StripeSubscriptionId { get; set; }
    public string? StripeCustomerId { get; set; }
    public string Status { get; set; } = null!; // active, past_due, cancelled
    public decimal MonthlyAmount { get; set; }
    public string? PlanName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
}

public class AdminSubscriptionsPagedDto
{
    public List<AdminSubscriptionDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

// Metrics DTOs
public class PlatformMetricsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int SuspendedUsers { get; set; }
    public int TotalOrganizations { get; set; }
    public int ActiveOrganizations { get; set; }
    public int SuspendedOrganizations { get; set; }
    public int TotalJobs { get; set; }
    public int TotalApplications { get; set; }
    public int TotalSubscriptions { get; set; }
    public int ActiveSubscriptions { get; set; }
    public int PastDueSubscriptions { get; set; }
    public int CancelledSubscriptions { get; set; }
    public decimal MrrActive { get; set; } // Monthly Recurring Revenue from active subs
    public int TotalAuditLogs { get; set; }
}

// Audit Log DTOs
public class AdminAuditLogDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = null!;
    public string EntityType { get; set; } = null!;
    public string? EntityId { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
}

public class AdminAuditLogsPagedDto
{
    public List<AdminAuditLogDto> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
