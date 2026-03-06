using HospitalityPlatform.Applications.DTOs;
using HospitalityPlatform.Applications.Entities;
using HospitalityPlatform.Applications.Enums;
using HospitalityPlatform.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalityPlatform.Applications.Services;

public class OfferService : IOfferService
{
    private readonly IApplicationsDbContext _dbContext;
    private readonly IOrgAuthorizationService _orgAuthService;
    private readonly ILogger<OfferService> _logger;

    public OfferService(
        IApplicationsDbContext dbContext,
        IOrgAuthorizationService orgAuthService,
        ILogger<OfferService> logger)
    {
        _dbContext = dbContext;
        _orgAuthService = orgAuthService;
        _logger = logger;
    }

    public async Task<OfferDto> CreateOfferAsync(Guid organizationId, CreateOfferDto dto, string userId)
    {
        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == dto.ApplicationId);

        if (application == null)
        {
            throw new InvalidOperationException("Application not found");
        }

        var job = await _dbContext.Jobs
            .FirstOrDefaultAsync(j => j.Id == application.JobId && j.OrganizationId == organizationId);

        if (job == null)
        {
            throw new InvalidOperationException("Application does not belong to your organization");
        }

        var offer = new Offer
        {
            Id = Guid.NewGuid(),
            ApplicationId = dto.ApplicationId,
            SalaryAmount = dto.SalaryAmount,
            SalaryCurrency = dto.SalaryCurrency,
            ProposedStartDate = dto.ProposedStartDate,
            Notes = dto.Notes,
            Status = OfferStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Offers.Add(offer);

        // Update application status to OfferSent (automated as per requirement)
        application.CurrentStatus = ApplicationStatus.OfferSent;
        application.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Offer {OfferId} created for application {ApplicationId} by user {UserId}", 
            offer.Id, dto.ApplicationId, userId);

        return MapToDto(offer);
    }

    public async Task<OfferDto?> GetOfferAsync(Guid organizationId, Guid offerId)
    {
        var offer = await _dbContext.Offers
            .FirstOrDefaultAsync(o => o.Id == offerId);

        if (offer == null) return null;

        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == offer.ApplicationId);

        if (application == null) return null;

        var jobExists = await _dbContext.Jobs
            .AnyAsync(j => j.Id == application.JobId && j.OrganizationId == organizationId);

        if (!jobExists) return null;

        return MapToDto(offer);
    }

    public async Task<IEnumerable<OfferDto>> GetApplicationOffersAsync(Guid organizationId, Guid applicationId)
    {
        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
        {
            throw new InvalidOperationException("Application not found");
        }

        var jobExists = await _dbContext.Jobs
            .AnyAsync(j => j.Id == application.JobId && j.OrganizationId == organizationId);

        if (!jobExists)
        {
            throw new InvalidOperationException("Application does not belong to your organization");
        }

        var offers = await _dbContext.Offers
            .Where(o => o.ApplicationId == applicationId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return offers.Select(MapToDto);
    }

    public async Task<OfferDto> DecideOfferAsync(Guid organizationId, Guid offerId, DecideOfferDto dto, string userId)
    {
        var offer = await _dbContext.Offers
            .FirstOrDefaultAsync(o => o.Id == offerId);

        if (offer == null)
        {
            throw new InvalidOperationException("Offer not found");
        }

        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == offer.ApplicationId);

        if (application == null)
        {
            throw new InvalidOperationException("Access denied: Offer does not belong to your organization");
        }

        offer.Status = dto.Accept ? OfferStatus.Accepted : OfferStatus.Declined;
        offer.DecidedAt = DateTime.UtcNow;
        offer.UpdatedAt = DateTime.UtcNow;

        if (dto.Accept)
        {
            application.CurrentStatus = ApplicationStatus.Hired;
            application.UpdatedAt = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Offer {OfferId} {Status} by user {UserId}", 
            offerId, offer.Status, userId);

        return MapToDto(offer);
    }

    public async Task DeleteOfferAsync(Guid organizationId, Guid offerId, string userId)
    {
        var offer = await _dbContext.Offers
            .FirstOrDefaultAsync(o => o.Id == offerId);

        if (offer == null) return;

        var application = await _dbContext.Applications
            .FirstOrDefaultAsync(a => a.Id == offer.ApplicationId);

        if (application == null)
        {
            throw new InvalidOperationException("Access denied: Offer does not belong to your organization");
        }

        _dbContext.Offers.Remove(offer);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Offer {OfferId} deleted by user {UserId}", offerId, userId);
    }

    private OfferDto MapToDto(Offer offer)
    {
        return new OfferDto
        {
            Id = offer.Id,
            ApplicationId = offer.ApplicationId,
            SalaryAmount = offer.SalaryAmount,
            SalaryCurrency = offer.SalaryCurrency,
            ProposedStartDate = offer.ProposedStartDate,
            Notes = offer.Notes,
            Status = offer.Status,
            DecidedAt = offer.DecidedAt
        };
    }
}
