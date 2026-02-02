using HospitalityPlatform.Billing.DTOs;

namespace HospitalityPlatform.Billing.Services;

public interface IOutreachService
{
    Task<OutreachResultDto> SendOutreachAsync(Guid organizationId, string performedByUserId, OutreachRequestDto request);
    Task<int> GetCreditBalanceAsync(Guid organizationId);
}
