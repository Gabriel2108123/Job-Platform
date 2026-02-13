using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Entities;
using HospitalityPlatform.Core.Services;
using HospitalityPlatform.Audit.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Candidates.Services;

public class WorkExperienceService : IWorkExperienceService
{
    private readonly ICandidatesDbContext _context;
    private readonly ILocationService _locationService;
    private readonly IAuditService _auditService;
    private readonly ILogger<WorkExperienceService> _logger;

    public WorkExperienceService(
        ICandidatesDbContext context,
        ILocationService locationService,
        IAuditService auditService,
        ILogger<WorkExperienceService> logger)
    {
        _context = context;
        _locationService = locationService;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<List<WorkExperienceDto>> GetWorkExperiencesAsync(Guid candidateId)
    {
        var entities = await _context.WorkExperiences
            .Where(w => w.CandidateUserId == candidateId)
            .OrderByDescending(w => w.StartDate ?? w.EndDate ?? w.CreatedAt)
            .ToListAsync();
            
        return entities.Select(MapToDto).ToList();
    }

    public async Task<WorkExperienceDto?> GetWorkExperienceByIdAsync(Guid id, Guid candidateId)
    {
        var entity = await _context.WorkExperiences
            .FirstOrDefaultAsync(w => w.Id == id && w.CandidateUserId == candidateId);
            
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<WorkExperienceDto> CreateWorkExperienceAsync(Guid candidateId, CreateWorkExperienceDto dto)
    {
        // 1. Geocode location to get approx coords
        var (lat, lng) = await _locationService.GetApproxCoordsAsync(dto.PostalCode, dto.City ?? dto.LocationText);
        
        var entity = new WorkExperience
        {
            Id = Guid.NewGuid(),
            CandidateUserId = candidateId,
            EmployerName = dto.EmployerName,
            LocationText = dto.LocationText,
            City = dto.City,
            PostalCode = dto.PostalCode,
            RoleTitle = dto.RoleTitle,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            VisibilityLevel = dto.VisibilityLevel,
            IsMapEnabled = dto.IsMapEnabled,
            LatApprox = lat,
            LngApprox = lng,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.WorkExperiences.Add(entity);
        await _context.SaveChangesAsync();
        
        await _auditService.LogAsync(
            "WorkExperienceCreated",
            "WorkExperience",
            entity.Id.ToString(),
            new { entity.EmployerName, entity.IsMapEnabled },
            candidateId.ToString(),
            Guid.Empty
        );
        
        return MapToDto(entity);
    }

    public async Task<WorkExperienceDto?> UpdateWorkExperienceAsync(Guid id, Guid candidateId, UpdateWorkExperienceDto dto)
    {
        var entity = await _context.WorkExperiences
            .FirstOrDefaultAsync(w => w.Id == id && w.CandidateUserId == candidateId);
        
        if (entity == null) return null;
        
        bool locationChanged = false;
        
        if (dto.EmployerName != null) entity.EmployerName = dto.EmployerName;
        if (dto.LocationText != null) { entity.LocationText = dto.LocationText; locationChanged = true; }
        if (dto.City != null) { entity.City = dto.City; locationChanged = true; }
        if (dto.PostalCode != null) { entity.PostalCode = dto.PostalCode; locationChanged = true; }
        if (dto.RoleTitle != null) entity.RoleTitle = dto.RoleTitle;
        if (dto.Description != null) entity.Description = dto.Description;
        if (dto.StartDate.HasValue) entity.StartDate = dto.StartDate;
        if (dto.EndDate.HasValue) entity.EndDate = dto.EndDate;
        if (dto.VisibilityLevel != null) entity.VisibilityLevel = dto.VisibilityLevel;
        if (dto.IsMapEnabled.HasValue) entity.IsMapEnabled = dto.IsMapEnabled.Value;
        
        // Re-geocode if location changed
        if (locationChanged)
        {
            var (lat, lng) = await _locationService.GetApproxCoordsAsync(
                entity.PostalCode, 
                entity.City ?? entity.LocationText);
            entity.LatApprox = lat;
            entity.LngApprox = lng;
        }
        
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        
        await _auditService.LogAsync(
            "WorkExperienceUpdated",
            "WorkExperience",
            entity.Id.ToString(),
            new { entity.EmployerName, LocationChanged = locationChanged },
            candidateId.ToString(),
            Guid.Empty
        );
        
        return MapToDto(entity);
    }

    public async Task<bool> DeleteWorkExperienceAsync(Guid id, Guid candidateId)
    {
        var entity = await _context.WorkExperiences
            .FirstOrDefaultAsync(w => w.Id == id && w.CandidateUserId == candidateId);
        
        if (entity == null) return false;
        
        _context.WorkExperiences.Remove(entity);
        await _context.SaveChangesAsync();
        
        await _auditService.LogAsync(
            "WorkExperienceDeleted",
            "WorkExperience",
            id.ToString(),
            new { entity.EmployerName },
            candidateId.ToString(),
            Guid.Empty
        );
        
        return true;
    }

    public async Task<List<WorkExperienceDto>> GetVisibleWorkExperiencesForApplicationAsync(Guid applicationId, Guid candidateId)
    {
        // TODO: Implement stage gating logic here (Phase 2 integration)
        // For now, return empty or mock implementation until Application logic is hooked up
        return new List<WorkExperienceDto>(); 
    }

    public async Task<List<WorkExperienceDto>> GetPublicWorkExperiencesAsync(Guid candidateId, bool isShortlisted)
    {
        // 1. Get global map settings
        var mapSettings = await _context.CandidateMapSettings
            .FirstOrDefaultAsync(s => s.CandidateUserId == candidateId);
        
        bool globalMapEnabled = mapSettings?.WorkerMapEnabled ?? false;

        // 2. Get all work experiences
        var entities = await _context.WorkExperiences
            .Where(w => w.CandidateUserId == candidateId)
            .OrderByDescending(w => w.StartDate ?? w.EndDate ?? w.CreatedAt)
            .ToListAsync();

        var visibleDtos = new List<WorkExperienceDto>();

        foreach (var entity in entities)
        {
            // Filter by visibility level
            if (entity.VisibilityLevel == "private") continue;
            
            if (entity.VisibilityLevel == "shortlisted_only" && !isShortlisted) continue;

            // Map to DTO
            var dto = MapToDto(entity);

            // Redact coordinates if map is disabled (globally or per-item)
            if (!globalMapEnabled || !entity.IsMapEnabled)
            {
                dto.LatApprox = null;
                dto.LngApprox = null;
            }

            visibleDtos.Add(dto);
        }

        return visibleDtos;
    }

    private static WorkExperienceDto MapToDto(WorkExperience entity)
    {
        return new WorkExperienceDto
        {
            Id = entity.Id,
            CandidateUserId = entity.CandidateUserId,
            EmployerName = entity.EmployerName,
            LocationText = entity.LocationText,
            City = entity.City,
            PostalCode = entity.PostalCode,
            RoleTitle = entity.RoleTitle,
            Description = entity.Description,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            VisibilityLevel = entity.VisibilityLevel,
            IsMapEnabled = entity.IsMapEnabled,
            LatApprox = entity.LatApprox,
            LngApprox = entity.LngApprox,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    /// <summary>
    /// Backfill coordinates for work experiences missing lat/lng.
    /// Also enables map visibility for testing purposes.
    /// </summary>
    public async Task<int> BackfillCoordinatesAsync()
    {
        // Get ALL work experiences to check/enable map for them
        var entries = await _context.WorkExperiences.ToListAsync();

        int updated = 0;
        var affectedUserIds = new HashSet<Guid>();

        foreach (var entry in entries)
        {
            bool wasUpdated = false;

            // 1. Geocode if missing
            if (entry.LatApprox == null || entry.LngApprox == null)
            {
                var (lat, lng) = await _locationService.GetApproxCoordsAsync(entry.PostalCode, entry.City ?? entry.LocationText);
                if (lat.HasValue && lng.HasValue)
                {
                    entry.LatApprox = lat;
                    entry.LngApprox = lng;
                    wasUpdated = true;
                     _logger.LogInformation("Backfilled WorkExperience {Id} for User {UserId}: {Lat}, {Lng}", 
                        entry.Id, entry.CandidateUserId, lat, lng);
                }
            }

            // 2. Enable map if we have coords (force enable for validation)
            if (entry.LatApprox != null && entry.LngApprox != null)
            {
                if (!entry.IsMapEnabled)
                {
                    entry.IsMapEnabled = true;
                    wasUpdated = true;
                }
            }

            if (wasUpdated)
            {
                entry.UpdatedAt = DateTime.UtcNow;
                updated++;
                affectedUserIds.Add(entry.CandidateUserId);
            }
        }

        // Ensure global map setting is enabled for these users
        if (affectedUserIds.Count > 0)
        {
            var existingSettings = await _context.CandidateMapSettings
                .Where(s => affectedUserIds.Contains(s.CandidateUserId))
                .ToListAsync();
            
            var existingUserIds = new HashSet<Guid>(existingSettings.Select(s => s.CandidateUserId));

            // Update existing
            foreach (var setting in existingSettings)
            {
                if (!setting.WorkerMapEnabled)
                {
                    setting.WorkerMapEnabled = true;
                    setting.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Create missing
            foreach (var userId in affectedUserIds)
            {
                if (!existingUserIds.Contains(userId))
                {
                    _context.CandidateMapSettings.Add(new CandidateMapSettings
                    {
                        CandidateUserId = userId,
                        WorkerMapEnabled = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        if (updated > 0 || affectedUserIds.Count > 0)
        {
            await _context.SaveChangesAsync();
        }

        return updated;
    }
}
