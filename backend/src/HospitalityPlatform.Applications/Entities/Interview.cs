using System;
using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Applications.Enums;

namespace HospitalityPlatform.Applications.Entities;

public class Interview : BaseEntity
{
    public Guid ApplicationId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Type { get; set; } = "In-Person"; // e.g., In-Person, Video, Phone
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public string? Feedback { get; set; }
    public bool IsCompleted { get; set; }
}
