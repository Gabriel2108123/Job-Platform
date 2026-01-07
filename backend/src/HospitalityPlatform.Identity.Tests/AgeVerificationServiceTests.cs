using HospitalityPlatform.Identity.Services;
using Xunit;

namespace HospitalityPlatform.Identity.Tests;

public class AgeVerificationServiceTests
{
    private readonly IAgeVerificationService _service = new AgeVerificationService();

    [Fact]
    public void CalculateAge_WithBirthdayToday_ReturnsCorrectAge()
    {
        // Arrange
        var today = DateTime.UtcNow;
        var sixteenYearsAgo = today.AddYears(-16);
        
        // Act
        var age = _service.CalculateAge(sixteenYearsAgo);
        
        // Assert
        Assert.Equal(16, age);
    }

    [Fact]
    public void CalculateAge_WithBirthdayNextMonth_ReturnsPreviousAge()
    {
        // Arrange
        var today = DateTime.UtcNow;
        var sixteenYearsAgo = today.AddYears(-16).AddMonths(1);
        
        // Act
        var age = _service.CalculateAge(sixteenYearsAgo);
        
        // Assert
        Assert.Equal(15, age);
    }

    [Fact]
    public void CalculateAge_WithBirthdayLastMonth_ReturnsCurrentAge()
    {
        // Arrange
        var today = DateTime.UtcNow;
        var sixteenYearsAgo = today.AddYears(-16).AddMonths(-1);
        
        // Act
        var age = _service.CalculateAge(sixteenYearsAgo);
        
        // Assert
        Assert.Equal(16, age);
    }

    [Fact]
    public void IsAtLeast16YearsOld_With16YearOld_ReturnsTrue()
    {
        // Arrange
        var today = DateTime.UtcNow;
        var sixteenYearsAgo = today.AddYears(-16);
        
        // Act
        var isAtLeast16 = _service.IsAtLeast16YearsOld(sixteenYearsAgo);
        
        // Assert
        Assert.True(isAtLeast16);
    }

    [Fact]
    public void IsAtLeast16YearsOld_With15YearOld_ReturnsFalse()
    {
        // Arrange
        var today = DateTime.UtcNow;
        var fifteenYearsAgo = today.AddYears(-15);
        
        // Act
        var isAtLeast16 = _service.IsAtLeast16YearsOld(fifteenYearsAgo);
        
        // Assert
        Assert.False(isAtLeast16);
    }

    [Fact]
    public void IsAtLeast16YearsOld_With30YearOld_ReturnsTrue()
    {
        // Arrange
        var today = DateTime.UtcNow;
        var thirtyYearsAgo = today.AddYears(-30);
        
        // Act
        var isAtLeast16 = _service.IsAtLeast16YearsOld(thirtyYearsAgo);
        
        // Assert
        Assert.True(isAtLeast16);
    }

    [Fact]
    public void IsAtLeast16YearsOld_WithJustUnder16_ReturnsFalse()
    {
        // Arrange
        var today = DateTime.UtcNow;
        var almostSixteen = today.AddYears(-16).AddDays(1);
        
        // Act
        var isAtLeast16 = _service.IsAtLeast16YearsOld(almostSixteen);
        
        // Assert
        Assert.False(isAtLeast16);
    }
}
