using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Ratings.Entities;

public class UserRating : BaseEntity
{
    public Guid RaterUserId { get; set; }
    
    /// <summary>
    /// The ID of the User or Organization being rated.
    /// </summary>
    public Guid RatedEntityId { get; set; }
    
    public int Score { get; set; } // 1-5
    
    public string? Comment { get; set; }
}
