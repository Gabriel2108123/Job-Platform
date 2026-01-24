
using HospitalityPlatform.Ratings.DTOs;
using HospitalityPlatform.Ratings.Entities;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Ratings.Services;

public interface IRatingsDbContext
{
    DbSet<UserRating> UserRatings { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

public class UserRatingsService : IUserRatingsService
{
    private readonly IRatingsDbContext _context;

    public UserRatingsService(IRatingsDbContext context)
    {
        _context = context;
    }

    public async Task<UserRatingDto> CreateRatingAsync(CreateUserRatingDto dto, Guid raterUserId)
    {
        if (dto.Score < 1 || dto.Score > 5)
            throw new ArgumentException("Score must be between 1 and 5");

        // Prevent self-rating?
        if (dto.RatedEntityId == raterUserId)
            throw new ArgumentException("Cannot rate yourself");

        var rating = new UserRating
        {
            Id = Guid.NewGuid(),
            RaterUserId = raterUserId,
            RatedEntityId = dto.RatedEntityId,
            Score = dto.Score,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserRatings.Add(rating);
        await _context.SaveChangesAsync();

        return new UserRatingDto
        {
            Id = rating.Id,
            RaterUserId = rating.RaterUserId,
            RatedEntityId = rating.RatedEntityId,
            Score = rating.Score,
            Comment = rating.Comment,
            CreatedAt = rating.CreatedAt
        };
    }

    public async Task<List<UserRatingDto>> GetRatingsForEntityAsync(Guid ratedEntityId)
    {
        return await _context.UserRatings
            .Where(r => r.RatedEntityId == ratedEntityId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new UserRatingDto
            {
                Id = r.Id,
                RaterUserId = r.RaterUserId,
                RatedEntityId = r.RatedEntityId,
                Score = r.Score,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<double> GetAverageRatingAsync(Guid ratedEntityId)
    {
        var ratings = await _context.UserRatings
            .Where(r => r.RatedEntityId == ratedEntityId)
            .ToListAsync();

        if (!ratings.Any()) return 0;

        return ratings.Average(r => r.Score);
    }
}
