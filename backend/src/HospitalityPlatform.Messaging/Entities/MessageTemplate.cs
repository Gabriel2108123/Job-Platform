using System;
using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Messaging.Entities;

public class MessageTemplate : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? CreatorUserId { get; set; }
}
