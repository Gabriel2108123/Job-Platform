namespace HospitalityPlatform.Identity.Services;

/// <summary>
/// Interface for age verification service
/// </summary>
public interface IAgeVerificationService
{
    /// <summary>
    /// Validates if user is at least 16 years old
    /// </summary>
    /// <param name="dateOfBirth">User's date of birth</param>
    /// <returns>True if user is 16 or older</returns>
    bool IsAtLeast16YearsOld(DateTime dateOfBirth);

    /// <summary>
    /// Calculates age from date of birth
    /// </summary>
    /// <param name="dateOfBirth">User's date of birth</param>
    /// <returns>Age in years</returns>
    int CalculateAge(DateTime dateOfBirth);
}
