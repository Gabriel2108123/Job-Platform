using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Messaging.Services;
using HospitalityPlatform.Messaging.DTOs;

namespace HospitalityPlatform.Messaging.Hubs;

/// <summary>
/// SignalR hub for real-time messaging.
/// Handles connection/disconnection and message broadcasting with organization isolation.
/// </summary>
public class MessagingHub : Hub
{
    private readonly IMessagingService _messagingService;
    private readonly ILogger<MessagingHub> _logger;

    public MessagingHub(IMessagingService messagingService, ILogger<MessagingHub> logger)
    {
        _messagingService = messagingService;
        _logger = logger;
    }

    /// <summary>Join a conversation room for real-time updates.</summary>
    public async Task JoinConversation(Guid organizationId, Guid conversationId, string userId)
    {
        var groupName = GetConversationGroupName(organizationId, conversationId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        // Mark user as read
        await _messagingService.MarkAsReadAsync(organizationId, conversationId, userId);

        // Notify others in conversation
        await Clients.Group(groupName).SendAsync("UserJoined", new { UserId = userId, Timestamp = DateTime.UtcNow });

        _logger.LogInformation("User {UserId} joined conversation {ConversationId}", userId, conversationId);
    }

    /// <summary>Leave a conversation room.</summary>
    public async Task LeaveConversation(Guid organizationId, Guid conversationId, string userId)
    {
        var groupName = GetConversationGroupName(organizationId, conversationId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        await Clients.Group(groupName).SendAsync("UserLeft", new { UserId = userId, Timestamp = DateTime.UtcNow });

        _logger.LogInformation("User {UserId} left conversation {ConversationId}", userId, conversationId);
    }

    /// <summary>Send a message in real-time to all users in the conversation.</summary>
    public async Task SendMessage(Guid organizationId, Guid conversationId, string messageContent, string userId)
    {
        try
        {
            var groupName = GetConversationGroupName(organizationId, conversationId);

            // Create SendMessageDto and call service
            // The service handles all eligibility and rate limit checks
            var messageDto = await _messagingService.SendMessageAsync(
                organizationId, conversationId, new() { Content = messageContent }, userId);

            // Broadcast to conversation group
            await Clients.Group(groupName).SendAsync("MessageReceived", new
            {
                UserId = messageDto.SentByUserId,
                Content = messageDto.Content,
                Timestamp = messageDto.SentAt
            });

            _logger.LogInformation("Message sent in conversation {ConversationId} by user {UserId}", conversationId, userId);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Rate limit or eligibility error in conversation {ConversationId}", conversationId);
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Authorization error in conversation {ConversationId}", conversationId);
            await Clients.Caller.SendAsync("Error", "Unauthorized");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message in conversation {ConversationId}", conversationId);
            await Clients.Caller.SendAsync("Error", "Failed to send message");
        }
    }

    /// <summary>Broadcast that a user is typing in the conversation.</summary>
    public async Task UserTyping(Guid organizationId, Guid conversationId, string userId)
    {
        var groupName = GetConversationGroupName(organizationId, conversationId);
        await Clients.GroupExcept(groupName, Context.ConnectionId).SendAsync("UserTyping", new 
        { 
            UserId = userId, 
            Timestamp = DateTime.UtcNow 
        });
    }

    /// <summary>Broadcast that a user stopped typing.</summary>
    public async Task UserStoppedTyping(Guid organizationId, Guid conversationId, string userId)
    {
        var groupName = GetConversationGroupName(organizationId, conversationId);
        await Clients.GroupExcept(groupName, Context.ConnectionId).SendAsync("UserStoppedTyping", new 
        { 
            UserId = userId 
        });
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("User {ConnectionId} disconnected", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    private static string GetConversationGroupName(Guid organizationId, Guid conversationId)
    {
        return $"conversation-{organizationId}-{conversationId}";
    }
}
