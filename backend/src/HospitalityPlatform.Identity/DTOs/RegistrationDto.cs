using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Identity.DTOs;

/// <summary>
/// DTO for candidate registration with age validation
/// </summary>
public class CandidateRegistrationDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public required string Password { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    /// <summary>
    /// Date of birth for age verification (must be 16+)
    /// </summary>
    [Required]
    public required DateTime DateOfBirth { get; set; }
}

/// <summary>
/// DTO for business owner registration (no age requirement)
/// </summary>
public class BusinessOwnerRegistrationDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public required string Password { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(200)]
    public string? CompanyName { get; set; }
}

/// <summary>
/// Response for registration attempt
/// </summary>
public class RegistrationResultDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public Guid? UserId { get; set; }
    public Dictionary<string, string>? Errors { get; set; }
}
