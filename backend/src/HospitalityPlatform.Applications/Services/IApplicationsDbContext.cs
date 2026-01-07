using HospitalityPlatform.Applications.Entities;
using HospitalityPlatform.Jobs.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Applications.Services;

public interface IApplicationsDbContext
{
    DbSet<HospitalityPlatform.Applications.Entities.Application> Applications { get; }
    DbSet<ApplicationStatusHistory> ApplicationStatusHistories { get; }
    DbSet<Job> Jobs { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
