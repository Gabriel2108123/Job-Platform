using HospitalityPlatform.Documents.Entities;
using HospitalityPlatform.Documents.Enums;
using HospitalityPlatform.Documents.Services;
using Microsoft.Extensions.Logging;
using Xunit;

namespace HospitalityPlatform.Documents.Tests;

/// <summary>
/// Unit tests for DocumentShareService and related authorization logic.
/// </summary>
public class DocumentShareServiceTests
{
    #region DocumentShareGrant.IsActive Property Tests

    [Fact]
    public void DocumentShareGrant_IsActive_WithoutExpiryAndNotRevoked_ReturnsTrue()
    {
        // Arrange
        var grant = new DocumentShareGrant
        {
            Id = Guid.NewGuid(),
            DocumentId = Guid.NewGuid(),
            CandidateUserId = "candidate123",
            BusinessUserId = "business123",
            OrganizationId = Guid.NewGuid(),
            GrantedAt = DateTime.UtcNow.AddDays(-1),
            ExpiresAt = null,
            RevokedAt = null
        };

        // Act
        var isActive = grant.IsActive;

        // Assert
        Assert.True(isActive, "Grant should be active when not expired and not revoked");
    }

    [Fact]
    public void DocumentShareGrant_IsActive_WithFutureExpiry_ReturnsTrue()
    {
        // Arrange
        var grant = new DocumentShareGrant
        {
            Id = Guid.NewGuid(),
            DocumentId = Guid.NewGuid(),
            CandidateUserId = "candidate123",
            BusinessUserId = "business123",
            OrganizationId = Guid.NewGuid(),
            GrantedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            RevokedAt = null
        };

        // Act
        var isActive = grant.IsActive;

        // Assert
        Assert.True(isActive, "Grant should be active with future expiry date");
    }

    [Fact]
    public void DocumentShareGrant_IsActive_WithPastExpiry_ReturnsFalse()
    {
        // Arrange
        var grant = new DocumentShareGrant
        {
            Id = Guid.NewGuid(),
            DocumentId = Guid.NewGuid(),
            CandidateUserId = "candidate123",
            BusinessUserId = "business123",
            OrganizationId = Guid.NewGuid(),
            GrantedAt = DateTime.UtcNow.AddDays(-10),
            ExpiresAt = DateTime.UtcNow.AddSeconds(-1),
            RevokedAt = null
        };

        // Act
        var isActive = grant.IsActive;

        // Assert
        Assert.False(isActive, "Grant should be inactive with past expiry date");
    }

    [Fact]
    public void DocumentShareGrant_IsActive_WhenRevoked_ReturnsFalse()
    {
        // Arrange
        var grant = new DocumentShareGrant
        {
            Id = Guid.NewGuid(),
            DocumentId = Guid.NewGuid(),
            CandidateUserId = "candidate123",
            BusinessUserId = "business123",
            OrganizationId = Guid.NewGuid(),
            GrantedAt = DateTime.UtcNow.AddDays(-1),
            ExpiresAt = DateTime.UtcNow.AddDays(10),
            RevokedAt = DateTime.UtcNow,
            RevokedByUserId = "candidate123"
        };

        // Act
        var isActive = grant.IsActive;

        // Assert
        Assert.False(isActive, "Grant should be inactive when revoked");
    }

    #endregion

    #region DocumentRequest.IsExpired Property Tests

    [Fact]
    public void DocumentRequest_IsExpired_WithoutExpiryDate_ReturnsFalse()
    {
        // Arrange
        var request = new DocumentRequest
        {
            Id = Guid.NewGuid(),
            CandidateUserId = "candidate123",
            RequestedByUserId = "business123",
            OrganizationId = Guid.NewGuid(),
            DocumentType = DocumentType.Resume,
            Status = DocumentRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = null
        };

        // Act
        var isExpired = request.IsExpired;

        // Assert
        Assert.False(isExpired, "Request without expiry date should not be considered expired");
    }

