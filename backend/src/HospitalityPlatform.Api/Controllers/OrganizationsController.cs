using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HospitalityPlatform.Api.Controllers;

[ApiController]
[Route("api/organizations")]
[Authorize]
public class OrganizationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<OrganizationsController> _logger;

    public OrganizationsController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<OrganizationsController> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    /// <summary>
    /// Create a new organization
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OrganizationDto>> CreateOrganization([FromBody] CreateOrganizationDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { error = "Organization name is required" });
        }

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not found" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            // Check if user already has an organization
            if (user.OrganizationId.HasValue)
            {
                return BadRequest(new { error = "User already belongs to an organization" });
            }

            var organization = new Organization
            {
                Name = request.Name.Trim(),
                IsActive = true
            };

            _context.Organizations.Add(organization);
            await _context.SaveChangesAsync();

            // Link user to organization
            user.OrganizationId = organization.Id;
            await _userManager.UpdateAsync(user);

            // Ensure user has BusinessOwner role
            if (!await _userManager.IsInRoleAsync(user, "BusinessOwner"))
            {
                await _userManager.AddToRoleAsync(user, "BusinessOwner");
            }

            return Ok(new OrganizationDto
            {
                Id = organization.Id.ToString(),
                Name = organization.Name,
                IsActive = organization.IsActive,
                CreatedAt = organization.CreatedAt.ToString("O")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating organization");
            return StatusCode(500, new { error = "An error occurred while creating the organization" });
        }
    }

    /// <summary>
    /// Get current user's organization
    /// </summary>
    [HttpGet("my-organization")]
    public async Task<ActionResult<OrganizationDto>> GetMyOrganization()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not found" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            if (!user.OrganizationId.HasValue)
            {
                return NotFound(new { error = "User does not belong to an organization" });
            }

            var organization = await _context.Organizations.FindAsync(user.OrganizationId);
            if (organization == null)
            {
                return NotFound(new { error = "Organization not found" });
            }

            return Ok(new OrganizationDto
            {
                Id = organization.Id.ToString(),
                Name = organization.Name,
                IsActive = organization.IsActive,
                CreatedAt = organization.CreatedAt.ToString("O")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving organization");
            return StatusCode(500, new { error = "An error occurred while retrieving the organization" });
        }
    }
}

public class CreateOrganizationDto
{
    public string Name { get; set; } = "";
}

public class OrganizationDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } = "";
}
