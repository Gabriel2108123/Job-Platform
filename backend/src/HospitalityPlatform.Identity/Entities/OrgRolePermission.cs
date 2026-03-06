using System;
using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Identity.Entities;

/// <summary>
/// Represents a specific permission granted to an organization role
/// </summary>
public class OrgRolePermission : BaseEntity
{
    public Guid OrgRoleId { get; set; }
    public OrgRole OrgRole { get; set; } = null!;
    
    /// <summary>
    /// The permission key, e.g., 'jobs.create', 'org.members.manage'
    /// </summary>
    public string PermissionKey { get; set; } = string.Empty;
}
