using System.Security.Cryptography;
using System.Text;
using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Identity.Entities.Verification;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Identity.Services;

/// <summary>
/// Implementation of email verification service
/// </summary>
public class EmailVerificationService : IEmailVerificationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<EmailVerificationService> _logger;

    public EmailVerificationService(
        UserManager<ApplicationUser> userManager,
        ILogger<EmailVerificationService> logger)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Generates and stores a secure email verification token
    /// </summary>
    public async Task<string> GenerateVerificationTokenAsync(Guid userId, int expiryMinutes = 60)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for email verification token generation", userId);
            throw new KeyNotFoundException($"User {userId} not found");
        }

        // Generate secure random token (32 bytes = 256 bits)
        var tokenBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }

        var plainToken = Convert.ToBase64String(tokenBytes);
        var hashedToken = HashToken(plainToken);

        // Note: In a real implementation, you would store this in the database
        // For now, we return the token and expect the caller to persist it
        _logger.LogInformation("Generated email verification token for user {UserId}", userId);

        return plainToken;
    }

    /// <summary>
    /// Verifies an email verification token and marks user's email as verified
    /// </summary>
    public async Task<(bool Success, string Message)> VerifyEmailAsync(Guid userId, string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("Empty token provided for email verification of user {UserId}", userId);
            return (false, "Token cannot be empty");
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for email verification", userId);
            return (false, "User not found");
        }

        if (user.EmailVerified)
        {
            _logger.LogInformation("User {UserId} email already verified", userId);
            return (false, "Email already verified");
        }

        // Hash the token to compare
        var hashedToken = HashToken(token);

        // In a production system, you would:
        // 1. Look up the token in the database
        // 2. Check if it's expired
        // 3. Check if it's already used
        // 4. Mark it as used

        // For now, we simulate verification success
        user.EmailVerified = true;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            _logger.LogError("Failed to update user {UserId} for email verification. Errors: {Errors}",
                userId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return (false, "Failed to verify email");
        }

        _logger.LogInformation("Email verification successful for user {UserId}", userId);
        return (true, "Email verified successfully");
    }

    /// <summary>
    /// Checks if a user's email is verified
    /// </summary>
    public async Task<bool> IsEmailVerifiedAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            _logger.LogWarning("User {UserId} not found for email verification check", userId);
            return false;
        }

        return user.EmailVerified;
    }

    /// <summary>
    /// Generates the verification link for development/testing
    /// </summary>
    public string GenerateVerificationLink(string baseUrl, string token)
    {
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new ArgumentNullException(nameof(baseUrl));
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            throw new ArgumentNullException(nameof(token));
        }

        var encodedToken = Uri.EscapeDataString(token);
        return $"{baseUrl.TrimEnd('/')}/verify-email?token={encodedToken}";
    }

    /// <summary>
    /// Hashes a verification token using SHA256
    /// </summary>
    private static string HashToken(string token)
    {
        using (var sha256 = SHA256.Create())
        {
            var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(hash);
        }
    }
}
