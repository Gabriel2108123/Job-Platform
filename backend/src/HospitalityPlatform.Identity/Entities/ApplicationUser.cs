using Microsoft.AspNetCore.Identity;

namespace HospitalityPlatform.Identity.Entities;

/// <summary>
/// Extended IdentityUser with organization tenancy
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid? OrganizationId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Whether user's email has been verified
    /// </summary>
    public bool EmailVerified { get; set; } = false;

    /// <summary>
    /// URL to the user's profile picture in S3
    /// </summary>
    public string? ProfilePictureUrl { get; set; }
    
    /// <summary>
    /// Professional position/title within the company
    /// </summary>
    public string? Position { get; set; }
    
    // Navigation properties
    public Organization? Organization { get; set; }
}
