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
    public class BlockedMessagingTests
    {
        private readonly Mock<IMessagingDbContext> _mockContext;
        private readonly Mock<IApplicationsReadService> _mockAppService;
        private readonly Mock<ILogger<MessagingService>> _mockLogger;
        private readonly MessagingService _service;

        public BlockedMessagingTests()
        {
            _mockContext = new Mock<IMessagingDbContext>();
            _mockAppService = new Mock<IApplicationsReadService>();
            _mockLogger = new Mock<ILogger<MessagingService>>();
            _service = new MessagingService(_mockContext.Object, _mockAppService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task SendMessageAsync_ShouldThrow_WhenRecipientBlockedSender()
        {
            // Arrange
            var orgId = Guid.NewGuid();
            var convId = Guid.NewGuid();
            var senderId = Guid.NewGuid().ToString();
            var recipientId = Guid.NewGuid().ToString();

            var conversation = new Conversation { Id = convId, OrganizationId = orgId, IsActive = true, Subject = "Test", CreatedByUserId = senderId };
            var participants = new List<ConversationParticipant>
            {
                new ConversationParticipant { ConversationId = convId, UserId = senderId },
                new ConversationParticipant { ConversationId = convId, UserId = recipientId }
            }.AsQueryable();

            var blocks = new List<UserBlock>
            {
                new UserBlock { BlockerUserId = recipientId, BlockedUserId = senderId }
            }.AsQueryable();

            _mockContext.Setup(c => c.Conversations).Returns(new List<Conversation> { conversation }.AsQueryable().BuildMockDbSet());
            _mockContext.Setup(c => c.ConversationParticipants).Returns(participants.BuildMockDbSet());
            _mockContext.Setup(c => c.UserBlocks).Returns(blocks.BuildMockDbSet());

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _service.SendMessageAsync(orgId, convId, new SendMessageDto { Content = "Hello" }, senderId));
        }

        [Fact]
        public async Task SendMessageAsync_ShouldThrow_WhenSenderBlockedRecipient()
        {
            // Arrange
            var orgId = Guid.NewGuid();
            var convId = Guid.NewGuid();
            var senderId = Guid.NewGuid().ToString();
            var recipientId = Guid.NewGuid().ToString();

            var conversation = new Conversation { Id = convId, OrganizationId = orgId, IsActive = true, Subject = "Test", CreatedByUserId = senderId };
            var participants = new List<ConversationParticipant>
            {
                new ConversationParticipant { ConversationId = convId, UserId = senderId },
                new ConversationParticipant { ConversationId = convId, UserId = recipientId }
            }.AsQueryable();

            var blocks = new List<UserBlock>
            {
                new UserBlock { BlockerUserId = senderId, BlockedUserId = recipientId }
            }.AsQueryable();

            _mockContext.Setup(c => c.Conversations).Returns(new List<Conversation> { conversation }.AsQueryable().BuildMockDbSet());
            _mockContext.Setup(c => c.ConversationParticipants).Returns(participants.BuildMockDbSet());
            _mockContext.Setup(c => c.UserBlocks).Returns(blocks.BuildMockDbSet());

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
                _service.SendMessageAsync(orgId, convId, new SendMessageDto { Content = "Hello" }, senderId));
        }
    }
}
