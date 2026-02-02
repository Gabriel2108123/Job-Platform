using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Candidates.DTOs;

public class CandidateMapSettingsDto
{
    public bool WorkerMapEnabled { get; set; }
    public bool DiscoverableByWorkplaces { get; set; }
    public bool AllowConnectionRequests { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateCandidateMapSettingsDto
{
    public bool? WorkerMapEnabled { get; set; }
    public bool? DiscoverableByWorkplaces { get; set; }
    public bool? AllowConnectionRequests { get; set; }
}
