using Microsoft.EntityFrameworkCore;
using HospitalityPlatform.Candidates.Entities;
using HospitalityPlatform.Candidates.DTOs;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Candidates.Services;

public class ConnectionService : IConnectionService
{
    private readonly ICandidatesDbContext _context;
    private readonly ICandidateIdentityService _identityService;
    private readonly ILogger<ConnectionService> _logger;
    private const int MaxDailyRequests = 10;

    public ConnectionService(
        ICandidatesDbContext context, 
        ICandidateIdentityService identityService,
        ILogger<ConnectionService> logger)
    {
        _context = context;
        _identityService = identityService;
        _logger = logger;
    }

    public async Task<ConnectionResultDto> SendRequestAsync(Guid requesterId, SendConnectionRequestDto dto)
    {
        // 1. Check Rate Limit
        var today = DateTime.UtcNow.Date;
        var requestCount = await _context.CoworkerConnections
            .CountAsync(c => c.RequesterId == requesterId && c.RequestedAt >= today);

        if (requestCount >= MaxDailyRequests)
        {
            return new ConnectionResultDto { Success = false, Message = "Daily connection request limit reached (10)." };
        }

        // 2. Check if already exists
        var existing = await _context.CoworkerConnections
            .FirstOrDefaultAsync(c => 
                (c.RequesterId == requesterId && c.ReceiverId == dto.ReceiverId) ||
                (c.RequesterId == dto.ReceiverId && c.ReceiverId == requesterId));

        if (existing != null)
        {
            return new ConnectionResultDto { Success = false, Message = "A connection or request already exists between these users." };
        }

        // 3. Create Request
        var connection = new CoworkerConnection
        {
            Id = Guid.NewGuid(),
            RequesterId = requesterId,
            ReceiverId = dto.ReceiverId,
            PlaceKey = dto.PlaceKey,
            WorkplaceName = dto.WorkplaceName,
            Status = "Pending",
            RequestedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.CoworkerConnections.Add(connection);
        await _context.SaveChangesAsync();

        return new ConnectionResultDto { Success = true, Message = "Connection request sent." };
    }

    public async Task<bool> AcceptRequestAsync(Guid connectionId, Guid userId)
    {
        var connection = await _context.CoworkerConnections
            .FirstOrDefaultAsync(c => c.Id == connectionId && c.ReceiverId == userId && c.Status == "Pending");

        if (connection == null) return false;

        connection.Status = "Accepted";
        connection.RespondedAt = DateTime.UtcNow;
        connection.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeclineRequestAsync(Guid connectionId, Guid userId)
    {
        var connection = await _context.CoworkerConnections
            .FirstOrDefaultAsync(c => c.Id == connectionId && c.ReceiverId == userId && c.Status == "Pending");

        if (connection == null) return false;

        connection.Status = "Declined";
        connection.RespondedAt = DateTime.UtcNow;
        connection.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ConnectionDto>> GetPendingRequestsAsync(Guid userId)
    {
        var requests = await _context.CoworkerConnections
            .Where(c => c.ReceiverId == userId && c.Status == "Pending")
            .OrderByDescending(c => c.RequestedAt)
            .ToListAsync();

        if (!requests.Any()) return new List<ConnectionDto>();

        var userIds = requests.Select(r => r.RequesterId).ToList();
        var profiles = await _identityService.GetUserProfilesAsync(userIds);

        return requests.Select(r => new ConnectionDto
        {
            Id = r.Id,
            OtherUserId = r.RequesterId,
            OtherUserName = profiles.TryGetValue(r.RequesterId, out var p) ? $"{p.FirstName} {p.LastName}" : "Unknown",
            WorkplaceName = r.WorkplaceName,
            Status = r.Status,
            RequestedAt = r.RequestedAt
        }).ToList();
    }

    public async Task<List<ConnectionDto>> GetConnectionsAsync(Guid userId)
    {
        var connections = await _context.CoworkerConnections
            .Where(c => (c.RequesterId == userId || c.ReceiverId == userId) && c.Status == "Accepted")
            .OrderByDescending(c => c.RequestedAt)
            .ToListAsync();

        if (!connections.Any()) return new List<ConnectionDto>();

        var otherUserIds = connections.Select(c => c.RequesterId == userId ? c.ReceiverId : c.RequesterId).Distinct().ToList();
        var profiles = await _identityService.GetUserProfilesAsync(otherUserIds);

        return connections.Select(c => 
        {
            var otherId = c.RequesterId == userId ? c.ReceiverId : c.RequesterId;
            return new ConnectionDto
            {
                Id = c.Id,
                OtherUserId = otherId,
                OtherUserName = profiles.TryGetValue(otherId, out var p) ? $"{p.FirstName} {p.LastName}" : "Unknown",
                WorkplaceName = c.WorkplaceName,
                Status = c.Status,
                RequestedAt = c.RequestedAt
            };
        }).ToList();
    }
}
