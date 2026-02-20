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
    /// <summary>
    /// Professional position/title within the company or primary role for candidates
    /// </summary>
    public string? Position { get; set; }
    
    // Employee/Candidate Specific Fields
    public string? CountryOfResidence { get; set; }
    public string? Address { get; set; }
    public string? PrimaryRole { get; set; } // Chef, Bartender, etc.
    public string? CurrentStatus { get; set; } // Available, Employed, etc.
    // PhoneNumber is inherited from IdentityUser

    
    // Commercial
    public string? ReferralCode { get; set; }
    
    // Legal & Consent
    public bool AgreedToTerms { get; set; }
    public bool AgreedToPrivacy { get; set; }
    public bool IsOver16 { get; set; }
    
    // Navigation properties
    public Organization? Organization { get; set; }
}
