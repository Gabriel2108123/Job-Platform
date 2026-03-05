using Moq;
using Xunit;
using HospitalityPlatform.Messaging.DTOs;
using HospitalityPlatform.Messaging.Entities;
using HospitalityPlatform.Messaging.Services;
using HospitalityPlatform.Applications.Services;
using HospitalityPlatform.Audit.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;

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
        var userBlocksList = new List<UserBlock>();
        var participantsList = new List<ConversationParticipant> { new ConversationParticipant { ConversationId = conversationId, UserId = userId } };

        var mockMessages = messagesList.AsQueryable().BuildMockDbSet();
        var mockConversations = new List<Conversation> { conversation }.AsQueryable().BuildMockDbSet();
        var mockUserBlocks = userBlocksList.AsQueryable().BuildMockDbSet();
        var mockParticipants = participantsList.AsQueryable().BuildMockDbSet();

        _mockDbContext.Setup(x => x.Conversations).Returns(mockConversations);
        _mockDbContext.Setup(x => x.Messages).Returns(mockMessages);
        _mockDbContext.Setup(x => x.UserBlocks).Returns(mockUserBlocks);
        _mockDbContext.Setup(x => x.ConversationParticipants).Returns(mockParticipants);
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
        return new ValueTask<bool>(_inner.MoveNext());
    }
}
