using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using HospitalityPlatform.Messaging.Services;
using HospitalityPlatform.Messaging.Entities;
using HospitalityPlatform.Messaging.DTOs;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Applications.Services;

using System.Linq.Expressions;

namespace HospitalityPlatform.Messaging.Tests
{
    public class RateLimitTests
    {
        private readonly Mock<IMessagingDbContext> _mockContext;
        private readonly Mock<IApplicationsReadService> _mockAppService;
        private readonly Mock<ILogger<MessagingService>> _mockLogger;
        private readonly MessagingService _service;

        public RateLimitTests()
        {
            _mockContext = new Mock<IMessagingDbContext>();
            _mockAppService = new Mock<IApplicationsReadService>();
            _mockLogger = new Mock<ILogger<MessagingService>>();
            _service = new MessagingService(_mockContext.Object, _mockAppService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task SendMessageAsync_ShouldThrow_WhenRateLimitExceeded()
        {
            // Arrange
            var orgId = Guid.NewGuid();
            var convId = Guid.NewGuid();
            var userId = Guid.NewGuid().ToString();

            var conversation = new Conversation { Id = convId, OrganizationId = orgId, IsActive = true, Subject = "Test", CreatedByUserId = userId };
            var participants = new List<ConversationParticipant>
            {
                new ConversationParticipant { ConversationId = convId, UserId = userId }
            }.AsQueryable();

            // Simulate 30 messages in the last hour
            var messages = new List<Message>();
            for (int i = 0; i < 30; i++)
            {
                messages.Add(new Message 
                { 
                    ConversationId = convId, 
                    SentByUserId = userId, 
                    Content = "Test",
                    SentAt = DateTime.UtcNow.AddMinutes(-i),
                    IsDeleted = false
                });
            }

            _mockContext.Setup(c => c.Conversations).Returns(new List<Conversation> { conversation }.AsQueryable().BuildMockDbSet());
            _mockContext.Setup(c => c.ConversationParticipants).Returns(participants.BuildMockDbSet());
            _mockContext.Setup(c => c.Messages).Returns(messages.AsQueryable().BuildMockDbSet());
            _mockContext.Setup(c => c.UserBlocks).Returns(new List<UserBlock>().AsQueryable().BuildMockDbSet());

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _service.SendMessageAsync(orgId, convId, new SendMessageDto { Content = "Hello" }, userId));
            
            Assert.Contains("Rate limit exceeded", ex.Message);
        }
    }
}
