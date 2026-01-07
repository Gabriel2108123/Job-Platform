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
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Whether user's email has been verified
    /// </summary>
    public bool EmailVerified { get; set; } = false;
    
    // Navigation properties
    public Organization? Organization { get; set; }
}
