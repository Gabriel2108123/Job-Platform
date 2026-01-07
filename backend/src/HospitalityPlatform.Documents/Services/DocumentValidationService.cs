using HospitalityPlatform.Documents.Enums;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Documents.Services;

/// <summary>
/// Validates document uploads against type restrictions, mime types, and file sizes.
/// </summary>
public interface IDocumentValidationService
{
    /// <summary>
    /// Validates a document before upload.
    /// </summary>
    /// <param name="fileName">Original filename from upload</param>
    /// <param name="mimeType">MIME type of the file</param>
    /// <param name="fileSizeBytes">File size in bytes</param>
    /// <param name="documentType">Declared document type</param>
    /// <returns>(isValid, errorMessage)</returns>
    (bool IsValid, string? ErrorMessage) ValidateDocumentUpload(
        string fileName,
        string mimeType,
        long fileSizeBytes,
        DocumentType documentType);

    /// <summary>
    /// Checks if a document type name is explicitly blocked.
    /// </summary>
    bool IsDocumentTypeBlocked(string documentName);
}

/// <summary>
/// Implementation of document validation service.
/// </summary>
public class DocumentValidationService : IDocumentValidationService
{
    private readonly ILogger<DocumentValidationService> _logger;

    // Allowed MIME types
    private static readonly string[] AllowedMimeTypes = new[]
    {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg",
        "image/png",
        "text/plain"
    };

    // Allowed file extensions
    private static readonly string[] AllowedExtensions = new[]
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".txt"
    };

    // Max file size: 10 MB
    private const long MaxFileSizeBytes = 10 * 1024 * 1024;

    // Min file size: 1 KB
    private const long MinFileSizeBytes = 1024;

    public DocumentValidationService(ILogger<DocumentValidationService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Validates a document before upload.
    /// 
    /// MULTI-LAYER ENFORCEMENT (NOT just filename matching):
    /// 1. Filename blocked keywords check (catches obvious attempts like "Passport_Scan.pdf")
    /// 2. Declared DocumentType must be Resume, Certification, or Other (never Identity types)
    /// 3. File extension whitelist (only .pdf, .doc*, .xls*, .jpg/jpeg, .png, .txt)
    /// 4. MIME type whitelist (only office docs, images, text - never archives, executables)
    /// 5. File size boundaries (1 KB min, 10 MB max)
    /// </summary>
    public (bool IsValid, string? ErrorMessage) ValidateDocumentUpload(
        string fileName,
        string mimeType,
        long fileSizeBytes,
        DocumentType documentType)
    {
        // 0. Validate declared DocumentType is allowed (critical enforcement)
        // Only Resume, Certification, Other allowed - no identity/credential types
        if (!IsAllowedDocumentType(documentType))
        {
            _logger.LogError("Document upload blocked: invalid DocumentType declared. FileName: {FileName}, DeclaredType: {Type}", fileName, documentType);
            return (false, "Document type must be Resume, Certification, or Other. Identity verification documents are not permitted.");
        }

        // 1. Check for blocked document types in filename (catches "Passport_Scan.pdf", etc.)
        if (IsDocumentTypeBlocked(fileName))
        {
            _logger.LogWarning("Document upload blocked: forbidden document type detected in filename. FileName: {FileName}", fileName);
            return (false, "Uploading identity documents (passports, visas, right-to-work documents, proof of address) is not permitted. Please upload only CVs and professional certifications.");
        }

        // 2. Validate file extension (whitelist enforcement)
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            _logger.LogWarning("Document upload blocked: invalid file extension. FileName: {FileName}, Extension: {Extension}", fileName, extension);
            return (false, $"File type not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}");
        }

        // 3. Validate MIME type (whitelist enforcement - prevents executables, archives, etc.)
        if (!AllowedMimeTypes.Contains(mimeType.ToLowerInvariant()))
        {
            _logger.LogWarning("Document upload blocked: invalid MIME type. FileName: {FileName}, MimeType: {MimeType}", fileName, mimeType);
            return (false, $"Invalid file format (MIME type: {mimeType}). Please upload PDF, Word, Excel, image, or text files.");
        }

        // 4. Validate file size (min)
        if (fileSizeBytes < MinFileSizeBytes)
        {
            _logger.LogWarning("Document upload blocked: file too small. FileName: {FileName}, Size: {Size} bytes", fileName, fileSizeBytes);
            return (false, "File is too small (minimum 1 KB).");
        }

        // 5. Validate file size (max)
        if (fileSizeBytes > MaxFileSizeBytes)
        {
            _logger.LogWarning("Document upload blocked: file too large. FileName: {FileName}, Size: {Size} bytes", fileName, fileSizeBytes);
            return (false, $"File is too large (maximum {MaxFileSizeBytes / (1024 * 1024)} MB).");
        }

        _logger.LogInformation("Document validation passed. FileName: {FileName}, Type: {DocumentType}, Size: {Size} bytes", fileName, documentType, fileSizeBytes);
        return (true, null);
    }

    /// <summary>
    /// Validates that the declared document type is in the allowed set.
    /// Only Resume, Certification, Other are permitted.
    /// Identity/credential types (if they existed) would be rejected here.
    /// </summary>
    private static bool IsAllowedDocumentType(DocumentType documentType)
    {
        // Explicitly allow only these types
        return documentType == DocumentType.Resume
            || documentType == DocumentType.Certification
            || documentType == DocumentType.Other;
    }

    /// <summary>
    /// Checks if a document type name is explicitly blocked.
    /// </summary>
    public bool IsDocumentTypeBlocked(string documentName)
    {
        return BlockedDocumentTypes.IsBlocked(documentName);
    }
}
