using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Jobs.Entities;

/// <summary>
/// Stores employer's confirmation of right-to-work checks for a candidate.
/// This is the mandatory gate before marking an application as "Hired".
/// The platform stores only the confirmation flag, timestamp, and user ID.
/// No actual passport or visa data is stored.
/// </summary>
public class PreHireConfirmation : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public Guid ConfirmedByUserId { get; set; } // User ID of the employer staff member
    public Guid OrganizationId { get; set; } // Organization performing the check
    
    /// <summary>
    /// Employer confirms that right-to-work checks have been completed.
    /// This is a business process confirmation, not a platform validation.
    /// </summary>
    public bool RightToWorkConfirmed { get; set; } = false;
    
    /// <summary>
    /// Timestamp when confirmation was made
    /// </summary>
    public DateTime ConfirmedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Versioned confirmation text/policy the employer is accepting
    /// </summary>
    public string? ConfirmationText { get; set; }
    
    /// <summary>
    /// Version of the confirmation policy
    /// </summary>
    public int ConfirmationVersion { get; set; } = 1;
    
    // Navigation property
    public Application? Application { get; set; }
}
