namespace HospitalityPlatform.Auth.Policies;

/// <summary>
/// Policy names for authorization
/// </summary>
public static class PolicyNames
{
    public const string RequireCandidate = "RequireCandidate";
    public const string RequireBusinessOwner = "RequireBusinessOwner";
    public const string RequireBusinessRole = "RequireBusinessRole";
    public const string RequireStaff = "RequireStaff";
    public const string RequireAdmin = "RequireAdmin";
    public const string RequireSupport = "RequireSupport";
    public const string RequireOrganizationAccess = "RequireOrganizationAccess";
}
