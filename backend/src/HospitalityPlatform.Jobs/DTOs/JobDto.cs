using HospitalityPlatform.Jobs.Enums;

namespace HospitalityPlatform.Jobs.DTOs;

public class JobDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public RoleType RoleType { get; set; }
    public string RoleTypeName { get; set; } = string.Empty;
    
    public EmploymentType EmploymentType { get; set; }
    public string EmploymentTypeName { get; set; } = string.Empty;
    
    public ShiftPattern ShiftPattern { get; set; }
    public string ShiftPatternName { get; set; } = string.Empty;
    
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string SalaryCurrency { get; set; } = "GBP";
    public SalaryPeriod SalaryPeriod { get; set; }
    public string SalaryPeriodName { get; set; } = string.Empty;
    
    public string Location { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    
    public int? RequiredExperienceYears { get; set; }
    public string? RequiredQualifications { get; set; }
    public string? Benefits { get; set; }
    
    public JobStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    
    public DateTime? PublishedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public JobVisibility Visibility { get; set; }
    public int ViewsCount { get; set; }
}
