using Microsoft.Extensions.Caching.Memory;
using System.Net;

namespace HospitalityPlatform.Api.Middleware;

public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RateLimitMiddleware> _logger;

    public RateLimitMiddleware(RequestDelegate next, IMemoryCache cache, ILogger<RateLimitMiddleware> logger)
    {
        _next = next;
        _cache = cache;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.ToString().ToLower();
        var userId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            await _next(context);
            return;
        }

        // Connection Requests: Max 10 per hour
        if (path.Contains("/api/candidates/connections") && context.Request.Method == "POST")
        {
            if (IsRateLimited(userId, "ConnectionRequest", 10, TimeSpan.FromHours(1)))
            {
                _logger.LogWarning("Rate limit exceeded for ConnectionRequest. UserId: {UserId}", userId);
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                await context.Response.WriteAsJsonAsync(new { message = "Connection request rate limit exceeded. Try again later." });
                return;
            }
        }

        // Reports: Max 5 per hour
        if (path.Contains("/api/safety/report") && context.Request.Method == "POST")
        {
            if (IsRateLimited(userId, "UserReport", 5, TimeSpan.FromHours(1)))
            {
                _logger.LogWarning("Rate limit exceeded for UserReport. UserId: {UserId}", userId);
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                await context.Response.WriteAsJsonAsync(new { message = "Reporting rate limit exceeded." });
                return;
            }
        }

        await _next(context);
    }

    private bool IsRateLimited(string userId, string action, int limit, TimeSpan period)
    {
        var key = $"rl_{action}_{userId}";
        var count = _cache.Get<int?>(key) ?? 0;

        if (count >= limit)
        {
            return true;
        }

        _cache.Set(key, count + 1, period);
        return false;
    }
}
