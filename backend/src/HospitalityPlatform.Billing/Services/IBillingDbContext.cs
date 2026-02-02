using HospitalityPlatform.Billing.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Billing.Services;

/// <summary>
/// Interface for database access in Billing module (breaks circular dependencies)
/// </summary>
public interface IBillingDbContext
{
    DbSet<Subscription> Subscriptions { get; }
    DbSet<WebhookEvent> WebhookEvents { get; }
    DbSet<Plan> Plans { get; }
    DbSet<OrganizationCredit> OrganizationCredits { get; }
    DbSet<OutreachActivity> OutreachActivities { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
