using HospitalityPlatform.Ratings.DTOs;
using HospitalityPlatform.Ratings.Entities;
using HospitalityPlatform.Ratings.Services;
using Microsoft.EntityFrameworkCore;
using Moq;
using Moq.EntityFrameworkCore;
using Xunit;

namespace HospitalityPlatform.Api.Tests;

public class UserRatingsServiceTests
{
    private readonly Mock<IRatingsDbContext> _mockContext;
    private readonly UserRatingsService _service;

    public UserRatingsServiceTests()
    {
        _mockContext = new Mock<IRatingsDbContext>();
        _service = new UserRatingsService(_mockContext.Object);
    }

    [Fact]
    public async Task CreateRating_ValidInput_AddRatingAndSaves()
    {
        // Arrange
        var raterId = Guid.NewGuid();
        var entityId = Guid.NewGuid();
        var dto = new CreateUserRatingDto { RatedEntityId = entityId, Score = 5, Comment = "Great!" };
        
        var ratingsSet = new List<UserRating>();
        _mockContext.Setup(c => c.UserRatings).ReturnsDbSet(ratingsSet);
        _mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        // Act
        var result = await _service.CreateRatingAsync(dto, raterId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(5, result.Score);
        _mockContext.Verify(c => c.UserRatings.Add(It.IsAny<UserRating>()), Times.Once);
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateRating_SelfRating_ThrowsArgumentException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var dto = new CreateUserRatingDto { RatedEntityId = userId, Score = 5, Comment = "Me!" };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateRatingAsync(dto, userId));
    }

    [Fact]
    public async Task CreateRating_InvalidScore_ThrowsArgumentException()
    {
        // Arrange
        var dto = new CreateUserRatingDto { RatedEntityId = Guid.NewGuid(), Score = 6, Comment = "Too good" };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _service.CreateRatingAsync(dto, Guid.NewGuid()));
    }

    [Fact]
    public async Task GetAverageRating_ReturnsCorrectAverage()
    {
        // Arrange
        var entityId = Guid.NewGuid();
        var ratings = new List<UserRating>
        {
            new() { Score = 4, RatedEntityId = entityId },
            new() { Score = 5, RatedEntityId = entityId },
            new() { Score = 3, RatedEntityId = Guid.NewGuid() } // Should be ignored
        };
        
        _mockContext.Setup(c => c.UserRatings).ReturnsDbSet(ratings);

        // Act
        var avg = await _service.GetAverageRatingAsync(entityId);

        // Assert
        Assert.Equal(4.5, avg);
    }

    [Fact]
    public async Task GetAverageRating_NoRatings_ReturnsZero()
    {
        // Arrange
        _mockContext.Setup(c => c.UserRatings).ReturnsDbSet(new List<UserRating>());

        // Act
        var avg = await _service.GetAverageRatingAsync(Guid.NewGuid());

        // Assert
        Assert.Equal(0, avg);
    }
}
