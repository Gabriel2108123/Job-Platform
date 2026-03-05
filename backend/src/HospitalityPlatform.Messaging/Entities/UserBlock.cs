using System;

namespace HospitalityPlatform.Messaging.Entities;

public class UserBlock
{
    public Guid Id { get; set; }
    public string BlockerUserId { get; set; } = string.Empty;
    public string BlockedUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
