using HospitalityPlatform.Jobs.DTOs;
using HospitalityPlatform.Jobs.Entities;
using HospitalityPlatform.Jobs.Enums;
using HospitalityPlatform.Audit.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Jobs.Services;

public class JobService : IJobService
{
    private readonly IJobsDbContext _context;
    private readonly IAuditService _auditService;
    private readonly ILogger<JobService> _logger;

    public JobService(
        IJobsDbContext context,
        IAuditService auditService,
        ILogger<JobService> logger)
    {
        _context = context;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<JobDto> CreateJobAsync(CreateJobDto dto, string userId, Guid organizationId)
    {
        var job = new Job
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            CreatedByUserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            RoleType = dto.RoleType,
            EmploymentType = dto.EmploymentType,
            ShiftPattern = dto.ShiftPattern,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            SalaryCurrency = dto.SalaryCurrency,
            SalaryPeriod = dto.SalaryPeriod,
            Location = dto.Location,
            PostalCode = dto.PostalCode,
            RequiredExperienceYears = dto.RequiredExperienceYears,
            RequiredQualifications = dto.RequiredQualifications,
            Benefits = dto.Benefits,
            ExpiresAt = dto.ExpiresAt,
            Status = JobStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "JobCreated",
            "Job",
            job.Id.ToString(),
            new { jobId = job.Id, title = job.Title, organizationId },
            userId,
            organizationId
        );

        _logger.LogInformation("Job {JobId} created by user {UserId}", job.Id, userId);

        return MapToDto(job);
    }

    public async Task<JobDto> UpdateJobAsync(Guid jobId, UpdateJobDto dto, string userId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null)
        {
            throw new KeyNotFoundException($"Job {jobId} not found");
        }

        if (job.Status != JobStatus.Draft && job.Status != JobStatus.Published)
        {
            throw new InvalidOperationException("Cannot update closed or filled jobs");
        }

