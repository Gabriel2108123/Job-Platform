using HospitalityPlatform.Jobs.Enums;

namespace HospitalityPlatform.Jobs.DTOs;

/// <summary>
/// Data for Kanban pipeline view - counts applications per stage
/// </summary>
public class PipelineStageDto
{
    public PipelineStage Stage { get; set; }
    public string StageName { get; set; } = string.Empty;
    public int Count { get; set; }
    public List<ApplicationDto> Applications { get; set; } = new();
}

public class PipelineKanbanDto
{
    public Guid JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public List<PipelineStageDto> Stages { get; set; } = new();
    public int TotalApplications { get; set; }
}
