using HospitalityPlatform.Applications.Enums;
using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Applications.DTOs;

public class CreateApplicationDto
{
    [Required]
    public Guid JobId { get; set; }
    
    [StringLength(5000)]
    public string? CoverLetter { get; set; }
    
    [StringLength(500)]
    public string? CvFileUrl { get; set; }
}
