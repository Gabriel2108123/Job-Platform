using Moq;
using Xunit;
using HospitalityPlatform.Documents.DTOs;
using HospitalityPlatform.Documents.Entities;
using HospitalityPlatform.Documents.Services;
using HospitalityPlatform.Audit.Entities;
using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Documents.Tests;

public class DocumentsServiceTests
{
    private readonly Mock<IDocumentsDbContext> _mockDbContext;
    private readonly Mock<IAmazonS3> _mockS3Client;
    private readonly Mock<ILogger<DocumentsService>> _mockLogger;
    private readonly DocumentsService _documentsService;

    public DocumentsServiceTests()
    {
        _mockDbContext = new Mock<IDocumentsDbContext>();
        _mockS3Client = new Mock<IAmazonS3>();
        _mockLogger = new Mock<ILogger<DocumentsService>>();
        _documentsService = new DocumentsService(_mockDbContext.Object, _mockS3Client.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task CreateUploadAsync_ValidInput_ReturnsPresignedUrl()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = "user123";
        var dto = new CreateDocumentUploadDto
        {
            FileName = "test.pdf",
            ContentType = "application/pdf",
            FileSizeBytes = 1024
        };

        var documents = new List<Document>();
        var mockDocuments = documents.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Documents).Returns(mockDocuments);
        _mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _mockDbContext.Setup(x => x.SaveAuditLogAsync(It.IsAny<AuditLog>())).Returns(Task.CompletedTask);

        _mockS3Client.Setup(x => x.GetPreSignedURL(It.IsAny<Amazon.S3.Model.GetPreSignedUrlRequest>()))
            .Returns("https://s3.amazonaws.com/presigned-url");

        // Act
        var result = await _documentsService.CreateUploadAsync(organizationId, dto, userId);

        // Assert
        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.DocumentId);
        Assert.Equal("https://s3.amazonaws.com/presigned-url", result.PresignedUrl);
        Assert.Equal(3600, result.ExpirationSeconds);
    }

    [Fact]
    public async Task ShareDocumentAsync_DocumentNotFound_ThrowsException()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = "user123";
        var documentId = Guid.NewGuid();
        var dto = new ShareDocumentDto { ApplicationId = Guid.NewGuid() };

        var documents = new List<Document>();
        var mockDocuments = documents.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Documents).Returns(mockDocuments);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() =>
            _documentsService.ShareDocumentAsync(organizationId, documentId, dto, userId));
    }

    [Fact]
    public async Task UserHasAccessToDocumentAsync_DocumentUploader_ReturnsTrue()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = "user123";
        var documentId = Guid.NewGuid();

        var document = new Document
        {
            Id = documentId,
            OrganizationId = organizationId,
            FileName = "test.pdf",
            S3Key = "key",
            ContentType = "application/pdf",
            UploadedByUserId = userId,
            IsDeleted = false
        };

        var documents = new List<Document> { document };
        var mockDocuments = documents.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Documents).Returns(mockDocuments);

        // Act
        var result = await _documentsService.UserHasAccessToDocumentAsync(organizationId, documentId, null, userId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task UserHasAccessToDocumentAsync_NoAccess_ReturnsFalse()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = "user123";
        var otherUserId = "other_user";
        var documentId = Guid.NewGuid();
        var applicationId = Guid.NewGuid();

        var document = new Document
        {
            Id = documentId,
            OrganizationId = organizationId,
            FileName = "test.pdf",
            S3Key = "key",
            ContentType = "application/pdf",
            UploadedByUserId = otherUserId,
            IsDeleted = false
        };

        var documents = new List<Document> { document };
        var accesses = new List<DocumentAccess>();

        var mockDocuments = documents.AsQueryable().BuildMockDbSet();
        var mockAccesses = accesses.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Documents).Returns(mockDocuments);
        _mockDbContext.Setup(x => x.DocumentAccesses).Returns(mockAccesses);

        // Act
        var result = await _documentsService.UserHasAccessToDocumentAsync(organizationId, documentId, applicationId, userId);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteDocumentAsync_InvalidUploader_ThrowsException()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = "user123";
        var otherUserId = "other_user";
        var documentId = Guid.NewGuid();

        var document = new Document
        {
            Id = documentId,
            OrganizationId = organizationId,
            FileName = "test.pdf",
            S3Key = "key",
            ContentType = "application/pdf",
            UploadedByUserId = otherUserId,
            IsDeleted = false
        };

        var documents = new List<Document> { document };
        var mockDocuments = documents.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Documents).Returns(mockDocuments);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _documentsService.DeleteDocumentAsync(organizationId, documentId, userId));
    }
}

/// <summary>Extension method to build mock DbSet from IQueryable</summary>
public static class MockDbSetExtensions
{
    public static DbSet<T> BuildMockDbSet<T>(this IQueryable<T> source) where T : class
    {
        var mockSet = new Mock<DbSet<T>>();

        mockSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new AsyncEnumerator<T>(source.GetEnumerator()));

        mockSet.As<IQueryable<T>>()
            .Setup(m => m.Provider)
            .Returns(source.Provider);

        mockSet.As<IQueryable<T>>()
            .Setup(m => m.Expression)
            .Returns(source.Expression);

        mockSet.As<IQueryable<T>>()
            .Setup(m => m.ElementType)
            .Returns(source.ElementType);

        mockSet.As<IQueryable<T>>()
            .Setup(m => m.GetEnumerator())
            .Returns(source.GetEnumerator());

        return mockSet.Object;
    }
}

public class AsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _enumerator;

    public AsyncEnumerator(IEnumerator<T> enumerator)
    {
        _enumerator = enumerator;
    }

    public T Current => _enumerator.Current;

    public async ValueTask<bool> MoveNextAsync()
    {
        return _enumerator.MoveNext();
    }

    public async ValueTask DisposeAsync()
    {
        _enumerator.Dispose();
    }
}
