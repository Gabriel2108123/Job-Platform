using HospitalityPlatform.Waitlist.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Waitlist.Services;

/// <summary>
/// Waitlist service interface - manages waitlist entries and incentives
/// </summary>
public interface IWaitlistService
{
    /// <summary>
    /// Create a new waitlist entry with automatic sequence assignment and incentive calculation
    /// </summary>
    Task<WaitlistEntryDto> CreateWaitlistEntryAsync(CreateWaitlistEntryDto dto);
    
    /// <summary>
    /// Get paginated list of waitlist entries (admin only)
    /// </summary>
    Task<WaitlistPagedResult> GetWaitlistEntriesAsync(int pageNumber = 1, int pageSize = 50, int? accountTypeFilter = null);
    
    /// <summary>
    /// Export waitlist entries as CSV (admin only)
    /// </summary>
    Task<string> ExportWaitlistAsCsvAsync(int? accountTypeFilter = null);
    
    /// <summary>
    /// Delete a waitlist entry (admin only)
    /// </summary>
    Task DeleteWaitlistEntryAsync(Guid id);
}

/// <summary>
/// Database context interface for waitlist access
/// </summary>
public interface IWaitlistDbContext
{
    DbSet<HospitalityPlatform.Waitlist.Entities.WaitlistEntry> WaitlistEntries { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
