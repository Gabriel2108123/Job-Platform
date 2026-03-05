using System;
using System.Threading.Tasks;
using Xunit;
using Moq;
using HospitalityPlatform.Documents.Services;
using HospitalityPlatform.Documents.DTOs;
using HospitalityPlatform.Documents.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using HospitalityPlatform.Documents.Enums;

namespace HospitalityPlatform.Documents.Tests
{
    public class DocumentTypeAllowlistTests
    {
        private readonly Mock<IDocumentsDbContext> _mockContext;
        private readonly Mock<Amazon.S3.IAmazonS3> _mockS3;
        private readonly Mock<IDocumentValidationService> _mockValidationService;
        private readonly Mock<ILogger<DocumentsService>> _mockLogger;
        private readonly DocumentsService _service;

        public DocumentTypeAllowlistTests()
        {
            _mockContext = new Mock<IDocumentsDbContext>();
            _mockS3 = new Mock<Amazon.S3.IAmazonS3>();
            _mockValidationService = new Mock<IDocumentValidationService>();
            _mockLogger = new Mock<ILogger<DocumentsService>>();
            _service = new DocumentsService(_mockContext.Object, _mockS3.Object, _mockValidationService.Object, _mockLogger.Object);
            
            var documents = new List<Document>();
            _mockContext.Setup(c => c.Documents).Returns(documents.AsQueryable().BuildMockDbSet());
        }

        [Fact]
        public async Task CreateUploadAsync_ShouldAllow_ValidDocumentTypes()
        {
            // Arrange
            var dto = new CreateDocumentUploadDto { FileName = "resume.pdf", ContentType = "application/pdf", FileSizeBytes = 10000, DocumentType = DocumentType.Resume };
            _mockS3.Setup(x => x.GetPreSignedURL(It.IsAny<Amazon.S3.Model.GetPreSignedUrlRequest>())).Returns("http://url");
            _mockValidationService.Setup(v => v.ValidateDocumentUpload(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<long>(), It.IsAny<DocumentType>()))
                .Returns((true, null));
            
            // Act
            var result = await _service.CreateUploadAsync(Guid.NewGuid(), dto, Guid.NewGuid().ToString());

            // Assert
            Assert.NotNull(result);
        }

        [Fact]
        public async Task CreateUploadAsync_ShouldThrow_ValidationFailed()
        {
            // Arrange
            var dto = new CreateDocumentUploadDto { FileName = "resume.pdf", ContentType = "application/pdf", FileSizeBytes = 10000, DocumentType = DocumentType.Resume };
            _mockValidationService.Setup(v => v.ValidateDocumentUpload(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<long>(), It.IsAny<DocumentType>()))
                .Returns((false, "Blocked"));
            
            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateUploadAsync(Guid.NewGuid(), dto, "user-123"));
        }

        [Fact]
        public async Task CreateUploadAsync_ShouldSetRetention_ForResume()
        {
            // Arrange
            var dto = new CreateDocumentUploadDto { FileName = "resume.pdf", ContentType = "application/pdf", FileSizeBytes = 10000, DocumentType = DocumentType.Resume };
            _mockS3.Setup(x => x.GetPreSignedURL(It.IsAny<Amazon.S3.Model.GetPreSignedUrlRequest>())).Returns("http://url");
            _mockValidationService.Setup(v => v.ValidateDocumentUpload(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<long>(), It.IsAny<DocumentType>()))
                .Returns((true, null));
            
            // Act
            Document? addedDoc = null;
            _mockContext.Setup(c => c.Documents.Add(It.IsAny<Document>())).Callback<Document>(d => addedDoc = d);

            await _service.CreateUploadAsync(Guid.NewGuid(), dto, Guid.NewGuid().ToString());

            // Assert
            Assert.NotNull(addedDoc);
            Assert.NotNull(addedDoc.RetentionDate);
        }
    }
}
