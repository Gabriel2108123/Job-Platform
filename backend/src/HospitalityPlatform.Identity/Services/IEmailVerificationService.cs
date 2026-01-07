namespace HospitalityPlatform.Identity.Services;

/// <summary>
/// Interface for email verification service
/// </summary>
public interface IEmailVerificationService
{
    /// <summary>
    /// Generates and stores a secure email verification token
    /// </summary>
    /// <param name="userId">User ID to generate token for</param>
    /// <param name="expiryMinutes">Token expiry time in minutes (default 60)</param>
    /// <returns>Plain text token to send via email</returns>
    Task<string> GenerateVerificationTokenAsync(Guid userId, int expiryMinutes = 60);

    /// <summary>
    /// Verifies an email verification token and marks user's email as verified
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="token">Plain text verification token</param>
    /// <returns>Tuple of (success, message)</returns>
    Task<(bool Success, string Message)> VerifyEmailAsync(Guid userId, string token);

    /// <summary>
    /// Checks if a user's email is verified
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>True if email is verified</returns>
    Task<bool> IsEmailVerifiedAsync(Guid userId);

    /// <summary>
    /// Generates the verification link for development/testing
    /// </summary>
    /// <param name="baseUrl">Base URL of the application</param>
    /// <param name="token">Verification token</param>
    /// <returns>Full verification URL</returns>
    string GenerateVerificationLink(string baseUrl, string token);
}
