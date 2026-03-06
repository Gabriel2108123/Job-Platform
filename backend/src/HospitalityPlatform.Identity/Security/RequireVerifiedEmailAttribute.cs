using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using HospitalityPlatform.Identity.Entities;

namespace HospitalityPlatform.Identity.Security;

/// <summary>
/// Action filter that enforces email verification.
/// Bypasses verification if FeatureFlags:RequireEmailVerification is false, auditing the bypass.
/// </summary>
public class RequireVerifiedEmailAttribute : ActionFilterAttribute
{
    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var requireEmailVerification = config.GetValue<bool>("FeatureFlags:RequireEmailVerification", true);

        var userIdString = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? context.HttpContext.User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdString))
        {
            await next();
            return;
        }

        if (!requireEmailVerification)
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<RequireVerifiedEmailAttribute>>();
            logger.LogInformation("AUDIT: {Action} - {Metadata}", 
                "EmailVerificationBypassUsed", 
                $"{{ endpoint: \"{context.HttpContext.Request.Path}\", userId: \"{userIdString}\" }}");
            
            await next();
            return;
        }

        var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();
        var user = await userManager.FindByIdAsync(userIdString);

        if (user == null || !user.EmailConfirmed)
        {
            context.Result = new ObjectResult(new { message = "Please verify your email address to perform this action." })
            {
                StatusCode = 403
            };
            return;
        }

        await next();
    }
}
