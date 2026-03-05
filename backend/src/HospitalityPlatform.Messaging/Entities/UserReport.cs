using System;
using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Messaging.Entities;

public class UserReport
{
    public Guid Id { get; set; }
    
    [Required]
    public string ReporterUserId { get; set; } = string.Empty;
    
    [Required]
    public string ReportedUserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Reason { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Reviewed, Resolved
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedByUserId { get; set; }
}
