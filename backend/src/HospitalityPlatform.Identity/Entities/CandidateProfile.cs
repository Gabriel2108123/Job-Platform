using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Identity.Entities;

/// <summary>
/// Candidate profile with age-related information
/// Only used for Candidate role users
/// </summary>
public class CandidateProfile : BaseEntity
{
    /// <summary>
    /// User ID (Candidate user)
    /// </summary>
    public required Guid UserId { get; set; }

    /// <summary>
    /// Date of birth (used to enforce minimum age of 16)
    /// </summary>
    public required DateTime DateOfBirth { get; set; }

    /// <summary>
    /// Short professional bio
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Structured resume data stored as JSON
    /// </summary>
    public string? ResumeJson { get; set; }

    // Navigation properties
    public ApplicationUser? User { get; set; }
}
