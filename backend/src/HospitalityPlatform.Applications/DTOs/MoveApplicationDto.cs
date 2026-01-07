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
