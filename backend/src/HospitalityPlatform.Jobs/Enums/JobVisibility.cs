namespace HospitalityPlatform.Jobs.Enums;

public enum JobVisibility
{
    /// <summary>
    /// Visible to everyone.
    /// </summary>
    Public = 0,

    /// <summary>
    /// Visible in search, but Organization details are hidden (Anonymous).
    /// </summary>
    Private = 1,

    /// <summary>
    /// Hidden from search. Only accessible via direct invite/link.
    /// </summary>
    InviteOnly = 2
}
