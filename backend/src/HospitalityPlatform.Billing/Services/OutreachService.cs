using HospitalityPlatform.Billing.DTOs;
using HospitalityPlatform.Billing.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Billing.Services;

public class OutreachService : IOutreachService
{
    private readonly IBillingDbContext _context;
    private readonly ILogger<OutreachService> _logger;

    public OutreachService(IBillingDbContext context, ILogger<OutreachService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<int> GetCreditBalanceAsync(Guid organizationId)
    {
        var credits = await _context.OrganizationCredits
            .FirstOrDefaultAsync(c => c.OrganizationId == organizationId);
        
        return credits?.Balance ?? 0;
    }

    public async Task<OutreachResultDto> SendOutreachAsync(Guid organizationId, string performedByUserId, OutreachRequestDto request)
    {
        // 1. Get or Create Credit Record
        var credits = await _context.OrganizationCredits
            .FirstOrDefaultAsync(c => c.OrganizationId == organizationId);

        if (credits == null)
        {
            // For MVP, give 3 free credits to new orgs if they don't exist
            credits = new OrganizationCredit
            {
                OrganizationId = organizationId,
                Balance = 3,
                TotalLifetimeCredits = 3
            };
            _context.OrganizationCredits.Add(credits);
            await _context.SaveChangesAsync();
        }

        // 2. Check Balance
        if (credits.Balance < 1)
        {
            return new OutreachResultDto 
            { 
                Success = false, 
                Error = "Insufficient outreach credits. Please purchase more." 
            };
        }

        // 3. Prevent duplicate outreach to same candidate for same job within 30 days
        var recentOutreach = await _context.OutreachActivities
            .AnyAsync(a => a.OrganizationId == organizationId && 
                         a.CandidateUserId == request.CandidateUserId && 
                         a.JobId == request.JobId &&
                         a.CreatedAt > DateTime.UtcNow.AddDays(-30));

        if (recentOutreach)
        {
            return new OutreachResultDto
            {
                Success = false,
                Error = "You have already contacted this candidate recently for this role."
            };
        }

        // 4. Deduct Credit
        credits.Balance -= 1;
        credits.UpdatedAt = DateTime.UtcNow;

        // 5. Record Activity
        var activity = new OutreachActivity
        {
            OrganizationId = organizationId,
            PerformedByUserId = performedByUserId,
            CandidateUserId = request.CandidateUserId,
            JobId = request.JobId,
            CreditsDeducted = 1
        };

        _context.OutreachActivities.Add(activity);
        
        await _context.SaveChangesAsync();

        _logger.LogInformation("Organization {OrgId} used 1 credit to contact Candidate {CandId}", 
            organizationId, request.CandidateUserId);

        return new OutreachResultDto
        {
            Success = true,
            RemainingBalance = credits.Balance
        };
    }
}
