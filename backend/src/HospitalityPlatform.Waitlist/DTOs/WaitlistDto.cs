using HospitalityPlatform.Waitlist.Enums;

namespace HospitalityPlatform.Waitlist.DTOs;

/// <summary>
/// Request DTO for creating a waitlist entry
/// </summary>
public class CreateWaitlistEntryDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public AccountType AccountType { get; set; }
    public string BusinessOrProfession { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Source { get; set; }
    
    /// <summary>
    /// Anti-spam honeypot field (should be empty on valid submission)
    /// </summary>
    public string? Honeypot { get; set; }
}

/// <summary>
/// Response DTO for waitlist entry
/// </summary>
public class WaitlistEntryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public AccountType AccountType { get; set; }
    public string BusinessOrProfession { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int SequenceNumber { get; set; }
    public IncentiveType IncentiveAwarded { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Paginated result for admin list endpoint
/// </summary>
public class WaitlistPagedResult
{
    public List<WaitlistEntryDto> Entries { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
