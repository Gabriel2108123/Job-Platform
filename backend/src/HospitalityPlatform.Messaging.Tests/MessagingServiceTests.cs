using Moq;
using Xunit;
using HospitalityPlatform.Messaging.DTOs;
using HospitalityPlatform.Messaging.Entities;
using HospitalityPlatform.Messaging.Services;
using HospitalityPlatform.Applications.Services;
using HospitalityPlatform.Audit.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Messaging.Tests;

public class MessagingServiceTests
{
    private readonly Mock<IMessagingDbContext> _mockDbContext;
    private readonly Mock<IApplicationsReadService> _mockApplicationsReadService;
    private readonly Mock<ILogger<MessagingService>> _mockLogger;
    private readonly MessagingService _messagingService;

    public MessagingServiceTests()
    {
        _mockDbContext = new Mock<IMessagingDbContext>();
        _mockApplicationsReadService = new Mock<IApplicationsReadService>();
        _mockLogger = new Mock<ILogger<MessagingService>>();
        _messagingService = new MessagingService(_mockDbContext.Object, _mockApplicationsReadService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task CreateConversationAsync_ValidInput_CreatesConversation()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = "user123";
        var dto = new CreateConversationDto
        {
            Subject = "Test Conversation",
            Description = "A test conversation",
            ParticipantUserIds = new List<string> { "user456", "user789" }
        };

        var conversationsList = new List<Conversation>();
        var participantsList = new List<ConversationParticipant>();

        var mockConversations = conversationsList.AsQueryable().BuildMockDbSet();
        var mockParticipants = participantsList.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Conversations).Returns(mockConversations);
        _mockDbContext.Setup(x => x.ConversationParticipants).Returns(mockParticipants);
        _mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _mockDbContext.Setup(x => x.SaveAuditLogAsync(It.IsAny<AuditLog>())).Returns(Task.CompletedTask);

        // Act
        var result = await _messagingService.CreateConversationAsync(organizationId, dto, userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(dto.Subject, result.Subject);
    }

    [Fact]
    public async Task SendMessageAsync_ValidInput_SendsMessage()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = "user123";
        var conversationId = Guid.NewGuid();
        var dto = new SendMessageDto { Content = "Test message" };

        var conversation = new Conversation 
        { 
            Id = conversationId,
            OrganizationId = organizationId,
            Subject = "Test",
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var messagesList = new List<Message>();
        var mockMessages = messagesList.AsQueryable().BuildMockDbSet();
        var mockConversations = new List<Conversation> { conversation }.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Conversations).Returns(mockConversations);
        _mockDbContext.Setup(x => x.Messages).Returns(mockMessages);
        _mockDbContext.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _mockDbContext.Setup(x => x.SaveAuditLogAsync(It.IsAny<AuditLog>())).Returns(Task.CompletedTask);

        // Act & Assert
        var result = await _messagingService.SendMessageAsync(organizationId, conversationId, dto, userId);
        Assert.NotNull(result);
        Assert.Equal(dto.Content, result.Content);
    }

    [Fact]
    public async Task GetUnreadCountAsync_NoUnreadMessages_ReturnsZero()
    {
        // Arrange
        var organizationId = Guid.NewGuid();
        var userId = "user123";

        var participants = new List<ConversationParticipant>();
        var messages = new List<Message>();
        var conversations = new List<Conversation>();

        var mockParticipants = participants.AsQueryable().BuildMockDbSet();
        var mockMessages = messages.AsQueryable().BuildMockDbSet();
        var mockConversations = conversations.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.ConversationParticipants).Returns(mockParticipants);
        _mockDbContext.Setup(x => x.Messages).Returns(mockMessages);
        _mockDbContext.Setup(x => x.Conversations).Returns(mockConversations);

        // Act
        var result = await _messagingService.GetUnreadCountAsync(organizationId, userId);

        // Assert
        Assert.Equal(0, result);
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
