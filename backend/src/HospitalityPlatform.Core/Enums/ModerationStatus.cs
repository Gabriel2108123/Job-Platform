namespace HospitalityPlatform.Core.Enums;

/// <summary>
/// Status of an entity in the moderation queue
/// </summary>
public enum ModerationStatus
{
    Approved = 0,
    Pending = 1,
    Flagged = 2,
    Blocked = 3
}
