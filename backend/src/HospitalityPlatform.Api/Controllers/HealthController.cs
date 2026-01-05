using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Version = "1.0.0",
            Service = "Hospitality Platform API"
        });
    }

    [HttpGet("secure")]
    [Authorize]
    public IActionResult GetSecureHealth()
    {
        var userId = User.FindFirst("sub")?.Value ?? User.Identity?.Name;
        return Ok(new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            AuthenticatedUser = userId
        });
    }
}
