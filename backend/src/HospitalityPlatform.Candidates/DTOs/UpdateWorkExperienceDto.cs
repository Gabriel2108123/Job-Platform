using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Candidates.DTOs;

public class UpdateWorkExperienceDto
{
    [MaxLength(200)]
    public string? EmployerName { get; set; }
    
    [MaxLength(200)]
    public string? LocationText { get; set; }
    
    [MaxLength(100)]
    public string? City { get; set; }
    
    [MaxLength(20)]
    public string? PostalCode { get; set; }
    
    [MaxLength(100)]
    public string? RoleTitle { get; set; }
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    [MaxLength(50)]
    public string? VisibilityLevel { get; set; }
    
    public bool? IsMapEnabled { get; set; }
}
