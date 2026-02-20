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
    public string? BusinessName { get; set; } // Display name for the business (Registered company name)
    public string? TradingName { get; set; } // If different from registered name
    public string? Location { get; set; } // Physical address or city
    public string? CountryOfRegistration { get; set; }
    public string? Website { get; set; }
    public string? Industry { get; set; } // e.g., "Hotels & Resorts", "Restaurants", "Catering"
    public string? CompanySize { get; set; } // e.g., "1-10", "11-50", "51-200", "200+"
    
    // Point of Contact for Job Applications
    public string? PointOfContactName { get; set; }
    public string? PointOfContactEmail { get; set; }
    public string? PointOfContactPhone { get; set; }
    
    // Branding
    public string? LogoUrl { get; set; }

    // Commercial
    public string? VATNumber { get; set; }
    public string? DiscountCode { get; set; }

    // Legal & Consent
    public bool AuthorizedToHire { get; set; }
    public bool AgreedToTerms { get; set; }
    public bool AgreedToPrivacy { get; set; }
    
    // Navigation properties
    public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
}
