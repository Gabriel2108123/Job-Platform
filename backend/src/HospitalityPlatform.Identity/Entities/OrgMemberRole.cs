using System;
using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Identity.Entities;

/// <summary>
/// Links a user to a specific role within an organization
/// </summary>
public class OrgMemberRole : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    
    public Guid OrgRoleId { get; set; }
    public OrgRole OrgRole { get; set; } = null!;
}