        if (dto.Title != null) job.Title = dto.Title;
        if (dto.Description != null) job.Description = dto.Description;
        if (dto.RoleType.HasValue) job.RoleType = dto.RoleType.Value;
        if (dto.EmploymentType.HasValue) job.EmploymentType = dto.EmploymentType.Value;
        if (dto.ShiftPattern.HasValue) job.ShiftPattern = dto.ShiftPattern.Value;
        if (dto.SalaryMin.HasValue) job.SalaryMin = dto.SalaryMin;
        if (dto.SalaryMax.HasValue) job.SalaryMax = dto.SalaryMax;
        if (dto.SalaryCurrency != null) job.SalaryCurrency = dto.SalaryCurrency;
        if (dto.SalaryPeriod.HasValue) job.SalaryPeriod = dto.SalaryPeriod.Value;
        if (dto.Location != null) job.Location = dto.Location;
        if (dto.PostalCode != null) job.PostalCode = dto.PostalCode;
        if (dto.RequiredExperienceYears.HasValue) job.RequiredExperienceYears = dto.RequiredExperienceYears;
        if (dto.RequiredQualifications != null) job.RequiredQualifications = dto.RequiredQualifications;
        if (dto.Benefits != null) job.Benefits = dto.Benefits;
        if (dto.ExpiresAt.HasValue) job.ExpiresAt = dto.ExpiresAt;

        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "JobUpdated",
            "Job",
            job.Id.ToString(),
            new { jobId = job.Id, changes = dto },
            userId,
            job.OrganizationId
        );

        _logger.LogInformation("Job {JobId} updated by user {UserId}", job.Id, userId);

        return MapToDto(job);
    }

    public async Task<JobDto> PublishJobAsync(Guid jobId, string userId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null)
        {
            throw new KeyNotFoundException($"Job {jobId} not found");
        }

        if (job.Status != JobStatus.Draft)
        {
            throw new InvalidOperationException("Only draft jobs can be published");
        }

        job.Status = JobStatus.Published;
        job.PublishedAt = DateTime.UtcNow;
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "JobPublished",
            "Job",
            job.Id.ToString(),
            new { jobId = job.Id, title = job.Title },
            userId,
            job.OrganizationId
        );

        _logger.LogInformation("Job {JobId} published by user {UserId}", job.Id, userId);

        return MapToDto(job);
    }

    public async Task CloseJobAsync(Guid jobId, string userId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null)
        {
            throw new KeyNotFoundException($"Job {jobId} not found");
        }

        if (job.Status == JobStatus.Closed || job.Status == JobStatus.Filled)
        {
            throw new InvalidOperationException("Job is already closed or filled");
        }

        job.Status = JobStatus.Closed;
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "JobClosed",
            "Job",
            job.Id.ToString(),
            new { jobId = job.Id, title = job.Title },
            userId,
            job.OrganizationId
        );

        _logger.LogInformation("Job {JobId} closed by user {UserId}", job.Id, userId);
    }

    public async Task<JobDto?> GetJobByIdAsync(Guid jobId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        return job == null ? null : MapToDto(job);
    }

    public async Task<PagedResult<JobDto>> GetJobsByOrganizationAsync(Guid organizationId, int pageNumber = 1, int pageSize = 20)
    {
        var query = _context.Jobs
            .Where(j => j.OrganizationId == organizationId)
            .OrderByDescending(j => j.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<JobDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<JobDto>> SearchJobsAsync(SearchJobsDto searchDto)
    {
        var query = _context.Jobs
            .Where(j => j.Status == JobStatus.Published);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchDto.Keyword))
        {
            var keyword = searchDto.Keyword.ToLower();
            query = query.Where(j => 
                j.Title.ToLower().Contains(keyword) || 
                j.Description.ToLower().Contains(keyword));
        }

        if (searchDto.RoleType.HasValue)
        {
            query = query.Where(j => j.RoleType == searchDto.RoleType.Value);
        }

        if (searchDto.EmploymentType.HasValue)
        {
            query = query.Where(j => j.EmploymentType == searchDto.EmploymentType.Value);
        }

        if (searchDto.ShiftPattern.HasValue)
        {
            query = query.Where(j => j.ShiftPattern == searchDto.ShiftPattern.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchDto.Location))
        {
            var location = searchDto.Location.ToLower();
            query = query.Where(j => j.Location.ToLower().Contains(location));
        }

        if (!string.IsNullOrWhiteSpace(searchDto.PostalCode))
        {
            query = query.Where(j => j.PostalCode != null && j.PostalCode.StartsWith(searchDto.PostalCode));
        }

        if (searchDto.MinSalary.HasValue)
        {
            query = query.Where(j => j.SalaryMin >= searchDto.MinSalary.Value);
        }

        // Apply sorting
        query = searchDto.SortBy.ToLower() switch
        {
            "title" => searchDto.SortOrder.ToLower() == "asc" 
                ? query.OrderBy(j => j.Title) 
                : query.OrderByDescending(j => j.Title),
            "createdat" => searchDto.SortOrder.ToLower() == "asc" 
                ? query.OrderBy(j => j.CreatedAt) 
                : query.OrderByDescending(j => j.CreatedAt),
            "publishedat" => searchDto.SortOrder.ToLower() == "asc" 
                ? query.OrderBy(j => j.PublishedAt) 
                : query.OrderByDescending(j => j.PublishedAt),
            _ => query.OrderByDescending(j => j.PublishedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
            .Take(searchDto.PageSize)
            .ToListAsync();

        return new PagedResult<JobDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = searchDto.PageNumber,
            PageSize = searchDto.PageSize
        };
    }

    private static JobDto MapToDto(Job job)
    {
        return new JobDto
        {
            Id = job.Id,
            OrganizationId = job.OrganizationId,
            CreatedByUserId = job.CreatedByUserId,
            Title = job.Title,
            Description = job.Description,
            RoleType = job.RoleType,
            RoleTypeName = job.RoleType.ToString(),
            EmploymentType = job.EmploymentType,
            EmploymentTypeName = job.EmploymentType.ToString(),
            ShiftPattern = job.ShiftPattern,
            ShiftPatternName = job.ShiftPattern.ToString(),
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            SalaryCurrency = job.SalaryCurrency,
            SalaryPeriod = job.SalaryPeriod,
            SalaryPeriodName = job.SalaryPeriod.ToString(),
            Location = job.Location,
            PostalCode = job.PostalCode,
            RequiredExperienceYears = job.RequiredExperienceYears,
            RequiredQualifications = job.RequiredQualifications,
            Benefits = job.Benefits,
            Status = job.Status,
            StatusName = job.Status.ToString(),
            PublishedAt = job.PublishedAt,
            ExpiresAt = job.ExpiresAt,
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt
        };
    }
}
