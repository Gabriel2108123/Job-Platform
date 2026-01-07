namespace HospitalityPlatform.Identity.Services;

/// <summary>
/// Implementation of age verification service
/// </summary>
public class AgeVerificationService : IAgeVerificationService
{
    /// <summary>
    /// Validates if user is at least 16 years old
    /// </summary>
    /// <param name="dateOfBirth">User's date of birth</param>
    /// <returns>True if user is 16 or older</returns>
    public bool IsAtLeast16YearsOld(DateTime dateOfBirth)
    {
        var age = CalculateAge(dateOfBirth);
        return age >= 16;
    }

    /// <summary>
    /// Calculates age from date of birth
    /// </summary>
    /// <param name="dateOfBirth">User's date of birth</param>
    /// <returns>Age in years</returns>
    public int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.UtcNow;
        var age = today.Year - dateOfBirth.Year;

        // Adjust if birthday hasn't occurred yet this year
        if (dateOfBirth.Date > today.AddYears(-age))
        {
            age--;
        }

        return age;
    }
}
