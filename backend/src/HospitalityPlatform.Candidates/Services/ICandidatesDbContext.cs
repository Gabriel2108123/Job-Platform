using HospitalityPlatform.Candidates.Entities;
using HospitalityPlatform.Identity.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Candidates.Services;

public interface ICandidatesDbContext
{
    DbSet<WorkExperience> WorkExperiences { get; set; }
    DbSet<CandidateMapSettings> CandidateMapSettings { get; set; }
    DbSet<CoworkerConnection> CoworkerConnections { get; set; }
    DbSet<CandidateProfile> CandidateProfiles { get; set; }
    DbSet<SavedSearch> SavedSearches { get; set; }
    DbSet<ApplicationUser> Users { get; set; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
