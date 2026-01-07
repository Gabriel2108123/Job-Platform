using HospitalityPlatform.Applications.Enums;

namespace HospitalityPlatform.Applications.DTOs;

public class ApplicationStatusHistoryDto
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    
    public ApplicationStatus? FromStatus { get; set; }
    public string? FromStatusName { get; set; }
    
    public ApplicationStatus ToStatus { get; set; }
    public string ToStatusName { get; set; } = string.Empty;
    
    public string ChangedByUserId { get; set; } = string.Empty;
    public string? ChangedByUserName { get; set; }
    
    public DateTime ChangedAt { get; set; }
    public string? Notes { get; set; }
    
    public bool? PreHireCheckConfirmation { get; set; }
    public string? PreHireCheckConfirmationText { get; set; }
}
