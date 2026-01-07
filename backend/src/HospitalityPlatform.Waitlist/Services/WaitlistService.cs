using System.Text;
using HospitalityPlatform.Audit.Services;
using HospitalityPlatform.Waitlist.DTOs;
using HospitalityPlatform.Waitlist.Entities;
using HospitalityPlatform.Waitlist.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Waitlist.Services;

/// <summary>
/// Waitlist service implementation with sequence assignment and incentive calculation
/// </summary>
public class WaitlistService : IWaitlistService
{
    private readonly IWaitlistDbContext _context;
    private readonly IAuditService _auditService;
    private readonly ILogger<WaitlistService> _logger;
    
    // Early-joiner incentive thresholds
    private const int BusinessIncentiveLimit = 1000;
    private const int CandidateIncentiveLimit = 5000;

    public WaitlistService(
        IWaitlistDbContext context,
        IAuditService auditService,
        ILogger<WaitlistService> logger)
    {
        _context = context;
        _auditService = auditService;
        _logger = logger;
    }

    /// <summary>
    /// Create waitlist entry with automatic sequence assignment and incentive calculation
    /// </summary>
    public async Task<WaitlistEntryDto> CreateWaitlistEntryAsync(CreateWaitlistEntryDto dto)
    {
        // Normalize email (lowercase, trimmed)
        var normalizedEmail = dto.Email.ToLowerInvariant().Trim();
        
        // Check for duplicate email
        var existing = await _context.WaitlistEntries
            .FirstOrDefaultAsync(w => w.Email == normalizedEmail);
        
        if (existing != null)
        {
            throw new InvalidOperationException("Email already on waitlist");
        }
        
        // Get next sequence number for account type
        var sequenceNumber = await GetNextSequenceNumberAsync(dto.AccountType);
        
        // Calculate incentive
        var incentive = CalculateIncentive(dto.AccountType, sequenceNumber);
        
        // Create entry
        var entry = new WaitlistEntry
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Email = normalizedEmail,
            AccountType = dto.AccountType,
            BusinessOrProfession = dto.BusinessOrProfession.Trim(),
            Location = dto.Location.Trim(),
            SequenceNumber = sequenceNumber,
            IncentiveAwarded = incentive,
            Source = dto.Source ?? "landing_page",
            CreatedAt = DateTime.UtcNow
        };
        
        _context.WaitlistEntries.Add(entry);
        await _context.SaveChangesAsync();
        
        // Audit log
        await _auditService.LogAsync(
            action: "WaitlistEntryCreated",
            entityType: "WaitlistEntry",
            entityId: entry.Id.ToString(),
            details: new
            {
                Email = normalizedEmail,
                AccountType = dto.AccountType.ToString(),
                SequenceNumber = sequenceNumber,
                IncentiveAwarded = incentive.ToString()
            },
            userId: null!,
            organizationId: Guid.Empty
        );
        
        _logger.LogInformation(
            "Waitlist entry created: {Email} ({AccountType}) - Sequence: {Sequence}, Incentive: {Incentive}",
            normalizedEmail, dto.AccountType, sequenceNumber, incentive);
        
