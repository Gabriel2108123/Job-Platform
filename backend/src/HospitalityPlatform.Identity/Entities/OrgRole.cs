using System;
using System.Collections.Generic;
using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Identity.Entities;

/// <summary>
/// Represents a role within an organization
/// </summary>
public class OrgRole : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    
    public ICollection<OrgRolePermission> Permissions { get; set; } = new List<OrgRolePermission>();
    public ICollection<OrgMemberRole> MemberRoles { get; set; } = new List<OrgMemberRole>();
}
