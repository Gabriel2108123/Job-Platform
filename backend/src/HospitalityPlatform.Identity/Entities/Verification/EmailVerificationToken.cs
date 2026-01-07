using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Identity.Entities.Verification;

/// <summary>
/// Email verification token for user email verification
/// </summary>
public class EmailVerificationToken : BaseEntity
{
    /// <summary>
    /// User ID this token belongs to
    /// </summary>
    public required Guid UserId { get; set; }

    /// <summary>
    /// Hashed token (SHA256 of the actual token sent via email)
    /// </summary>
    public required string HashedToken { get; set; }

    /// <summary>
    /// Token expiry time (UTC)
    /// </summary>
    public required DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Whether this token has been used
    /// </summary>
    public bool IsUsed { get; set; } = false;

    /// <summary>
    /// When the token was used (if at all)
    /// </summary>
    public DateTime? UsedAt { get; set; }

    // Navigation properties
    public ApplicationUser? User { get; set; }
}
