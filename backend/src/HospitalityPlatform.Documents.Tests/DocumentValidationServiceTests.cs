using HospitalityPlatform.Documents.Services;
using Microsoft.Extensions.Logging;
using Xunit;

namespace HospitalityPlatform.Documents.Tests;

/// <summary>
/// Unit tests for DocumentValidationService.
/// Covers document type blocking, file validation, MIME type checking, and file size validation.
/// </summary>
public class DocumentValidationServiceTests
{
    private readonly DocumentValidationService _service;
    private readonly ILogger<DocumentValidationService> _logger;

    public DocumentValidationServiceTests()
    {
        // Create a mock logger
        _logger = new MockLogger<DocumentValidationService>();
        _service = new DocumentValidationService(_logger);
    }

    #region Document Type Blocking Tests

    [Theory]
    [InlineData("passport.pdf")]
    [InlineData("Passport_Scan.pdf")]
    [InlineData("My Passport.docx")]
    [InlineData("visa_application.pdf")]
    [InlineData("Visa Document.pdf")]
    [InlineData("right-to-work.pdf")]
    [InlineData("Right to Work Document.pdf")]
    [InlineData("rtw_letter.pdf")]
    [InlineData("brp_card.jpg")]
    [InlineData("biometric_visa.pdf")]
    public void ValidateDocumentUpload_BlockedDocumentType_ReturnsFalse(string fileName)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            fileName,
            "application/pdf",
            10000,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        Assert.False(isValid, $"Document '{fileName}' should be blocked but was allowed");
        Assert.NotNull(errorMessage);
    }

    [Theory]
    [InlineData("Resume.pdf")]
    [InlineData("CV.docx")]
    [InlineData("Certificate.pdf")]
    [InlineData("Diploma.jpg")]
    [InlineData("other_document.xlsx")]
    [InlineData("training_record.txt")]
    public void ValidateDocumentUpload_AllowedDocumentType_ReturnsTrue(string fileName)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            fileName,
            "application/pdf",
            10000,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        Assert.True(isValid, $"Document '{fileName}' should be allowed but was blocked: {errorMessage}");
        Assert.Null(errorMessage);
    }

    #endregion

    #region File Extension Validation Tests

    [Theory]
    [InlineData("document.pdf", "application/pdf", true)]
    [InlineData("document.doc", "application/msword", true)]
    [InlineData("document.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", true)]
    [InlineData("document.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", true)]
    [InlineData("photo.jpg", "image/jpeg", true)]
    [InlineData("photo.jpeg", "image/jpeg", true)]
    [InlineData("photo.png", "image/png", true)]
    [InlineData("data.txt", "text/plain", true)]
    [InlineData("document.exe", "application/octet-stream", false)]
    [InlineData("document.bat", "application/octet-stream", false)]
    [InlineData("document.zip", "application/zip", false)]
    [InlineData("document.dll", "application/octet-stream", false)]
    public void ValidateDocumentUpload_FileExtension_ValidatesCorrectly(string fileName, string mimeType, bool shouldBeValid)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            fileName,
            mimeType,
            10000,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        if (shouldBeValid)
        {
            Assert.True(isValid, $"File '{fileName}' with MIME '{mimeType}' should be valid");
            Assert.Null(errorMessage);
        }
        else
        {
            Assert.False(isValid, $"File '{fileName}' with MIME '{mimeType}' should be invalid");
            Assert.NotNull(errorMessage);
        }
    }

    #endregion

    #region MIME Type Validation Tests

    [Theory]
    [InlineData("document.txt", "text/plain", true)]
    [InlineData("image.jpg", "image/jpeg", true)]
    [InlineData("image.png", "image/png", true)]
    [InlineData("document.pdf", "application/octet-stream", false)]
    public void ValidateDocumentUpload_MimeType_ValidatesCorrectly(string fileName, string mimeType, bool shouldBeValid)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            fileName,
            mimeType,
            10000,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        if (shouldBeValid)
        {
            Assert.True(isValid, $"MIME type '{mimeType}' for '{fileName}' should be valid");
            Assert.Null(errorMessage);
        }
        else
        {
            Assert.False(isValid, $"MIME type '{mimeType}' for '{fileName}' should be invalid");
            Assert.NotNull(errorMessage);
        }
    }

    #endregion

    #region File Size Validation Tests

    [Theory]
    [InlineData(512)]           // Below minimum (1 KB)
    [InlineData(1023)]          // Just under minimum
    public void ValidateDocumentUpload_FileTooSmall_ReturnsFalse(long fileSizeBytes)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            "document.pdf",
            "application/pdf",
            fileSizeBytes,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        Assert.False(isValid, "File should be rejected for being too small");
        Assert.NotNull(errorMessage);
        Assert.Contains("small", errorMessage, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(1024)]                  // Exactly 1 KB (minimum)
    [InlineData(5242880)]               // 5 MB
    [InlineData(10485760)]              // 10 MB (maximum)
    public void ValidateDocumentUpload_FileSizeValid_ReturnsTrue(long fileSizeBytes)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            "document.pdf",
            "application/pdf",
            fileSizeBytes,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        Assert.True(isValid, $"File size {fileSizeBytes} bytes should be valid");
        Assert.Null(errorMessage);
    }

    [Theory]
    [InlineData(10485761)]              // Just over maximum
    [InlineData(20971520)]              // 20 MB (over maximum)
    [InlineData(104857600)]             // 100 MB (way over maximum)
    public void ValidateDocumentUpload_FileTooLarge_ReturnsFalse(long fileSizeBytes)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            "document.pdf",
            "application/pdf",
            fileSizeBytes,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        Assert.False(isValid, "File should be rejected for being too large");
        Assert.NotNull(errorMessage);
        Assert.Contains("large", errorMessage, StringComparison.OrdinalIgnoreCase);
    }

    #endregion

    #region Edge Cases

    [Theory]
    [InlineData("")]                    // Empty filename
    public void ValidateDocumentUpload_InvalidFilename_ReturnsFalse(string fileName)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            fileName!,
            "application/pdf",
            10000,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        Assert.False(isValid);
        Assert.NotNull(errorMessage);
    }

    [Theory]
    [InlineData("PASSPORT.PDF", "application/pdf")]  // Uppercase variant
    [InlineData("PaSsPoRt.Pdf", "application/pdf")]  // Mixed case variant
    public void ValidateDocumentUpload_BlockedDocumentType_CaseInsensitive(string fileName, string mimeType)
    {
        // Act
        var (isValid, errorMessage) = _service.ValidateDocumentUpload(
            fileName,
            mimeType,
            10000,
            HospitalityPlatform.Documents.Enums.DocumentType.Resume);

        // Assert
        Assert.False(isValid, "Blocked document types should be case-insensitive");
        Assert.NotNull(errorMessage);
    }

    #endregion
}

/// <summary>
/// Mock logger for testing purposes.
/// </summary>
public class MockLogger<T> : ILogger<T>
{
    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

    public bool IsEnabled(LogLevel logLevel) => true;

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        // Silent logging for tests
    }
}
