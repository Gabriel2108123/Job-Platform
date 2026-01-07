using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Identity.Entities.Verification;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Jobs.Services;
using HospitalityPlatform.Applications.Entities;
using HospitalityPlatform.Applications.Services;
using HospitalityPlatform.Billing.Entities;
using HospitalityPlatform.Billing.Services;
using HospitalityPlatform.Entitlements.Entities;
using HospitalityPlatform.Entitlements.Services;
using HospitalityPlatform.Messaging.Entities;
using HospitalityPlatform.Messaging.Services;
using HospitalityPlatform.Documents.Entities;
using HospitalityPlatform.Documents.Services;
using HospitalityPlatform.Audit.Entities;
using HospitalityPlatform.Waitlist.Entities;
using HospitalityPlatform.Waitlist.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Database;

/// <summary>
/// Application database context with Identity and custom entities
/// </summary>
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>, IJobsDbContext, IApplicationsDbContext, IBillingDbContext, IEntitlementsDbContext, IMessagingDbContext, IDocumentsDbContext, IWaitlistDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Organization> Organizations { get; set; }
    public DbSet<Job> Jobs { get; set; }
    public DbSet<Application> Applications { get; set; }
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    
    // Billing DbSets
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<WebhookEvent> WebhookEvents { get; set; }
    public DbSet<Plan> Plans { get; set; }
    
    // Entitlements DbSets
    public DbSet<EntitlementLimit> EntitlementLimits { get; set; }
    
    // Messaging DbSets
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<ConversationParticipant> ConversationParticipants { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Rating> Ratings { get; set; }
    
    // Documents DbSets
    public DbSet<Document> Documents { get; set; }
    public DbSet<DocumentAccess> DocumentAccesses { get; set; }
    public DbSet<DocumentRequest> DocumentRequests { get; set; }
    public DbSet<DocumentShareGrant> DocumentShareGrants { get; set; }
    
    // Waitlist DbSets
    public DbSet<WaitlistEntry> WaitlistEntries { get; set; }
    
    // Identity - Verification DbSets
    public DbSet<CandidateProfile> CandidateProfiles { get; set; }
    public DbSet<EmailVerificationToken> EmailVerificationTokens { get; set; }

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
            entity.Property(e => e.EmailVerified).IsRequired().HasDefaultValue(false);
            
            entity.HasOne(e => e.Organization)
                .WithMany(o => o.Users)
                .HasForeignKey(e => e.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);
            
            entity.HasIndex(e => e.EmailVerified);
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
            entity.Property(e => e.CoverLetter).HasMaxLength(5000);
            entity.Property(e => e.CvFileUrl).HasMaxLength(500);
            entity.Property(e => e.CandidateUserId).IsRequired();
            
            entity.HasIndex(e => e.JobId);
            entity.HasIndex(e => e.CandidateUserId);
            entity.HasIndex(e => e.CurrentStatus);
            entity.HasIndex(e => new { e.JobId, e.CandidateUserId }).IsUnique();
            entity.HasIndex(e => e.AppliedAt);
            entity.HasIndex(e => new { e.JobId, e.CurrentStatus });
        });

        // Configure ApplicationStatusHistory
        builder.Entity<ApplicationStatusHistory>(entity =>
        {
            entity.ToTable("ApplicationStatusHistories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.PreHireCheckConfirmationText).HasColumnType("text");
            entity.Property(e => e.ChangedByUserId).IsRequired();
            
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.ChangedAt);
            entity.HasIndex(e => new { e.ApplicationId, e.ChangedAt });
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

        // Configure Conversation
        builder.Entity<Conversation>(entity =>
        {
            entity.ToTable("Conversations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.CreatedByUserId).IsRequired();
            
            entity.HasMany(e => e.Participants)
                .WithOne(p => p.Conversation)
                .HasForeignKey(p => p.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Messages)
                .WithOne(m => m.Conversation)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.CreatedAt);
            // Unique index: one conversation per application per organization
            entity.HasIndex(e => new { e.ApplicationId, e.OrganizationId })
                .IsUnique()
                .HasFilter("\"ApplicationId\" IS NOT NULL");
        });

        // Configure ConversationParticipant
        builder.Entity<ConversationParticipant>(entity =>
        {
            entity.ToTable("ConversationParticipants");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            
            entity.HasIndex(e => e.ConversationId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.ConversationId, e.UserId }).IsUnique();
        });

        // Configure Message
        builder.Entity<Message>(entity =>
        {
            entity.ToTable("Messages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.SentByUserId).IsRequired();
            
            entity.HasIndex(e => e.ConversationId);
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.SentAt);
            entity.HasIndex(e => new { e.ConversationId, e.SentAt });
        });

        // Configure Document
        builder.Entity<Document>(entity =>
        {
            entity.ToTable("Documents");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.S3Key).IsRequired().HasMaxLength(1024);
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.UploadedByUserId).IsRequired();
            
            entity.HasMany(e => e.AccessRules)
                .WithOne(a => a.Document)
                .HasForeignKey(a => a.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.OrganizationId);
            entity.HasIndex(e => e.UploadedByUserId);
            entity.HasIndex(e => e.UploadedAt);
            entity.HasIndex(e => new { e.OrganizationId, e.IsDeleted });
        });

        // Configure DocumentAccess
        builder.Entity<DocumentAccess>(entity =>
        {
            entity.ToTable("DocumentAccesses");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.GrantedByUserId).IsRequired();
            
            entity.HasIndex(e => e.DocumentId);
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => new { e.DocumentId, e.ApplicationId }).IsUnique();
            entity.HasIndex(e => e.GrantedAt);
        });

        // Configure DocumentRequest
        builder.Entity<DocumentRequest>(entity =>
        {
            entity.ToTable("DocumentRequests");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CandidateUserId).IsRequired();
            entity.Property(e => e.RequestedByUserId).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.RejectionReason).HasMaxLength(500);
            
            entity.HasIndex(e => e.CandidateUserId);
            entity.HasIndex(e => e.RequestedByUserId);
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.CandidateUserId, e.Status });
        });

        // Configure DocumentShareGrant
        builder.Entity<DocumentShareGrant>(entity =>
        {
            entity.ToTable("DocumentShareGrants");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CandidateUserId).IsRequired();
            entity.Property(e => e.BusinessUserId).IsRequired();
            entity.Property(e => e.RevocationReason).HasMaxLength(500);
            
            entity.HasOne(e => e.Document)
                .WithMany()
                .HasForeignKey(e => e.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.DocumentRequest)
                .WithMany()
                .HasForeignKey(e => e.DocumentRequestId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasIndex(e => e.DocumentId);
            entity.HasIndex(e => e.BusinessUserId);
            entity.HasIndex(e => e.CandidateUserId);
            entity.HasIndex(e => e.ApplicationId);
            entity.HasIndex(e => e.DocumentRequestId);
            entity.HasIndex(e => e.GrantedAt);
            entity.HasIndex(e => e.ExpiresAt);
            entity.HasIndex(e => new { e.DocumentId, e.BusinessUserId });
            entity.HasIndex(e => new { e.DocumentId, e.BusinessUserId, e.RevokedAt });
        });

        // Configure WaitlistEntry
        builder.Entity<WaitlistEntry>(entity =>
        {
            entity.ToTable("WaitlistEntries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.BusinessOrProfession).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Source).HasMaxLength(100);
            entity.Property(e => e.ReferralCode).HasMaxLength(50);
            
            // Unique index on normalized email
            entity.HasIndex(e => e.Email).IsUnique();
            // Index for admin queries
            entity.HasIndex(e => e.AccountType);
            entity.HasIndex(e => e.IncentiveAwarded);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.AccountType, e.SequenceNumber });
        });

        // Configure Rating
        builder.Entity<Rating>(entity =>
        {
            entity.ToTable("Ratings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.Score).IsRequired();
            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasOne<Conversation>()
                .WithMany()
                .HasForeignKey(e => e.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // One rating per user per conversation (prevents duplicates)
            entity.HasIndex(e => new { e.ConversationId, e.UserId }).IsUnique();
            entity.HasIndex(e => e.CreatedAt);
        });

        // Configure CandidateProfile
        builder.Entity<CandidateProfile>(entity =>
        {
            entity.ToTable("CandidateProfiles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.DateOfBirth).IsRequired();
            
            // One-to-one relationship with ApplicationUser
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => e.DateOfBirth);
        });

        // Configure EmailVerificationToken
        builder.Entity<EmailVerificationToken>(entity =>
        {
            entity.ToTable("EmailVerificationTokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.HashedToken).IsRequired().HasMaxLength(256);
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.IsUsed).IsRequired().HasDefaultValue(false);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.HashedToken);
            entity.HasIndex(e => e.ExpiresAt);
            entity.HasIndex(e => new { e.UserId, e.IsUsed });
        });

        // Rename Identity tables
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
    }

    public async Task SaveAuditLogAsync(AuditLog auditLog)
    {
        AuditLogs.Add(auditLog);
        await SaveChangesAsync();
    }
}

