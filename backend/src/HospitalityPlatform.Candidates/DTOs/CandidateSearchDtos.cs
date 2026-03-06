namespace HospitalityPlatform.Candidates.DTOs;

public class CandidateSearchFilterDto
{
    public Guid? JobRoleId { get; set; }
    public string[]? Skills { get; set; }
    public string? Query { get; set; } // For bio/name search
    public string? City { get; set; }
    public decimal? Lat { get; set; }
    public decimal? Lng { get; set; }
    public double? RadiusKm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class CandidateSearchResultDto
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? Bio { get; set; }
    public string? PrimaryRole { get; set; }
    public string[]? Skills { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? City { get; set; }
    public DateTime? LastActiveAt { get; set; }
    public double? DistanceKm { get; set; }
    public double MatchScore { get; set; } // 0-100
}

public class CandidatePagedSearchResultDto
{
    public List<CandidateSearchResultDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int TotalPages { get; set; }
}
