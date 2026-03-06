using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Identity.Entities;

namespace HospitalityPlatform.Billing.Entities;

public class Invoice : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public long AmountInCents { get; set; }
    public string Currency { get; set; } = "GBP";
    public string Status { get; set; } = "paid"; // paid, open, void, uncollectible
    public string StripeInvoiceId { get; set; } = string.Empty;
    public string? InvoiceUrl { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime BilledAt { get; set; }

    public virtual Organization Organization { get; set; } = null!;
}
