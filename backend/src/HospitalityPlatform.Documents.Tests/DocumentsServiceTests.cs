using Moq;
using Xunit;
using HospitalityPlatform.Documents.DTOs;
using HospitalityPlatform.Documents.Entities;
using HospitalityPlatform.Documents.Services;
using HospitalityPlatform.Audit.Entities;
using Amazon.S3;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Documents.Enums;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore.Query;
using System.Threading.Tasks;

namespace HospitalityPlatform.Documents.Tests;

public class DocumentsServiceTests
{
    private readonly Mock<IDocumentsDbContext> _mockDbContext;
    private readonly Mock<IAmazonS3> _mockS3Client;
    private readonly Mock<IDocumentValidationService> _mockValidationService;
    private readonly ILogger<DocumentsService> _logger;
    private readonly DocumentsService _documentsService;

    public DocumentsServiceTests()
    {
        _mockDbContext = new Mock<IDocumentsDbContext>();
        _mockS3Client = new Mock<IAmazonS3>();
        _mockValidationService = new Mock<IDocumentValidationService>();
        _logger = new Logger<DocumentsService>(new LoggerFactory());
        _documentsService = new DocumentsService(_mockDbContext.Object, _mockS3Client.Object, _mockValidationService.Object, _logger);
    }

    [Fact]
    public async Task CreateUploadAsync_ValidInput_ReturnsPresignedUrl()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = Guid.NewGuid().ToString();
        var dto = new CreateDocumentUploadDto
        {
            FileName = "test.pdf",
            ContentType = "application/pdf",
            FileSizeBytes = 1024,
            DocumentType = DocumentType.Resume
        };

        var documents = new List<Document>();
        var mockDocuments = documents.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Documents).Returns(mockDocuments);
        _mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _mockDbContext.Setup(x => x.SaveAuditLogAsync(It.IsAny<AuditLog>())).Returns(Task.CompletedTask);

        _mockValidationService.Setup(x => x.ValidateDocumentUpload(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<long>(), It.IsAny<DocumentType>()))
            .Returns((true, null));

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
        var userId = Guid.NewGuid().ToString();
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
        var userId = Guid.NewGuid().ToString();
        var documentId = Guid.NewGuid();

        var document = new Document
        {
            Id = documentId,
            OrganizationId = organizationId,
            FileName = "test.pdf",
            S3Key = "key",
            ContentType = "application/pdf",
            UploadedByUserId = userId,
            DocumentType = DocumentType.Resume,
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
        var userId = Guid.NewGuid().ToString();
        var otherUserId = Guid.NewGuid().ToString();
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
            DocumentType = DocumentType.Other,
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
        var userId = Guid.NewGuid().ToString();
        var otherUserId = Guid.NewGuid().ToString();
        var documentId = Guid.NewGuid();

        var document = new Document
        {
            Id = documentId,
            OrganizationId = organizationId,
            FileName = "test.pdf",
            S3Key = "key",
            ContentType = "application/pdf",
            UploadedByUserId = otherUserId,
            DocumentType = DocumentType.Resume,
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

public static class MockDbSetExtensions
{
    public static DbSet<T> BuildMockDbSet<T>(this IQueryable<T> source) where T : class
    {
        var mockSet = new Mock<DbSet<T>>();

        mockSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new TestAsyncEnumerator<T>(source.GetEnumerator()));

        mockSet.As<IQueryable<T>>()
            .Setup(m => m.Provider)
            .Returns(new TestAsyncQueryProvider<T>(source.Provider));

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

internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    internal TestAsyncQueryProvider(IQueryProvider inner)
    {
        _inner = inner;
    }

    public IQueryable CreateQuery(Expression expression)
    {
        return new TestAsyncEnumerable<TEntity>(expression);
    }

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
    {
        return new TestAsyncEnumerable<TElement>(expression);
    }

    public object Execute(Expression expression)
    {
        return _inner.Execute(expression);
    }

    public TResult Execute<TResult>(Expression expression)
    {
        return _inner.Execute<TResult>(expression);
    }

    public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
    {
        var expectedResultType = typeof(TResult).GetGenericArguments()[0];
        var executeMethod = typeof(IQueryProvider)
            .GetMethods()
            .First(method => method.Name == nameof(IQueryProvider.Execute) && method.IsGenericMethod)
            .MakeGenericMethod(expectedResultType);

        var executionResult = executeMethod.Invoke(_inner, new object[] { expression });

        var fromResultMethod = typeof(Task).GetMethods()
            .First(m => m.Name == nameof(Task.FromResult) && m.IsGenericMethod)
            .MakeGenericMethod(expectedResultType);

        return (TResult)fromResultMethod.Invoke(null, new object[] { executionResult })!;
    }
}

internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public TestAsyncEnumerable(IEnumerable<T> enumerable)
        : base(enumerable)
    { }

    public TestAsyncEnumerable(Expression expression)
        : base(expression)
    { }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
    {
        return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
    }

    IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
}

internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _inner;

    public TestAsyncEnumerator(IEnumerator<T> inner)
    {
        _inner = inner;
    }

    public T Current => _inner.Current;

    public ValueTask DisposeAsync()
    {
        _inner.Dispose();
        return ValueTask.CompletedTask;
    }

    public ValueTask<bool> MoveNextAsync()
    {
        return PassThrough(new ValueTask<bool>(_inner.MoveNext()));
    }

    private ValueTask<bool> PassThrough(ValueTask<bool> result) => result; // Helper for readability
}
