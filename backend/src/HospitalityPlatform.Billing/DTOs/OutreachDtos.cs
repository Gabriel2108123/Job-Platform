namespace HospitalityPlatform.Billing.DTOs;

public class OutreachRequestDto
{
    public Guid CandidateUserId { get; set; }
    public Guid? JobId { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class OutreachResultDto
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public int RemainingBalance { get; set; }
}
