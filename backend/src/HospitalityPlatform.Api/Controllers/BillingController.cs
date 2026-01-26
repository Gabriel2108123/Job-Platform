using HospitalityPlatform.Billing.DTOs;
using HospitalityPlatform.Billing.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/billing")]
[Authorize(Roles = "BusinessOwner,Admin")]
public class BillingController : ControllerBase
{
    private readonly IBillingService _billingService;
    private readonly ILogger<BillingController> _logger;

    public BillingController(IBillingService billingService, ILogger<BillingController> logger)
    {
        _billingService = billingService;
        _logger = logger;
    }

    [HttpPost("subscribe")]
    [Authorize(Policy = "RequireBusinessOwner")]
    public async Task<ActionResult<SubscriptionDto>> CreateSubscription(CreateSubscriptionDto dto)
    {
        try
        {
            var subscription = await _billingService.CreateSubscriptionAsync(
                dto.OrganizationId,
                dto.PlanType,
                dto.StripePaymentMethodId);

            _logger.LogInformation("Created subscription for organization {OrganizationId}", dto.OrganizationId);
            return Ok(subscription);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subscription for organization {OrganizationId}", dto.OrganizationId);
            return StatusCode(500, new { error = "Failed to create subscription" });
        }
    }

    [HttpGet("subscription/{organizationId}")]
    [Authorize(Policy = "RequireOrganizationAccess")]
    public async Task<ActionResult<SubscriptionDto>> GetSubscription(Guid organizationId)
    {
        try
        {
            var subscription = await _billingService.GetSubscriptionAsync(organizationId);
            
            if (subscription == null)
            {
                return NotFound(new { error = "No subscription found for organization" });
            }

            return Ok(subscription);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching subscription for organization {OrganizationId}", organizationId);
            return StatusCode(500, new { error = "Failed to fetch subscription" });
        }
    }

    [HttpDelete("subscription/{organizationId}")]
    [Authorize(Policy = "RequireBusinessOwner")]
    public async Task<IActionResult> CancelSubscription(Guid organizationId)
    {
        try
        {
            var result = await _billingService.CancelSubscriptionAsync(organizationId);
            
            if (!result)
            {
                return NotFound(new { error = "Subscription not found" });
            }

            _logger.LogInformation("Cancelled subscription for organization {OrganizationId}", organizationId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling subscription for organization {OrganizationId}", organizationId);
            return StatusCode(500, new { error = "Failed to cancel subscription" });
        }
    }

    [HttpGet("plans")]
    public async Task<ActionResult<List<PlanDto>>> GetPlans()
    {
        try
        {
            var plans = await _billingService.GetPlansAsync();
            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching plans");
            return StatusCode(500, new { error = "Failed to fetch plans" });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleWebhook([FromBody] WebhookPayload payload)
    {
        try
        {
            var result = await _billingService.ProcessWebhookEventAsync(
                payload.Id,
                payload.Type,
                System.Text.Json.JsonSerializer.Serialize(payload.Data));

            if (!result)
            {
                _logger.LogWarning("Webhook event {EventId} already processed", payload.Id);
                return Ok(new { message = "Webhook event already processed" });
            }

            _logger.LogInformation("Processed webhook event {EventId} of type {Type}", payload.Id, payload.Type);
            return Ok(new { message = "Webhook processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing webhook event");
            return StatusCode(500, new { error = "Failed to process webhook" });
        }
    }
}

/// <summary>
/// Represents a Stripe webhook payload structure
/// </summary>
public class WebhookPayload
{
    public required string Id { get; set; }
    public required string Type { get; set; }
    public required object Data { get; set; }
}
