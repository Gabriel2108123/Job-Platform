namespace HospitalityPlatform.Billing.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public long AmountInCents { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string StripeInvoiceId { get; set; } = string.Empty;
    public string? InvoiceUrl { get; set; }
    public string? ReceiptUrl { get; set; }
    public DateTime BilledAt { get; set; }
}
