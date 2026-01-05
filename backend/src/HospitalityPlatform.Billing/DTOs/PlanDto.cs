namespace HospitalityPlatform.Billing.DTOs;

public class PlanDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string PlanType { get; set; } = string.Empty;
    public int PriceInCents { get; set; }
    public bool IsActive { get; set; }
}
