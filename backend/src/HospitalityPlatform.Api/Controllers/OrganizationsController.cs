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

    /// <summary>
    /// Get all members of the current organization
    /// </summary>
    [HttpGet("members")]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<IEnumerable<TeamMemberDto>>> GetMembers()
    {
        try
        {
            var orgIdClaim = User.FindFirstValue("OrganizationId");
            if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
            {
                return BadRequest(new { error = "Organization context required" });
            }

            var members = await _userManager.Users
                .Where(u => u.OrganizationId == organizationId)
                .OrderBy(u => u.CreatedAt)
                .ToListAsync();

            var result = new List<TeamMemberDto>();
            foreach (var member in members)
            {
                var roles = await _userManager.GetRolesAsync(member);
                result.Add(new TeamMemberDto
                {
                    Id = member.Id.ToString(),
                    FirstName = member.FirstName ?? "",
                    LastName = member.LastName ?? "",
                    Email = member.Email ?? "",
                    Position = member.Position,
                    Role = roles.FirstOrDefault() ?? "Staff",
                    Status = member.IsActive ? "active" : "inactive",
                    CreatedAt = member.CreatedAt
                });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving organization members");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a new team member directly
    /// </summary>
    [HttpPost("members")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<ActionResult<TeamMemberDto>> AddMember([FromBody] CreateTeamMemberDto request)
    {
        try
        {
            var orgIdClaim = User.FindFirstValue("OrganizationId");
            if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
            {
                return BadRequest(new { error = "Organization context required" });
            }

            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { error = "User with this email already exists" });
            }

            var newUser = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Position = request.Position,
                OrganizationId = organizationId,
                EmailVerified = true, // Directly created by owner
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(newUser, request.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = string.Join(", ", result.Errors.Select(e => e.Description)) });
            }

            await _userManager.AddToRoleAsync(newUser, "Staff");

            return Ok(new TeamMemberDto
            {
                Id = newUser.Id.ToString(),
                FirstName = newUser.FirstName ?? "",
                LastName = newUser.LastName ?? "",
                Email = newUser.Email ?? "",
                Position = newUser.Position,
                Role = "Staff",
                Status = "active",
                CreatedAt = newUser.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding team member");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Update a team member's position
    /// </summary>
    [HttpPatch("members/{userId}")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> UpdateMemberPosition(string userId, [FromBody] UpdateTeamMemberDto request)
    {
        try
        {
            var orgIdClaim = User.FindFirstValue("OrganizationId");
            if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
            {
                return BadRequest(new { error = "Organization context required" });
            }

            var member = await _userManager.FindByIdAsync(userId);
            if (member == null || member.OrganizationId != organizationId)
            {
                return NotFound(new { error = "Member not found in your organization" });
            }

            member.Position = request.Position;
            member.UpdatedAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(member);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating team member position");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Remove a team member
    /// </summary>
    [HttpDelete("members/{userId}")]
    [Authorize(Roles = "BusinessOwner")]
    public async Task<IActionResult> RemoveMember(string userId)
    {
        try
        {
            var orgIdClaim = User.FindFirstValue("OrganizationId");
            if (string.IsNullOrEmpty(orgIdClaim) || !Guid.TryParse(orgIdClaim, out var organizationId))
            {
                return BadRequest(new { error = "Organization context required" });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == currentUserId)
            {
                return BadRequest(new { error = "You cannot remove yourself" });
            }

            var member = await _userManager.FindByIdAsync(userId);
            if (member == null || member.OrganizationId != organizationId)
            {
                return NotFound(new { error = "Member not found in your organization" });
            }

            member.OrganizationId = null;
            member.IsActive = false;

            await _userManager.UpdateAsync(member);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing team member");
            return StatusCode(500, new { error = "Internal server error" });
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
