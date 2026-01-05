using HospitalityPlatform.Auth.Requirements;
using Microsoft.AspNetCore.Authorization;

namespace HospitalityPlatform.Auth.Handlers;

/// <summary>
/// Handler for role-based authorization
/// </summary>
public class RoleRequirementHandler : AuthorizationHandler<RoleRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RoleRequirement requirement)
    {
        if (context.User.IsInRole(requirement.Role))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
