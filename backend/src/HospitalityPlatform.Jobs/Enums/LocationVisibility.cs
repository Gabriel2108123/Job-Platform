namespace HospitalityPlatform.Jobs.Enums;

/// <summary>
/// Defines the location privacy level for a job posting
/// </summary>
public enum LocationVisibility
{
    /// <summary>
    /// Show exact coordinates to all viewers
    /// </summary>
    PublicExact = 1,
    
    /// <summary>
    /// Show approximate coordinates (~1km radius) to public viewers
    /// Business owners can still see exact location
    /// </summary>
    PrivateApprox = 2
}
