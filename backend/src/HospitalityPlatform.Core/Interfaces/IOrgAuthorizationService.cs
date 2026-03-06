using System;
using System.Threading.Tasks;

namespace HospitalityPlatform.Core.Interfaces;

/// <summary>
/// Interface for central organization role authorization
/// </summary>
public interface IOrgAuthorizationService
{
    /// <summary>
    /// Checks if a user has a specific permission within an organization
    /// </summary>
    Task<bool> HasPermissionAsync(Guid userId, Guid orgId, string permissionKey);

    /// <summary>
    /// Ensures a user has a specific permission within an organization.
    /// Throws UnauthorizedAccessException if they don't, and optionally logs an audit event for high-risk actions.
    /// </summary>
    Task EnsurePermissionAsync(Guid userId, Guid orgId, string permissionKey);

    /// <summary>
    /// Gets the primary organization ID for a user.
    /// </summary>
    Task<Guid?> GetUserOrganizationIdAsync(Guid userId);
}
