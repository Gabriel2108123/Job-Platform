using HospitalityPlatform.Applications.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalityPlatform.Applications.Services;

public interface IOfferService
{
    Task<OfferDto> CreateOfferAsync(Guid organizationId, CreateOfferDto dto, string userId);
    Task<OfferDto?> GetOfferAsync(Guid organizationId, Guid offerId);
    Task<IEnumerable<OfferDto>> GetApplicationOffersAsync(Guid organizationId, Guid applicationId);
    Task<OfferDto> DecideOfferAsync(Guid organizationId, Guid offerId, DecideOfferDto dto, string userId);
    Task DeleteOfferAsync(Guid organizationId, Guid offerId, string userId);
}
