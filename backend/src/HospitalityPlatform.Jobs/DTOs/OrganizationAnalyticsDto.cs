namespace HospitalityPlatform.Jobs.DTOs;

public class OrganizationAnalyticsDto
{
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public int DraftJobs { get; set; }
    public int TotalViews { get; set; }
    public int TotalApplications { get; set; }
    public double AvgConversionRate { get; set; }
    public List<JobPerformanceDto> TopPerformingJobs { get; set; } = new();
}

public class JobPerformanceDto
{
    public Guid JobId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Views { get; set; }
    public int Applications { get; set; }
    public double ConversionRate { get; set; }
}
