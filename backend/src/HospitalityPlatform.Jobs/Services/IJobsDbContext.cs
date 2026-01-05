using HospitalityPlatform.Jobs.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Jobs.Services;

/// <summary>
/// Interface for Jobs module data access
/// </summary>
public interface IJobsDbContext
{
    DbSet<Job> Jobs { get; }
    DbSet<Application> Applications { get; }
    DbSet<PreHireConfirmation> PreHireConfirmations { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
