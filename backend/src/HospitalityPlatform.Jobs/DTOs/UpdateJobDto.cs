using HospitalityPlatform.Jobs.Enums;
using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Jobs.DTOs;

public class UpdateJobDto
{
    [StringLength(200, MinimumLength = 5)]
    public string? Title { get; set; }
    
    [StringLength(10000, MinimumLength = 20)]
    public string? Description { get; set; }
    
    public RoleType? RoleType { get; set; }
    public EmploymentType? EmploymentType { get; set; }
    public ShiftPattern? ShiftPattern { get; set; }
    
    [Range(0, 1000000)]
    public decimal? SalaryMin { get; set; }
    
    [Range(0, 1000000)]
    public decimal? SalaryMax { get; set; }
    
    [StringLength(3)]
    public string? SalaryCurrency { get; set; }
    
    public SalaryPeriod? SalaryPeriod { get; set; }
    
    [StringLength(200)]
    public string? Location { get; set; }
    
    [StringLength(20)]
    public string? PostalCode { get; set; }
    
    [Range(0, 50)]
    public int? RequiredExperienceYears { get; set; }
    
    [StringLength(1000)]
    public string? RequiredQualifications { get; set; }
    
    [StringLength(2000)]
    public string? Benefits { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
}
