using HospitalityPlatform.Ratings.DTOs;

namespace HospitalityPlatform.Ratings.Services;

public interface IUserRatingsService
{
    Task<UserRatingDto> CreateRatingAsync(CreateUserRatingDto dto, Guid raterUserId);
    Task<List<UserRatingDto>> GetRatingsForEntityAsync(Guid ratedEntityId);
    Task<double> GetAverageRatingAsync(Guid ratedEntityId);
}
