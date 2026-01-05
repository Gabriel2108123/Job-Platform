namespace HospitalityPlatform.Billing.DTOs;

public class SubscriptionDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public required string StripeSubscriptionId { get; set; }
    public required string Status { get; set; }
    public required string PlanType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? NextBillingDate { get; set; }
    public DateTime? CancelledAt { get; set; }
    public int PriceInCents { get; set; }
    public DateTime? TrialEndsAt { get; set; }
}