    [Fact]
    public void DocumentRequest_IsExpired_WithFutureExpiryDate_ReturnsFalse()
    {
        // Arrange
        var request = new DocumentRequest
        {
            Id = Guid.NewGuid(),
            CandidateUserId = "candidate123",
            RequestedByUserId = "business123",
            OrganizationId = Guid.NewGuid(),
            DocumentType = DocumentType.Resume,
            Status = DocumentRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        // Act
        var isExpired = request.IsExpired;

        // Assert
        Assert.False(isExpired, "Request with future expiry date should not be expired");
    }

    [Fact]
    public void DocumentRequest_IsExpired_WithPastExpiryDate_ReturnsTrue()
    {
        // Arrange
        var request = new DocumentRequest
        {
            Id = Guid.NewGuid(),
            CandidateUserId = "candidate123",
            RequestedByUserId = "business123",
            OrganizationId = Guid.NewGuid(),
            DocumentType = DocumentType.Resume,
            Status = DocumentRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            ExpiresAt = DateTime.UtcNow.AddSeconds(-1)
        };

        // Act
        var isExpired = request.IsExpired;

        // Assert
        Assert.True(isExpired, "Request with past expiry date should be expired");
    }

    #endregion

    #region BlockedDocumentTypes Tests

    [Theory]
    [InlineData("passport.pdf")]
    [InlineData("visa_letter.pdf")]
    [InlineData("right-to-work.pdf")]
    [InlineData("rtw_letter.pdf")]
    [InlineData("brp_card.jpg")]
    public void BlockedDocumentTypes_IsBlocked_WithBlockedDocumentName_ReturnsTrue(string documentName)
    {
        // Act
        var isBlocked = HospitalityPlatform.Documents.Enums.BlockedDocumentTypes.IsBlocked(documentName);

        // Assert
        Assert.True(isBlocked, $"Document '{documentName}' should be blocked");
    }

    [Theory]
    [InlineData("Resume.pdf")]
    [InlineData("CV.docx")]
    [InlineData("Certificate.pdf")]
    [InlineData("Training_Record.xlsx")]
    [InlineData("Diploma.jpg")]
    public void BlockedDocumentTypes_IsBlocked_WithAllowedDocumentName_ReturnsFalse(string documentName)
    {
        // Act
        var isBlocked = HospitalityPlatform.Documents.Enums.BlockedDocumentTypes.IsBlocked(documentName);

        // Assert
        Assert.False(isBlocked, $"Document '{documentName}' should be allowed");
    }

    [Theory]
    [InlineData("PASSPORT.PDF")]
    [InlineData("Passport_Scan.pdf")]
    [InlineData("My Passport.docx")]
    [InlineData("VISA_DOCUMENT.PDF")]
    [InlineData("Visa Letter.pdf")]
    public void BlockedDocumentTypes_IsBlocked_CaseInsensitive_ReturnsTrue(string documentName)
    {
        // Act
        var isBlocked = HospitalityPlatform.Documents.Enums.BlockedDocumentTypes.IsBlocked(documentName);

        // Assert
        Assert.True(isBlocked, $"Document '{documentName}' should be blocked (case-insensitive)");
    }

    #endregion

    #region DocumentType Tests

    [Fact]
    public void DocumentType_HasCorrectValues()
    {
        // Assert
        Assert.Equal(1, (int)DocumentType.Resume);
        Assert.Equal(2, (int)DocumentType.Certification);
        Assert.Equal(99, (int)DocumentType.Other);
    }

    [Fact]
    public void DocumentRequestStatus_HasCorrectValues()
    {
        // Assert
        Assert.Equal(1, (int)DocumentRequestStatus.Pending);
        Assert.Equal(2, (int)DocumentRequestStatus.Approved);
        Assert.Equal(3, (int)DocumentRequestStatus.Rejected);
        Assert.Equal(4, (int)DocumentRequestStatus.Cancelled);
    }

    #endregion
}
