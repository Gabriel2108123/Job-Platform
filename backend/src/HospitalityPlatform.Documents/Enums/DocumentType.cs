namespace HospitalityPlatform.Documents.Enums;

/// <summary>
/// Allowed document types in the platform.
/// Explicitly restricts to CV and Certifications ONLY.
/// Blocks: Passport, National ID, Visa, Proof of Address, Right-to-Work documents.
/// </summary>
public enum DocumentType
{
    /// <summary>Curriculum Vitae / Resume</summary>
    Resume = 1,

    /// <summary>Professional Certification (e.g., GCSE, A-Level, Degree, Trade Certifications)</summary>
    Certification = 2,

    /// <summary>Passport or Travel Document</summary>
    Passport = 3,

    /// <summary>National Identity Card or Driver's License</summary>
    IdentityDocument = 4,

    /// <summary>Visa or Right to Work Document</summary>
    Visa = 5,

    /// <summary>Other approved document</summary>
    Other = 99
}

/// <summary>
/// Explicitly blocked document types (for validation and error messaging).
/// These will NEVER be accepted by the system, regardless of file content.
/// </summary>
public static class BlockedDocumentTypes
{
    public static readonly string[] BlockedNames = new[]
    {
        "Bank Statement",
        "Utility Bill"
    };

    public static readonly string[] BlockedKeywords = new[]
    {
        "bank statement",
        "utility bill"
    };

    /// <summary>
    /// Checks if a document name/type is explicitly blocked.
    /// </summary>
    public static bool IsBlocked(string documentName)
    {
        if (string.IsNullOrWhiteSpace(documentName))
            return false;

        var lower = documentName.ToLowerInvariant();
        return BlockedKeywords.Any(keyword => lower.Contains(keyword));
    }
}
