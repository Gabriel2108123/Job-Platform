using HospitalityPlatform.Jobs.Enums;
using System.ComponentModel.DataAnnotations;

namespace HospitalityPlatform.Jobs.DTOs;

public class SearchJobsDto
{
    [StringLength(100)]
    public string? Keyword { get; set; }
    
    public RoleType? RoleType { get; set; }
    public EmploymentType? EmploymentType { get; set; }
    public ShiftPattern? ShiftPattern { get; set; }
    
    [StringLength(100)]
    public string? Location { get; set; }
    
    [StringLength(20)]
    public string? PostalCode { get; set; }
    
    public decimal? MinSalary { get; set; }
    
    [Range(1, 100)]
    public int PageNumber { get; set; } = 1;
    
    [Range(1, 100)]
    public int PageSize { get; set; } = 20;
    
    public string SortBy { get; set; } = "PublishedAt";
    public string SortOrder { get; set; } = "desc";
}
