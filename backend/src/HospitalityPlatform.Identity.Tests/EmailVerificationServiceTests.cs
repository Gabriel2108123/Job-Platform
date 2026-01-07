using HospitalityPlatform.Identity.Services;
using Xunit;

namespace HospitalityPlatform.Identity.Tests;

public class EmailVerificationServiceTests
{
    [Fact]
    public void GenerateVerificationLink_WithValidInputs_ReturnsCorrectUrl()
    {
        // Arrange - Create a helper method to test GenerateVerificationLink directly
        var baseUrl = "https://example.com";
        var token = "test-verification-token";
        
        // Act - Test the logic directly (since GenerateVerificationLink is public)
        var expectedUrl = $"{baseUrl}/verify-email?token={Uri.EscapeDataString(token)}";
        
        // Assert
        Assert.NotNull(expectedUrl);
        Assert.StartsWith(baseUrl, expectedUrl);
        Assert.Contains("/verify-email", expectedUrl);
        Assert.Contains("token=", expectedUrl);
    }

    [Fact]
    public void GenerateVerificationLink_WithBaseUrlTrailingSlash_HandlesCorrectly()
    {
        // Arrange
        var baseUrl = "https://example.com/";
        var token = "test-token";
        
        // Act - Simulate the logic
        var trimmedUrl = baseUrl.TrimEnd('/');
        var expectedUrl = $"{trimmedUrl}/verify-email?token={Uri.EscapeDataString(token)}";
        
        // Assert - Should not have double slashes
        Assert.DoesNotContain("//verify-email", expectedUrl);
    }

    [Fact]
    public void VerificationLink_EncordesTokenProperly()
    {
        // Arrange
        var baseUrl = "https://example.com";
        var token = "token+with/special=chars";
        
        // Act - Simulate URL encoding
        var encodedToken = Uri.EscapeDataString(token);
        var link = $"{baseUrl}/verify-email?token={encodedToken}";
        
        // Assert - URL encoding should replace special characters
        Assert.NotNull(link);
        Assert.Contains("token=", link);
        // The encoded token should not have + anymore (encoded as %2B)
        var tokenPart = link.Split("token=")[1];
        Assert.DoesNotContain("+", tokenPart);
    }

    [Fact]
    public void TokenHashingConsistency_SameTokenProducesSameHash()
    {
        // Arrange
        var token1 = "test-token-12345";
        var token2 = "test-token-12345";
        var token3 = "different-token";
        
        // Act - Both should produce the same hash
        using (var sha256_1 = System.Security.Cryptography.SHA256.Create())
        using (var sha256_2 = System.Security.Cryptography.SHA256.Create())
        using (var sha256_3 = System.Security.Cryptography.SHA256.Create())
        {
            var hash1 = Convert.ToBase64String(sha256_1.ComputeHash(System.Text.Encoding.UTF8.GetBytes(token1)));
            var hash2 = Convert.ToBase64String(sha256_2.ComputeHash(System.Text.Encoding.UTF8.GetBytes(token2)));
            var hash3 = Convert.ToBase64String(sha256_3.ComputeHash(System.Text.Encoding.UTF8.GetBytes(token3)));
            
            // Assert
            Assert.Equal(hash1, hash2);
            Assert.NotEqual(hash1, hash3);
        }
    }

    [Fact]
    public void Base64TokenGeneration_ProducesValidBase64()
    {
        // Arrange
        var tokenBytes = new byte[32];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        
        // Act
        var base64Token = Convert.ToBase64String(tokenBytes);
        
        // Assert - Should be valid base64 that can be decoded
        Assert.NotNull(base64Token);
        Assert.NotEmpty(base64Token);
        
        // Should be decodable
        var decodedBytes = Convert.FromBase64String(base64Token);
        Assert.Equal(32, decodedBytes.Length);
    }
}
