using HospitalityPlatform.Core.Entities;

namespace HospitalityPlatform.Jobs.Entities;

public class JobRole : BaseEntity
{
    public required string Name { get; set; }
    public required string Department { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<Job> Jobs { get; set; } = new List<Job>();
}
