namespace HospitalityPlatform.Identity.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendVerificationEmailAsync(string to, string verificationUrl);
}
