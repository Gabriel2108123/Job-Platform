using HospitalityPlatform.Applications.Entities;
using HospitalityPlatform.Applications.Enums;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Jobs.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Applications.Services;

/// <summary>
/// Implementation of read-only application eligibility checks.
/// Used by Messaging module to enforce "chat unlock after match" (status >= Screening).
/// Never queries Application tables directly - always joins with Job to get OrganizationId.
/// </summary>
public class ApplicationsReadService : IApplicationsReadService
{
    private readonly IApplicationsDbContext _context;
    private readonly IJobsDbContext _jobsContext;
    private readonly ILogger<ApplicationsReadService> _logger;

    public ApplicationsReadService(
        IApplicationsDbContext context,
        IJobsDbContext jobsContext,
        ILogger<ApplicationsReadService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _jobsContext = jobsContext ?? throw new ArgumentNullException(nameof(jobsContext));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Check if a candidate and business user are eligible to message.
    /// Eligibility requires: status >= Screening AND both users in same organization.
    /// 
    /// IMPLEMENTATION NOTE: 
    /// We assume "business user" is the Job.CreatedByUserId.
    /// To message, the candidate's application status must be >= Screening.
    /// </summary>
    public async Task<bool> CanMessageAsync(Guid organizationId, string candidateUserId, string businessUserId)
    {
        if (string.IsNullOrWhiteSpace(candidateUserId) || string.IsNullOrWhiteSpace(businessUserId))
            return false;

        try
        {
            // Join Application -> Job to check org and business user
            // Candidate must have an application to a job created by businessUser in this org
            // AND the application must be >= Screening
            var hasEligibleApplication = await _context.Applications
                .Join(
                    _jobsContext.Jobs,
                    app => app.JobId,
                    job => job.Id,
                    (app, job) => new { app, job })
                .Where(x => x.job.OrganizationId == organizationId
                    && x.app.CandidateUserId == candidateUserId
                    && x.job.CreatedByUserId == businessUserId
                    && (int)x.app.CurrentStatus >= (int)ApplicationStatus.Screening)
                .AnyAsync();

            if (hasEligibleApplication)
            {
                _logger.LogInformation(
                    "Messaging eligibility check PASSED. CandidateId: {CandidateId}, BusinessId: {BusinessId}, OrgId: {OrgId}",
                    candidateUserId, businessUserId, organizationId);
            }
            else
            {
                _logger.LogWarning(
                    "Messaging eligibility check FAILED. CandidateId: {CandidateId}, BusinessId: {BusinessId}, OrgId: {OrgId}",
                    candidateUserId, businessUserId, organizationId);
            }

            return hasEligibleApplication;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Error checking messaging eligibility. CandidateId: {CandidateId}, BusinessId: {BusinessId}, OrgId: {OrgId}",
                candidateUserId, businessUserId, organizationId);
            return false; // Fail-safe: deny access on error
        }
    }

    /// <summary>
    /// Get the highest application status between candidate and business user in organization.
    /// </summary>
    public async Task<int?> GetApplicationStatusAsync(Guid organizationId, string candidateUserId, string businessUserId)
    {
        if (string.IsNullOrWhiteSpace(candidateUserId) || string.IsNullOrWhiteSpace(businessUserId))
            return null;

        try
        {
            var status = await _context.Applications
                .Join(
                    _jobsContext.Jobs,
                    app => app.JobId,
                    job => job.Id,
                    (app, job) => new { app, job })
                .Where(x => x.job.OrganizationId == organizationId
                    && x.app.CandidateUserId == candidateUserId
                    && x.job.CreatedByUserId == businessUserId)
                .OrderByDescending(x => x.app.CurrentStatus)
                .Select(x => (int?)x.app.CurrentStatus)
                .FirstOrDefaultAsync();

            return status;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Error getting application status. CandidateId: {CandidateId}, BusinessId: {BusinessId}, OrgId: {OrgId}",
                candidateUserId, businessUserId, organizationId);
            return null;
        }
    }

    /// <summary>
    /// Check if a specific application is in Screening or later stage and belongs to the organization.
    /// </summary>
    public async Task<bool> IsApplicationInScreeningOrLaterAsync(Guid applicationId, Guid organizationId)
    {
        try
        {
            var isScreening = await _context.Applications
                .Join(
                    _jobsContext.Jobs,
                    app => app.JobId,
                    job => job.Id,
                    (app, job) => new { app, job })
                .Where(x => x.app.Id == applicationId
                    && x.job.OrganizationId == organizationId
                    && (int)x.app.CurrentStatus >= (int)ApplicationStatus.Screening)
                .AnyAsync();

            return isScreening;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Error checking application screening status. ApplicationId: {AppId}, OrgId: {OrgId}",
                applicationId, organizationId);
            return false; // Fail-safe: deny access on error
        }
    }

    /// <summary>
    /// Check if a user is the candidate or the job creator (business) in an application within organization.
    /// </summary>
    public async Task<bool> IsUserInApplicationAsync(Guid applicationId, Guid organizationId, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return false;

        try
        {
            var isInvolved = await _context.Applications
                .Join(
                    _jobsContext.Jobs,
                    app => app.JobId,
                    job => job.Id,
                    (app, job) => new { app, job })
                .Where(x => x.app.Id == applicationId
                    && x.job.OrganizationId == organizationId
                    && (x.app.CandidateUserId == userId || x.job.CreatedByUserId == userId))
                .AnyAsync();

            return isInvolved;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Error checking user involvement. ApplicationId: {AppId}, OrgId: {OrgId}, UserId: {UserId}",
                applicationId, organizationId, userId);
            return false; // Fail-safe: deny access on error
        }
    }
}
