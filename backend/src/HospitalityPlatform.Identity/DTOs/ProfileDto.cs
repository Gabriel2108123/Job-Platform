namespace HospitalityPlatform.Identity.DTOs;

public class ProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Bio { get; set; }
    public string? ResumeJson { get; set; }
    public string? Role { get; set; }
    public List<Guid>? PreferredJobRoleIds { get; set; }
    
    // New Fields
    public string? CountryOfResidence { get; set; }
    public string? Address { get; set; }
    public string? PrimaryRole { get; set; }
    public string? CurrentStatus { get; set; }
    public bool IsOver16 { get; set; }
}

public class UpdateProfileDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Bio { get; set; }
    public string? ResumeJson { get; set; }

    public List<Guid>? PreferredJobRoleIds { get; set; }
    
    // New Fields
    public string? CountryOfResidence { get; set; }
    public string? Address { get; set; }
    public string? PrimaryRole { get; set; }
    public string? CurrentStatus { get; set; }
}
