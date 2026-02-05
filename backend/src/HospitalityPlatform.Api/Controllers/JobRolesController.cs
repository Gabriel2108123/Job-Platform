using HospitalityPlatform.Database;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobRolesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<JobRolesController> _logger;

    public JobRolesController(ApplicationDbContext context, ILogger<JobRolesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all active job roles, optionally filtered by department
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetJobRoles([FromQuery] string? department = null)
    {
        try
        {
            var query = _context.JobRoles.Where(jr => jr.IsActive);

            if (!string.IsNullOrEmpty(department))
            {
                query = query.Where(jr => jr.Department == department);
            }

            var jobRoles = await query
                .OrderBy(jr => jr.Department)
                .ThenBy(jr => jr.DisplayOrder)
                .Select(jr => new
                {
                    jr.Id,
                    jr.Name,
                    jr.Department,
                    jr.DisplayOrder
                })
                .ToListAsync();

            return Ok(jobRoles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch job roles");
            return StatusCode(500, new { error = "Failed to fetch job roles" });
        }
    }

    /// <summary>
    /// Get all job roles grouped by department
    /// </summary>
    [HttpGet("by-department")]
    public async Task<ActionResult<object>> GetJobRolesByDepartment()
    {
        try
        {
            var jobRoles = await _context.JobRoles
                .Where(jr => jr.IsActive)
                .OrderBy(jr => jr.DisplayOrder)
                .ToListAsync();

            var grouped = jobRoles
                .GroupBy(jr => jr.Department)
                .Select(g => new
                {
                    Department = g.Key,
                    Roles = g.Select(jr => new
                    {
                        jr.Id,
                        jr.Name,
                        jr.DisplayOrder
                    }).ToList()
                })
                .ToList();

            return Ok(grouped);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch grouped job roles");
            return StatusCode(500, new { error = "Failed to fetch grouped job roles" });
        }
    }

    /// <summary>
    /// Get list of all departments
    /// </summary>
    [HttpGet("departments")]
    public async Task<ActionResult<IEnumerable<string>>> GetDepartments()
    {
        try
        {
            var departments = await _context.JobRoles
                .Where(jr => jr.IsActive)
                .Select(jr => jr.Department)
                .Distinct()
                .OrderBy(d => d)
                .ToListAsync();

            return Ok(departments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch departments");
            return StatusCode(500, new { error = "Failed to fetch departments" });
        }
    }

    /// <summary>
    /// Search job roles by name
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<object>>> SearchJobRoles([FromQuery] string query)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { error = "Search query is required" });
            }

            var jobRoles = await _context.JobRoles
                .Where(jr => jr.IsActive && jr.Name.ToLower().Contains(query.ToLower()))
                .OrderBy(jr => jr.Department)
                .ThenBy(jr => jr.DisplayOrder)
                .Select(jr => new
                {
                    jr.Id,
                    jr.Name,
                    jr.Department,
                    jr.DisplayOrder
                })
                .Take(50)
                .ToListAsync();

            return Ok(jobRoles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search job roles");
            return StatusCode(500, new { error = "Failed to search job roles" });
        }
    }
}
