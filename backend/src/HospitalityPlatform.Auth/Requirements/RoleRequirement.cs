using Microsoft.AspNetCore.Authorization;

namespace HospitalityPlatform.Auth.Requirements;

/// <summary>
/// Requirement for role-based authorization
/// </summary>
public class RoleRequirement : IAuthorizationRequirement
{
    public string Role { get; }

    public RoleRequirement(string role)
    {
        Role = role;
    }
}
