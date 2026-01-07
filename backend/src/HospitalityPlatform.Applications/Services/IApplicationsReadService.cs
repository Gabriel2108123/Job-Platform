namespace HospitalityPlatform.Applications.Services;

/// <summary>
/// Read-only service for checking application eligibility without exposing full application queries.
/// Used by Messaging module to enforce "chat unlock after match" (status >= Screening).
/// </summary>
public interface IApplicationsReadService
{
    /// <summary>
    /// Check if a candidate and business user are eligible to message based on application status.
    /// Eligibility requires at least one application between them with status >= Screening.
    /// </summary>
    /// <param name="organizationId">Organization ID for tenant isolation</param>
    /// <param name="candidateUserId">Candidate user ID</param>
    /// <param name="businessUserId">Business user ID</param>
    /// <returns>True if eligible to message, false otherwise</returns>
    Task<bool> CanMessageAsync(Guid organizationId, string candidateUserId, string businessUserId);

    /// <summary>
    /// Get the application status between a candidate and business user.
    /// Returns the highest status if multiple applications exist.
    /// </summary>
    /// <param name="organizationId">Organization ID for tenant isolation</param>
    /// <param name="candidateUserId">Candidate user ID</param>
    /// <param name="businessUserId">Business user ID</param>
    /// <returns>Application status as integer, or null if no applications exist</returns>
    Task<int?> GetApplicationStatusAsync(Guid organizationId, string candidateUserId, string businessUserId);

    /// <summary>
    /// Check if a specific application is in screening or later stage.
    /// </summary>
    /// <param name="applicationId">Application ID</param>
    /// <param name="organizationId">Organization ID for tenant isolation</param>
    /// <returns>True if status >= Screening, false otherwise</returns>
    Task<bool> IsApplicationInScreeningOrLaterAsync(Guid applicationId, Guid organizationId);

    /// <summary>
    /// Check if a user is involved in an application (as candidate or business).
    /// </summary>
    /// <param name="applicationId">Application ID</param>
    /// <param name="organizationId">Organization ID for tenant isolation</param>
    /// <param name="userId">User ID</param>
    /// <returns>True if user is involved in application, false otherwise</returns>
    Task<bool> IsUserInApplicationAsync(Guid applicationId, Guid organizationId, string userId);
}
