using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Identity.Entities;

/// <summary>
/// Organization entity for multi-tenancy
/// </summary>
public class Organization : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Business Profile Fields
    public string? BusinessName { get; set; } // Display name for the business
    public string? Location { get; set; } // Physical address or city
    public string? Website { get; set; }
    public string? Industry { get; set; } // e.g., "Hotels & Resorts", "Restaurants", "Catering"
    public string? CompanySize { get; set; } // e.g., "1-10", "11-50", "51-200", "200+"
    
    // Point of Contact for Job Applications
    public string? PointOfContactName { get; set; }
    public string? PointOfContactEmail { get; set; }
    public string? PointOfContactPhone { get; set; }
    
    // Branding
    public string? LogoUrl { get; set; }
    
    // Navigation properties
    public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
}
