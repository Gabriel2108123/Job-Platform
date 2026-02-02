using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalityPlatform.Candidates.Entities;

public class CoworkerConnection
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid RequesterId { get; set; }

    [Required]
    public Guid ReceiverId { get; set; }

    [Required]
    [MaxLength(200)]
    public string PlaceKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Accepted, Declined, Blocked

    [Required]
    [MaxLength(200)]
    public string WorkplaceName { get; set; } = string.Empty;

    public DateTime RequestedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
