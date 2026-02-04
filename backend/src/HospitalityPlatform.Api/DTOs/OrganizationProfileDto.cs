using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Api.DTOs;

/// <summary>
/// DTO for organization profile information
/// </summary>
public class OrganizationProfileDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? BusinessName { get; set; }
    public string? Location { get; set; }
    public string? Website { get; set; }
    public string? Industry { get; set; }
    public string? CompanySize { get; set; }
    public string? PointOfContactName { get; set; }
    public string? PointOfContactEmail { get; set; }
    public string? PointOfContactPhone { get; set; }
    public string? LogoUrl { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for updating organization profile
/// </summary>
public class UpdateOrganizationProfileDto
{
    [StringLength(200)]
    public string? BusinessName { get; set; }
    
    [StringLength(500)]
    public string? Location { get; set; }
    
    [Url]
    [StringLength(500)]
    public string? Website { get; set; }
    
    [StringLength(100)]
    public string? Industry { get; set; }
    
    [StringLength(50)]
    public string? CompanySize { get; set; }
    
    [StringLength(200)]
    public string? PointOfContactName { get; set; }
    
    [EmailAddress]
    [StringLength(200)]
    public string? PointOfContactEmail { get; set; }
    
    [Phone]
    [StringLength(50)]
    public string? PointOfContactPhone { get; set; }
    
    [StringLength(2000)]
    public string? Description { get; set; }
}
