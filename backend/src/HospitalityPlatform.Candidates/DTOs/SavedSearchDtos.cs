namespace HospitalityPlatform.Candidates.DTOs;

public class SavedSearchDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SearchParamsJson { get; set; } = string.Empty;
    public bool EnableEmailAlerts { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSavedSearchDto
{
    public string Name { get; set; } = string.Empty;
    public string SearchParamsJson { get; set; } = string.Empty;
    public bool EnableEmailAlerts { get; set; }
}

public class UpdateSavedSearchDto
{
    public string? Name { get; set; }
    public string? SearchParamsJson { get; set; }
    public bool? EnableEmailAlerts { get; set; }
}
