using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Candidates.Entities;

public class WorkExperience
{
    public Guid Id { get; set; }
    
    public Guid CandidateUserId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string EmployerName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string LocationText { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? City { get; set; }
    
    [MaxLength(20)]
    public string? PostalCode { get; set; }
    
    [MaxLength(100)]
    public string? RoleTitle { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    /// <summary>
    /// Controls when this entry is visible to businesses
    /// private: Never visible to businesses
    /// applied_only: Visible after candidate applies
    /// shortlisted_only: Visible only after candidate is shortlisted
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string VisibilityLevel { get; set; } = "private"; // Default: private
    
    /// <summary>
    /// Whether this entry appears on the candidate's worker map
    /// </summary>
    public bool IsMapEnabled { get; set; } = false; // Default: OFF
    
    /// <summary>
    /// Approximate coordinates (computed server-side from location/postal code)
    /// </summary>
    public decimal? LatApprox { get; set; }
    
    /// <summary>
    /// Approximate coordinates (computed server-side from location/postal code)
    /// </summary>
    public decimal? LngApprox { get; set; }
    
    /// <summary>
    /// Description of the role and responsibilities (for CV)
    /// </summary>
    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>
    /// PlaceKey for coworker matching (Phase 3)
    /// Format: normalize(EmployerName)|coarseGeoHash|City
    /// </summary>
    [MaxLength(200)]
    public string? PlaceKey { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
