namespace HospitalityPlatform.Candidates.DTOs;

public class PotentialCoworkerDto
{
    public Guid CandidateUserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastNameInitial { get; set; } = string.Empty;
    public string SharedWorkplace { get; set; } = string.Empty;
    public string PlaceKey { get; set; } = string.Empty;
    public DateTime OverlapStart { get; set; }
    public DateTime OverlapEnd { get; set; }
    public int OverlapDays { get; set; }
}
