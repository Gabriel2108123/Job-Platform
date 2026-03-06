using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Entities;
using HospitalityPlatform.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalityPlatform.Applications.Services;

public class InterviewService : IInterviewService
{
    private readonly IApplicationsDbContext _dbContext;
    private readonly IOrgAuthorizationService _orgAuthService;
    private readonly ILogger<InterviewService> _logger;

    public InterviewService(
        IApplicationsDbContext dbContext,
        IOrgAuthorizationService orgAuthService,
        ILogger<InterviewService> logger)
    {
        _dbContext = dbContext;
        _orgAuthService = orgAuthService;
        _logger = logger;
    }

    public async Task<InterviewDto> ScheduleInterviewAsync(Guid organizationId, CreateInterviewDto dto, string userId)
    {
        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == dto.ApplicationId);

        if (application == null)
        {
            throw new InvalidOperationException("Application not found");
        }

        var job = await _dbContext.Jobs
            .FirstOrDefaultAsync(j => j.Id == application.JobId && j.OrganizationId == organizationId);

        if (job == null)
        {
            throw new InvalidOperationException("Application does not belong to your organization");
        }

        var interview = new Interview
        {
            Id = Guid.NewGuid(),
            ApplicationId = dto.ApplicationId,
            ScheduledAt = dto.ScheduledAt,
            Type = dto.Type,
            MeetingLink = dto.MeetingLink,
            Location = dto.Location,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Interviews.Add(interview);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Interview {InterviewId} scheduled for application {ApplicationId} by user {UserId}", 
            interview.Id, dto.ApplicationId, userId);

        return MapToDto(interview);
    }

    public async Task<InterviewDto?> GetInterviewAsync(Guid organizationId, Guid interviewId)
    {
        var interview = await _dbContext.Interviews
            .FirstOrDefaultAsync(i => i.Id == interviewId);

        if (interview == null) return null;

        // Verify organization access via application
        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == interview.ApplicationId);

        if (application == null) return null;

        var job = await _dbContext.Jobs
            .AnyAsync(j => j.Id == application.JobId && j.OrganizationId == organizationId);

        if (!job) return null;

        return MapToDto(interview);
    }

    public async Task<IEnumerable<InterviewDto>> GetApplicationInterviewsAsync(Guid organizationId, Guid applicationId)
    {
        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
        {
            throw new InvalidOperationException("Application not found");
        }

        var jobExists = await _dbContext.Jobs
            .AnyAsync(j => j.Id == application.JobId && j.OrganizationId == organizationId);

        if (!jobExists)
        {
            throw new InvalidOperationException("Application does not belong to your organization");
        }

        var interviews = await _dbContext.Interviews
            .Where(i => i.ApplicationId == applicationId)
            .OrderBy(i => i.ScheduledAt)
            .ToListAsync();

        return interviews.Select(MapToDto);
    }

    public async Task<InterviewDto> UpdateFeedbackAsync(Guid organizationId, Guid interviewId, UpdateInterviewFeedbackDto dto, string userId)
    {
        var interview = await _dbContext.Interviews
            .FirstOrDefaultAsync(i => i.Id == interviewId);

        if (interview == null)
        {
            throw new InvalidOperationException("Interview not found");
        }

        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == interview.ApplicationId);

        if (application == null)
        {
            throw new InvalidOperationException("Access denied: Interview does not belong to your organization");
        }

        interview.Feedback = dto.Feedback;
        interview.IsCompleted = dto.IsCompleted;
        interview.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Feedback updated for interview {InterviewId} by user {UserId}", interviewId, userId);

        return MapToDto(interview);
    }

    public async Task DeleteInterviewAsync(Guid organizationId, Guid interviewId, string userId)
    {
        var interview = await _dbContext.Interviews
            .FirstOrDefaultAsync(i => i.Id == interviewId);

        if (interview == null) return;

        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == interview.ApplicationId);

        if (application == null)
        {
            throw new InvalidOperationException("Access denied: Interview does not belong to your organization");
        }

        _dbContext.Interviews.Remove(interview);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Interview {InterviewId} deleted by user {UserId}", interviewId, userId);
    }

    private InterviewDto MapToDto(Interview interview)
    {
        return new InterviewDto
        {
            Id = interview.Id,
            ApplicationId = interview.ApplicationId,
            ScheduledAt = interview.ScheduledAt,
            Type = interview.Type,
            MeetingLink = interview.MeetingLink,
            Location = interview.Location,
            Notes = interview.Notes,
            Feedback = interview.Feedback,
            IsCompleted = interview.IsCompleted
        };
    }
}
