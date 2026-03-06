using HospitalityPlatform.Candidates.DTOs;
using HospitalityPlatform.Identity.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Candidates.Services;

public class SavedSearchService : ISavedSearchService
{
    private readonly ICandidatesDbContext _context;

    public SavedSearchService(ICandidatesDbContext context)
    {
        _context = context;
    }

    public async Task<List<SavedSearchDto>> GetSavedSearchesAsync(Guid userId, Guid organizationId)
    {
        return await _context.SavedSearches
            .Where(s => s.UserId == userId && s.OrganizationId == organizationId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SavedSearchDto
            {
                Id = s.Id,
                Name = s.Name,
                SearchParamsJson = s.SearchParamsJson,
                EnableEmailAlerts = s.EnableEmailAlerts,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<SavedSearchDto> CreateSavedSearchAsync(Guid userId, Guid organizationId, CreateSavedSearchDto dto)
    {
        var savedSearch = new SavedSearch
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OrganizationId = organizationId,
            Name = dto.Name,
            SearchParamsJson = dto.SearchParamsJson,
            EnableEmailAlerts = dto.EnableEmailAlerts,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.SavedSearches.Add(savedSearch);
        await _context.SaveChangesAsync();

        return new SavedSearchDto
        {
            Id = savedSearch.Id,
            Name = savedSearch.Name,
            SearchParamsJson = savedSearch.SearchParamsJson,
            EnableEmailAlerts = savedSearch.EnableEmailAlerts,
            CreatedAt = savedSearch.CreatedAt
        };
    }

    public async Task<SavedSearchDto> UpdateSavedSearchAsync(Guid id, Guid userId, UpdateSavedSearchDto dto)
    {
        var savedSearch = await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (savedSearch == null)
        {
            throw new KeyNotFoundException("Saved search not found");
        }

        if (dto.Name != null) savedSearch.Name = dto.Name;
        if (dto.SearchParamsJson != null) savedSearch.SearchParamsJson = dto.SearchParamsJson;
        if (dto.EnableEmailAlerts.HasValue) savedSearch.EnableEmailAlerts = dto.EnableEmailAlerts.Value;
        
        savedSearch.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new SavedSearchDto
        {
            Id = savedSearch.Id,
            Name = savedSearch.Name,
            SearchParamsJson = savedSearch.SearchParamsJson,
            EnableEmailAlerts = savedSearch.EnableEmailAlerts,
            CreatedAt = savedSearch.CreatedAt
        };
    }

    public async Task DeleteSavedSearchAsync(Guid id, Guid userId)
    {
        var savedSearch = await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        if (savedSearch != null)
        {
            _context.SavedSearches.Remove(savedSearch);
            await _context.SaveChangesAsync();
        }
    }
}
