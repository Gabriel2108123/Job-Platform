using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Jobs.Services;
using HospitalityPlatform.Billing.Entities;
using HospitalityPlatform.Billing.Services;
using HospitalityPlatform.Entitlements.Entities;
using HospitalityPlatform.Entitlements.Services;
using HospitalityPlatform.Audit.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Database;

/// <summary>
/// Application database context with Identity and custom entities
/// </summary>
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>, IJobsDbContext, IBillingDbContext, IEntitlementsDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Organization> Organizations { get; set; }
    public DbSet<Job> Jobs { get; set; }
    public DbSet<Application> Applications { get; set; }
    public DbSet<PreHireConfirmation> PreHireConfirmations { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    
    // Billing DbSets
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<WebhookEvent> WebhookEvents { get; set; }
    public DbSet<Plan> Plans { get; set; }
    
    // Entitlements DbSets
    public DbSet<EntitlementLimit> EntitlementLimits { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure Organization
        builder.Entity<Organization>(entity =>
        {
            entity.ToTable("Organizations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasIndex(e => e.Name);
        });

        // Configure ApplicationUser
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("Users");
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.LastName).HasMaxLength(100);
            
            entity.HasOne(e => e.Organization)
                .WithMany(o => o.Users)
                .HasForeignKey(e => e.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure ApplicationRole
        builder.Entity<ApplicationRole>(entity =>
        {
            entity.ToTable("Roles");
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // Configure Job
        builder.Entity<Job>(entity =>
        {
            entity.ToTable("Jobs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Location).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PostalCode).HasMaxLength(20);
            entity.Property(e => e.SalaryCurrency).HasMaxLength(3);
            entity.Property(e => e.RequiredQualifications).HasMaxLength(1000);
            entity.Property(e => e.Benefits).HasMaxLength(2000);
            entity.Property(e => e.CreatedByUserId).IsRequired();
            
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.PublishedAt);
            entity.HasIndex(e => e.PostalCode);
            entity.HasIndex(e => new { e.Status, e.PublishedAt });
        });

        // Configure Application
        builder.Entity<Application>(entity =>
        {
            entity.ToTable("Applications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CoverLetter).HasMaxLength(2000);
            
            entity.HasOne(e => e.Job)
                .WithMany()
                .HasForeignKey(e => e.JobId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasIndex(e => e.JobId);
            entity.HasIndex(e => e.CandidateId);
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.JobId, e.CandidateId }).IsUnique();
            entity.HasIndex(e => e.AppliedAt);
            entity.HasIndex(e => new { e.JobId, e.Status });
        });

        // Configure PreHireConfirmation
        builder.Entity<PreHireConfirmation>(entity =>
        {
            entity.ToTable("PreHireConfirmations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ConfirmationText).HasMaxLength(1000);
            
            entity.HasOne(e => e.Application)
                .WithMany()
                .HasForeignKey(e => e.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.ConfirmedAt);
            entity.HasIndex(e => e.RightToWorkConfirmed);
        });

        // Configure AuditLog
        builder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityId).HasMaxLength(100);
            entity.Property(e => e.Details).HasColumnType("jsonb");
            
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
        });

        // Configure Subscription
        builder.Entity<Subscription>(entity =>
        {
            entity.ToTable("Subscriptions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StripeSubscriptionId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.StripeCustomerId).IsRequired().HasMaxLength(100);
            
            entity.HasIndex(e => e.OrganizationId).IsUnique();
            entity.HasIndex(e => e.StripeSubscriptionId);
            entity.HasIndex(e => e.Status);
        });

        // Configure WebhookEvent
        builder.Entity<WebhookEvent>(entity =>
        {
            entity.ToTable("WebhookEvents");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StripeEventId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EventType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Payload).IsRequired();
            
            entity.HasIndex(e => e.StripeEventId).IsUnique();
            entity.HasIndex(e => e.IsProcessed);
            entity.HasIndex(e => e.ReceivedAt);
        });

        // Configure Plan
        builder.Entity<Plan>(entity =>
        {
            entity.ToTable("Plans");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.StripeProductId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.StripePriceId).IsRequired().HasMaxLength(100);
            
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.IsActive);
        });

        // Configure EntitlementLimit
        builder.Entity<EntitlementLimit>(entity =>
        {
            entity.ToTable("EntitlementLimits");
            entity.HasKey(e => e.Id);
            
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => new { e.OrganizationId, e.LimitType }).IsUnique();
            entity.HasIndex(e => e.PlanType);
        });

        // Rename Identity tables
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
    }
}
