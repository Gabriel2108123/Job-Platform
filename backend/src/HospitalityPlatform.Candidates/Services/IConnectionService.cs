using HospitalityPlatform.Candidates.DTOs;

namespace HospitalityPlatform.Candidates.Services;

public interface IConnectionService
{
    Task<ConnectionResultDto> SendRequestAsync(Guid requesterId, SendConnectionRequestDto dto);
    Task<bool> AcceptRequestAsync(Guid connectionId, Guid userId);
    Task<bool> DeclineRequestAsync(Guid connectionId, Guid userId);
    Task<List<ConnectionDto>> GetPendingRequestsAsync(Guid userId);
    Task<List<ConnectionDto>> GetConnectionsAsync(Guid userId);
}

public class SendConnectionRequestDto
{
    public Guid ReceiverId { get; set; }
    public string PlaceKey { get; set; } = string.Empty;
    public string WorkplaceName { get; set; } = string.Empty;
}

public class ConnectionDto
{
    public Guid Id { get; set; }
    public Guid OtherUserId { get; set; }
    public string OtherUserName { get; set; } = string.Empty;
    public string WorkplaceName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
}

public class ConnectionResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
