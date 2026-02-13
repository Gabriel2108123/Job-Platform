using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Identity.Services;

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body)
    {
        _logger.LogInformation("Assuming email sent to {To}", to);
        _logger.LogInformation("Subject: {Subject}", subject);
        _logger.LogInformation("Body: {Body}", body);
        return Task.CompletedTask;
    }

    public Task SendVerificationEmailAsync(string to, string verificationUrl)
    {
        _logger.LogInformation("==================================================================");
        _logger.LogInformation("MOCK EMAIL SERVICE - VERIFICATION LINK");
        _logger.LogInformation("To: {To}", to);
        _logger.LogInformation("Link: {Link}", verificationUrl);
        _logger.LogInformation("==================================================================");
        
        // Also write to Console for easier visibility in terminal
        Console.WriteLine("\n========== EMAIL VERIFICATION ==========");
        Console.WriteLine($"To: {to}");
        Console.WriteLine($"Link: {verificationUrl}");
        Console.WriteLine("=========================================\n");

        return Task.CompletedTask;
    }
}
