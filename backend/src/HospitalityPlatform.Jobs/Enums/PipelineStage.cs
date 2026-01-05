namespace HospitalityPlatform.Jobs.Enums;

/// <summary>
/// Pipeline stages for job applications (for Kanban visualization)
/// </summary>
public enum PipelineStage
{
    Applied = 0,
    Screening = 1,
    Interview = 2,
    Offer = 3,
    PreHireChecks = 4,
    Hired = 5,
    Rejected = 6,
    Withdrawn = 7
}
