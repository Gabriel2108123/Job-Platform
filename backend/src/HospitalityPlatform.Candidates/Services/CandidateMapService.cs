using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Candidates.Entities;
using HospitalityPlatform.Audit.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Candidates.Services;

public class CandidateMapService : ICandidateMapService
{
    private readonly ICandidatesDbContext _context;
    private readonly IAuditService _auditService;
    private readonly ILogger<CandidateMapService> _logger;

    public CandidateMapService(
        ICandidatesDbContext context,
        IAuditService auditService,
        ILogger<CandidateMapService> logger)
    {
        _context = context;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<CandidateMapSettingsDto> GetSettingsAsync(Guid candidateId)
    {
        var entity = await _context.CandidateMapSettings
            .FirstOrDefaultAsync(s => s.CandidateUserId == candidateId);
            
        if (entity == null)
        {
            // Return defaults if not found (privacy by default: all false)
            return new CandidateMapSettingsDto
            {
                WorkerMapEnabled = false,
                DiscoverableByWorkplaces = false,
                AllowConnectionRequests = false,
                UpdatedAt = DateTime.UtcNow // Approximate
            };
        }
        
        return MapToDto(entity);
    }

    public async Task<CandidateMapSettingsDto> UpdateSettingsAsync(Guid candidateId, UpdateCandidateMapSettingsDto dto)
    {
        var entity = await _context.CandidateMapSettings
            .FirstOrDefaultAsync(s => s.CandidateUserId == candidateId);
            
        bool isNew = false;
        if (entity == null)
        {
            isNew = true;
            entity = new CandidateMapSettings
            {
                CandidateUserId = candidateId,
                WorkerMapEnabled = false,
                DiscoverableByWorkplaces = false,
                AllowConnectionRequests = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.CandidateMapSettings.Add(entity);
        }
        
        if (dto.WorkerMapEnabled.HasValue) entity.WorkerMapEnabled = dto.WorkerMapEnabled.Value;
        if (dto.DiscoverableByWorkplaces.HasValue) entity.DiscoverableByWorkplaces = dto.DiscoverableByWorkplaces.Value;
        if (dto.AllowConnectionRequests.HasValue) entity.AllowConnectionRequests = dto.AllowConnectionRequests.Value;
        
        entity.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        
        await _auditService.LogAsync(
            "CandidateMapSettingsUpdated",
            "CandidateMapSettings",
            candidateId.ToString(),
            new { entity.WorkerMapEnabled, entity.DiscoverableByWorkplaces },
            candidateId.ToString(),
            Guid.Empty
        );
        
        return MapToDto(entity);
    }

    private static CandidateMapSettingsDto MapToDto(CandidateMapSettings entity)
    {
        return new CandidateMapSettingsDto
        {
            WorkerMapEnabled = entity.WorkerMapEnabled,
            DiscoverableByWorkplaces = entity.DiscoverableByWorkplaces,
            AllowConnectionRequests = entity.AllowConnectionRequests,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
