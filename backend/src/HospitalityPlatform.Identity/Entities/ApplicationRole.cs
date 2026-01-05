using Microsoft.AspNetCore.Identity;

namespace HospitalityPlatform.Identity.Entities;

/// <summary>
/// Extended IdentityRole with custom properties
/// </summary>
public class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}
