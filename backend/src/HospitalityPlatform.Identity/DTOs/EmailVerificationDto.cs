using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Identity.DTOs;

/// <summary>
/// DTO for email verification token request
/// </summary>
public class SendVerificationEmailDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
}

/// <summary>
/// DTO for email verification token verification
/// </summary>
public class VerifyEmailDto
{
    [Required]
    public required string Token { get; set; }
}

/// <summary>
/// Response for email verification
/// </summary>
public class EmailVerificationResultDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
}
