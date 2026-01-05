namespace HospitalityPlatform.Entitlements.DTOs;

public class EntitlementLimitDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public required string LimitType { get; set; }
    public int MaxLimit { get; set; }
    public int CurrentUsage { get; set; }
    public int RemainingLimit => MaxLimit - CurrentUsage;
    public required string PlanType { get; set; }
    public DateTime? ResetDate { get; set; }
}
