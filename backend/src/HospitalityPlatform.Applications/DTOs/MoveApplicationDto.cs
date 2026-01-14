using HospitalityPlatform.Applications.Enums;
using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Applications.DTOs;

public class MoveApplicationDto
{
    [Required]
    public ApplicationStatus ToStatus { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    public bool? PreHireCheckConfirmation { get; set; }
    public string? PreHireCheckConfirmationText { get; set; }
}

/// <summary>
/// DTO for move-application endpoint (includes ApplicationId in body)
/// </summary>
public class MoveApplicationRequestDto : MoveApplicationDto
{
    [Required]
    public Guid ApplicationId { get; set; }
}
