using Microsoft.EntityFrameworkCore;
using HospitalityPlatform.Candidates.Entities;

namespace HospitalityPlatform.Candidates.Services;

public interface ICandidatesDbContext
{
    DbSet<WorkExperience> WorkExperiences { get; set; }
    DbSet<CandidateMapSettings> CandidateMapSettings { get; set; }
    DbSet<CoworkerConnection> CoworkerConnections { get; set; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
