using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Candidates.Entities;

public class CandidateMapSettings
{
    /// <summary>
    /// Candidate User ID (also serves as primary key)
    /// </summary>
    public Guid CandidateUserId { get; set; }
    
    /// <summary>
    /// Global toggle: whether the worker map is enabled at all
    /// </summary>
    public bool WorkerMapEnabled { get; set; } = false; // Default: OFF
    
    /// <summary>
    /// Phase 3: Whether candidate can be discovered via workplace matching
    /// </summary>
    public bool DiscoverableByWorkplaces { get; set; } = false; // Default: OFF
    
    /// <summary>
    /// Phase 3: Whether candidate allows connection requests from coworkers
    /// </summary>
    public bool AllowConnectionRequests { get; set; } = false; // Default: OFF
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
