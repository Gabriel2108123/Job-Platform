using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/system")]
public class SystemController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _env;

    public SystemController(IConfiguration configuration, IHostEnvironment env)
    {
        _configuration = configuration;
        _env = env;
    }

    /// <summary>
    /// Gets non-sensitive system configuration and feature flags for the frontend.
    /// </summary>
    [HttpGet("config")]
    [AllowAnonymous]
    public IActionResult GetConfig()
    {
        var featureFlags = _configuration.GetSection("FeatureFlags").GetChildren().ToDictionary(x => x.Key, x => bool.TryParse(x.Value, out var parsed) ? parsed : false);

        // Ensure RequireEmailVerification is explicitly present if missing from config
        if (!featureFlags.ContainsKey("RequireEmailVerification"))
        {
            featureFlags["RequireEmailVerification"] = true; // Safe default
        }

        return Ok(new
        {
            environment = _env.EnvironmentName,
            featureFlags = featureFlags
        });
    }
}
