using HospitalityPlatform.Auth.Requirements;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HospitalityPlatform.Auth.Handlers;

/// <summary>
/// Handler for organization-based authorization
/// </summary>
public class OrganizationRequirementHandler : AuthorizationHandler<OrganizationRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrganizationRequirement requirement)
    {
        // Check if user has an organization claim
        var organizationClaim = context.User.FindFirst("OrganizationId");
        
        if (organizationClaim != null && !string.IsNullOrEmpty(organizationClaim.Value))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
