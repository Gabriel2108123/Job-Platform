namespace HospitalityPlatform.Ratings.DTOs;

public class CreateUserRatingDto
{
    public Guid RatedEntityId { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
}

public class UserRatingDto
{
    public Guid Id { get; set; }
    public Guid RaterUserId { get; set; }
    public Guid RatedEntityId { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}
