using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Billing.Entities;

/// <summary>
/// Webhook event for idempotent processing of Stripe events
/// </summary>
public class WebhookEvent : BaseEntity
{
    /// <summary>
    /// Stripe Event ID (for idempotency)
    /// </summary>
    public required string StripeEventId { get; set; }
    
    /// <summary>
    /// Event type (e.g., "customer.subscription.created")
    /// </summary>
    public required string EventType { get; set; }
    
    /// <summary>
    /// Full event payload JSON
    /// </summary>
    public required string Payload { get; set; }
    
    /// <summary>
    /// Whether this event has been processed
    /// </summary>
    public bool IsProcessed { get; set; }
    
    /// <summary>
    /// Related subscription ID if applicable
    /// </summary>
    public Guid? SubscriptionId { get; set; }
    
    /// <summary>
    /// Processing error message if any
    /// </summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>
    /// When the webhook was received
    /// </summary>
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// When the event was processed
    /// </summary>
    public DateTime? ProcessedAt { get; set; }
}
