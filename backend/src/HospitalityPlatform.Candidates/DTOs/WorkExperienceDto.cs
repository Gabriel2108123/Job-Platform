namespace HospitalityPlatform.Candidates.DTOs;

public class WorkExperienceDto
{
    public Guid Id { get; set; }
    public Guid CandidateUserId { get; set; }
    public string EmployerName { get; set; } = string.Empty;
    public string LocationText { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? RoleTitle { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string VisibilityLevel { get; set; } = "private";
    public bool IsMapEnabled { get; set; }
    
    // Coordinates - only approximate populated
    public decimal? LatApprox { get; set; }
    public decimal? LngApprox { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
