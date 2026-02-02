using System.Net;
using System.Text.Json;

namespace HospitalityPlatform.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = exception switch
        {
            KeyNotFoundException => new { StatusCode = (int)HttpStatusCode.NotFound, Message = exception.Message },
            InvalidOperationException => new { StatusCode = (int)HttpStatusCode.BadRequest, Message = exception.Message },
            UnauthorizedAccessException => new { StatusCode = (int)HttpStatusCode.Unauthorized, Message = "Unauthorized access" },
            _ => new { StatusCode = (int)HttpStatusCode.InternalServerError, Message = _env.IsDevelopment() ? exception.Message : "An unexpected error occurred." }
        };

        context.Response.StatusCode = response.StatusCode;

        var result = JsonSerializer.Serialize(new
        {
            error = response.Message,
            details = _env.IsDevelopment() ? exception.ToString() : null
        });

        await context.Response.WriteAsync(result);
    }
}
