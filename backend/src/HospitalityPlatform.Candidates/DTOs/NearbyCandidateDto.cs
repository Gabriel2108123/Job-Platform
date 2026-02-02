namespace HospitalityPlatform.Candidates.DTOs;

public class NearbyCandidateDto
{
    public Guid CandidateUserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double DistanceKm { get; set; }
    public int VerifiedConnectionCount { get; set; }
    public string? CurrentRole { get; set; }
    public string? CurrentEmployer { get; set; }
    public double? LatApprox { get; set; }
    public double? LngApprox { get; set; }
}
