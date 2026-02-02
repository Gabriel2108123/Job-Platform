using HospitalityPlatform.Jobs.Enums;
using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Jobs.DTOs;

public class CreateJobDto
{
    [Required]
    [StringLength(200, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [StringLength(10000, MinimumLength = 20)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public RoleType RoleType { get; set; }
    
    [Required]
    public EmploymentType EmploymentType { get; set; }
    
    [Required]
    public ShiftPattern ShiftPattern { get; set; }
    
    [Range(0, 1000000)]
    public decimal? SalaryMin { get; set; }
    
    [Range(0, 1000000)]
    public decimal? SalaryMax { get; set; }
    
    [StringLength(3)]
    public string SalaryCurrency { get; set; } = "GBP";
    
    public SalaryPeriod SalaryPeriod { get; set; } = SalaryPeriod.Year;
    
    [Required]
    [StringLength(200)]
    public string Location { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? PostalCode { get; set; }
    
    [Range(0, 50)]
    public int? RequiredExperienceYears { get; set; }
    
    [StringLength(1000)]
    public string? RequiredQualifications { get; set; }
    
    [StringLength(2000)]
    public string? Benefits { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
    
    public JobVisibility Visibility { get; set; } = JobVisibility.Public;
    
    // Location Privacy (Phase 1)
    [Required]
    public LocationVisibility LocationVisibility { get; set; } = LocationVisibility.PrivateApprox;
    
    // Optional: Exact coordinates (if LocationVisibility == PublicExact)
    [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
    public decimal? LatExact { get; set; }
    
    [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
    public decimal? LngExact { get; set; }
}
