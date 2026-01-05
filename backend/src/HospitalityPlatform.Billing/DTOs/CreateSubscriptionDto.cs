namespace HospitalityPlatform.Billing.DTOs;

public class CreateSubscriptionDto
{
    public Guid OrganizationId { get; set; }
    public required string PlanType { get; set; }
    public required string StripePaymentMethodId { get; set; }
}
