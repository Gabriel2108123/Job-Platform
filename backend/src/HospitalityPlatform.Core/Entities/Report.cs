using System;

namespace HospitalityPlatform.Core.Entities;

/// <summary>
/// Represents a user report against content or another user
/// </summary>
public class Report : BaseEntity
{
    public Guid ReporterUserId { get; set; }
    
    /// <summary>
    /// Type of entity being reported (e.g., "Job", "User", "Message")
    /// </summary>
    public string TargetType { get; set; } = string.Empty;
    
    public Guid TargetId { get; set; }
    
    /// <summary>
    /// Category of the report (e.g., "Spam", "Inappropriate", "Fraud")
    /// </summary>
    public string Reason { get; set; } = string.Empty;
    
    public string? Details { get; set; }
    
    /// <summary>
    /// Status of the report triage (e.g., "Open", "Investigating", "Resolved", "Dismissed")
    /// </summary>
    public string Status { get; set; } = "Open";
    
    public Guid? ResolvedByUserId { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }
}
