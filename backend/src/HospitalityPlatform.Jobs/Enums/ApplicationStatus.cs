namespace HospitalityPlatform.Jobs.Enums;

/// <summary>
/// Application status in the hiring pipeline
/// </summary>
public enum ApplicationStatus
{
    Applied = 0,
    Screening = 1,
    Interviewed = 2,
    Offered = 3,
    PreHireChecks = 4,
    Hired = 5,
    Rejected = 6,
    Withdrawn = 7
}