        return MapToDto(entry);
    }

    /// <summary>
    /// Get paginated list of waitlist entries with optional account type filter
    /// </summary>
    public async Task<WaitlistPagedResult> GetWaitlistEntriesAsync(
        int pageNumber = 1,
        int pageSize = 50,
        int? accountTypeFilter = null)
    {
        var query = _context.WaitlistEntries.AsQueryable();
        
        if (accountTypeFilter.HasValue)
        {
            query = query.Where(w => (int)w.AccountType == accountTypeFilter.Value);
        }
        
        var totalCount = await query.CountAsync();
        
        var entries = await query
            .OrderByDescending(w => w.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return new WaitlistPagedResult
        {
            Entries = entries.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Export waitlist entries as CSV
    /// </summary>
    public async Task<string> ExportWaitlistAsCsvAsync(int? accountTypeFilter = null)
    {
        var query = _context.WaitlistEntries.AsQueryable();
        
        if (accountTypeFilter.HasValue)
        {
            query = query.Where(w => (int)w.AccountType == accountTypeFilter.Value);
        }
        
        var entries = await query
            .OrderBy(w => w.SequenceNumber)
            .ToListAsync();
        
        var csv = new StringBuilder();
        
        // Header
        csv.AppendLine("Id,Name,Email,AccountType,BusinessOrProfession,Location,SequenceNumber,IncentiveAwarded,Source,CreatedAt");
        
        // Data rows
        foreach (var entry in entries)
        {
            csv.AppendLine($"\"{entry.Id}\",\"{EscapeCsv(entry.Name)}\",\"{EscapeCsv(entry.Email)}\",\"{entry.AccountType}\",\"{EscapeCsv(entry.BusinessOrProfession)}\",\"{EscapeCsv(entry.Location)}\",{entry.SequenceNumber},\"{entry.IncentiveAwarded}\",\"{entry.Source}\",\"{entry.CreatedAt:yyyy-MM-dd HH:mm:ss}\"");
        }
        
        // Audit log
        await _auditService.LogAsync(
            action: "WaitlistExported",
            entityType: "Waitlist",
            entityId: null!,
            details: new { EntryCount = entries.Count, AccountTypeFilter = accountTypeFilter?.ToString() ?? "All" },
            userId: null!,
            organizationId: Guid.Empty
        );
        
        _logger.LogInformation("Waitlist exported: {Count} entries", entries.Count);
        
        return csv.ToString();
    }

    /// <summary>
    /// Delete a waitlist entry
    /// </summary>
    public async Task DeleteWaitlistEntryAsync(Guid id)
    {
        var entry = await _context.WaitlistEntries.FindAsync(id)
            ?? throw new KeyNotFoundException($"Waitlist entry {id} not found");
        
        var email = entry.Email;
        
        _context.WaitlistEntries.Remove(entry);
        await _context.SaveChangesAsync();
        
        // Audit log
        await _auditService.LogAsync(
            action: "WaitlistEntryDeleted",
            entityType: "WaitlistEntry",
            entityId: id.ToString(),
            details: new { Email = email, AccountType = entry.AccountType.ToString() },
            userId: null!,
            organizationId: Guid.Empty
        );
        
        _logger.LogInformation("Waitlist entry deleted: {Id} ({Email})", id, email);
    }

    // ===== Private Helpers =====

    /// <summary>
    /// Get next sequence number for account type (separate sequences)
    /// </summary>
    private async Task<int> GetNextSequenceNumberAsync(AccountType accountType)
    {
        var lastSequence = await _context.WaitlistEntries
            .Where(w => w.AccountType == accountType)
            .MaxAsync(w => (int?)w.SequenceNumber) ?? 0;
        
        return lastSequence + 1;
    }

    /// <summary>
    /// Calculate incentive based on account type and sequence number
    /// </summary>
    private static IncentiveType CalculateIncentive(AccountType accountType, int sequenceNumber)
    {
        return accountType switch
        {
            AccountType.Business when sequenceNumber <= BusinessIncentiveLimit => IncentiveType.TwelveMonthsFree,
            AccountType.Candidate when sequenceNumber <= CandidateIncentiveLimit => IncentiveType.TwelveMonthsFree,
            _ => IncentiveType.None
        };
    }

    /// <summary>
    /// Map entity to DTO
    /// </summary>
    private static WaitlistEntryDto MapToDto(WaitlistEntry entry)
    {
        return new WaitlistEntryDto
        {
            Id = entry.Id,
            Name = entry.Name,
            Email = entry.Email,
            AccountType = entry.AccountType,
            BusinessOrProfession = entry.BusinessOrProfession,
            Location = entry.Location,
            SequenceNumber = entry.SequenceNumber,
            IncentiveAwarded = entry.IncentiveAwarded,
            CreatedAt = entry.CreatedAt
        };
    }

    /// <summary>
    /// Escape CSV field values
    /// </summary>
    private static string EscapeCsv(string value)
    {
        return value.Replace("\"", "\"\"");
    }
}
