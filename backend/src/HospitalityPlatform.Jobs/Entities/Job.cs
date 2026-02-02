using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Jobs.Enums;

namespace HospitalityPlatform.Jobs.Entities;

/// <summary>
/// Represents a job posting for UK hospitality roles
/// </summary>
public class Job : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public RoleType RoleType { get; set; }
    public EmploymentType EmploymentType { get; set; }
    public ShiftPattern ShiftPattern { get; set; }
    
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string SalaryCurrency { get; set; } = "GBP";
    public SalaryPeriod SalaryPeriod { get; set; }
    
    public string Location { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    
    // Location Privacy & Coordinates (Phase 1)
    public LocationVisibility LocationVisibility { get; set; } = LocationVisibility.PrivateApprox;
    public decimal? LatExact { get; set; }
    public decimal? LngExact { get; set; }
    public decimal? LatApprox { get; set; }
    public decimal? LngApprox { get; set; }
    public int? ApproxRadiusMeters { get; set; } = 1200;
    public string? AddressVisibility { get; set; } // "public" | "applicants_only" | "shortlisted_only"
    
    public int? RequiredExperienceYears { get; set; }
    public string? RequiredQualifications { get; set; }
    public string? Benefits { get; set; }
    
    public JobStatus Status { get; set; } = JobStatus.Draft;
    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    public JobVisibility Visibility { get; set; } = JobVisibility.Public;

    public int ViewsCount { get; set; } = 0;
}
