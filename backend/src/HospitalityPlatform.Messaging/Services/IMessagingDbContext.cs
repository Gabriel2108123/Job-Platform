using HospitalityPlatform.Audit.Entities;
using HospitalityPlatform.Messaging.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading;

namespace HospitalityPlatform.Messaging.Services;

/// <summary>
/// Interface for messaging database context.
/// Breaks circular dependencies by providing abstraction for DB access.
/// </summary>
public interface IMessagingDbContext
{
    DbSet<Conversation> Conversations { get; }
    DbSet<ConversationParticipant> ConversationParticipants { get; }
    DbSet<Message> Messages { get; }
    DbSet<HospitalityPlatform.Messaging.Entities.Rating> Ratings { get; }
    DbSet<UserBlock> UserBlocks { get; }
    DbSet<UserReport> UserReports { get; }
    DbSet<HospitalityPlatform.Messaging.Entities.MessageTemplate> MessageTemplates { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task SaveAuditLogAsync(AuditLog auditLog);
}
