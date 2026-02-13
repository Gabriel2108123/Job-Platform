using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Candidates.DTOs;

public class CreateWorkExperienceDto
{
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

    [MaxLength(2000)]
    public string? Description { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [Required]
    [MaxLength(50)] // private, applied_only, shortlisted_only
    public string VisibilityLevel { get; set; } = "private";
    
    public bool IsMapEnabled { get; set; } = false;
}
