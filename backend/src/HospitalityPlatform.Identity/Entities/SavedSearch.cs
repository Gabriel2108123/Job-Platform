using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Identity.Entities;

/// <summary>
/// A saved search configuration for an organization/user to discover candidates
/// </summary>
public class SavedSearch : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid UserId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Search parameters stored as JSON (roles, skills, location, etc.)
    /// </summary>
    public string SearchParamsJson { get; set; } = string.Empty;
    
    public bool EnableEmailAlerts { get; set; } = false;
    
    // Navigation properties
    public Organization? Organization { get; set; }
    public ApplicationUser? User { get; set; }
}
