using HospitalityPlatform.Identity.Entities;
using HospitalityPlatform.Identity.Services;
using HospitalityPlatform.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HospitalityPlatform.Api.Controllers;

/// <summary>
/// Handles authentication, user registration, and identity-related operations.
/// Manages JWT token generation and role assignments for multi-tenant organizations.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;
    private readonly IEmailVerificationService? _emailVerificationService;
    private readonly IEmailService? _emailService;
    private readonly ApplicationDbContext _context;

    /// <summary>
    /// Initializes a new instance of the AuthController with required identity and database services.
    /// </summary>
    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IConfiguration configuration,
        ILogger<AuthController> logger,
        ApplicationDbContext context,
        IEmailVerificationService? emailVerificationService = null,
        IEmailService? emailService = null)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _logger = logger;
        _context = context;
        _emailVerificationService = emailVerificationService;
        _emailService = emailService;
    }

    // ... (Existing Login/Register methods unchanged for now) ...

    /// <summary>
    /// Send email verification link to current user
    /// </summary>
    [HttpPost("send-verification")]
    [Authorize]
    public async Task<ActionResult> SendVerificationEmail()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized(new { error = "User not found in token" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            if (user.EmailVerified)
            {
                return Ok(new { message = "Email already verified" });
            }

            // Generate verification token
            if (_emailVerificationService == null)
            {
                _logger.LogWarning("EmailVerificationService not available");
                return StatusCode(500, new { error = "Email verification service not configured" });
            }

            var token = await _emailVerificationService.GenerateVerificationTokenAsync(userGuid);
            
            // Generate verification URL
            // In a real app, base URL should come from config (e.g., ClientAppUrl)
            // Assuming localhost:3000 for local dev frontend
            
            var clientUrl = _configuration.GetValue<string>("ClientAppUrl") ?? "http://localhost:3000";
            var verificationUrl = $"{clientUrl}/verify-email?token={Uri.EscapeDataString(token)}&userId={userGuid}";

            _logger.LogInformation("Generated verification token for user {UserId}", userGuid);

            if (_emailService != null)
            {
                await _emailService.SendVerificationEmailAsync(user.Email!, verificationUrl);
            }
            else
            {
                // Fallback logging if service missing
                 _logger.LogWarning("EmailService is missing! printing to console only.");
                 Console.WriteLine($"\n========== EMAIL VERIFICATION ==========");
                 Console.WriteLine($"Verification URL: {verificationUrl}");
                 Console.WriteLine($"=========================================\n");
            }

            return Ok(new { message = "Verification email sent" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending verification email");
            return StatusCode(500, new { error = "An error occurred while sending verification email" });
        }
    }

    /// <summary>
    /// Login user with email and password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Email and password are required" });
        }

        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning("Login attempt with non-existent email: {Email}", request.Email);
                return Unauthorized(new { error = "Invalid email or password" });
            }

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
            {
                _logger.LogWarning("Login attempt with wrong password for user: {Email}", request.Email);
                return Unauthorized(new { error = "Invalid email or password" });
            }

            // Check if user is locked out
            if (await _userManager.IsLockedOutAsync(user))
            {
                _logger.LogWarning("Login attempt for locked out user: {Email}", request.Email);
                return Unauthorized(new { error = "Account is locked. Try again later." });
            }

            // Get user roles and generate JWT token with roles
            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new User
                {
                    Id = user.Id.ToString(),
                    Email = user.Email ?? "",
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    OrganizationId = user.OrganizationId?.ToString(),
                    IsActive = user.IsActive,
                    EmailVerified = user.EmailVerified,
                    CreatedAt = user.CreatedAt.ToString("O"),
                    Role = roles.FirstOrDefault() ?? "Candidate"
                },
                ExpiresAt = DateTime.UtcNow.AddHours(24).ToString("O")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging in user");
            return StatusCode(500, new { error = "An error occurred while processing your request" });
        }
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Email and password are required" });
        }

        try
        {
            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { error = "User with this email already exists" });
            }

            // Determine role
            var roleToAssign = request.Role ?? "Candidate";
            
            // Validate BusinessOwner requirements
            if (roleToAssign == "BusinessOwner" && string.IsNullOrWhiteSpace(request.OrganizationName))
            {
                return BadRequest(new { error = "Organization name is required for BusinessOwner registration" });
            }

            // Create new user
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FullName ?? request.Email,
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogWarning("User registration failed: {Errors}", errors);
                return BadRequest(new { error = "Registration failed: " + errors });
            }

            // Handle organization creation for BusinessOwner
            if (roleToAssign == "BusinessOwner" && !string.IsNullOrWhiteSpace(request.OrganizationName))
            {
                try
                {
                    var organization = new Organization
                    {
                        Name = request.OrganizationName.Trim(),
                        IsActive = true
                    };
                    
                    _context.Organizations.Add(organization);
                    await _context.SaveChangesAsync();

                    user.OrganizationId = organization.Id;
                    await _userManager.UpdateAsync(user);
                    
                    _logger.LogInformation("Organization created for user {Email}: {OrgName}", request.Email, request.OrganizationName);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating organization during registration");
                    return StatusCode(500, new { error = "Failed to create organization" });
                }
            }

            // Assign role
            await _userManager.AddToRoleAsync(user, roleToAssign);

            // Generate JWT token with roles
            var roles = await _userManager.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new User
                {
                    Id = user.Id.ToString(),
                    Email = user.Email ?? "",
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    OrganizationId = user.OrganizationId?.ToString(),
                    IsActive = user.IsActive,
                    EmailVerified = user.EmailVerified,
                    CreatedAt = user.CreatedAt.ToString("O"),
                    Role = roleToAssign
                },
                ExpiresAt = DateTime.UtcNow.AddHours(24).ToString("O")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new { error = "An error occurred while processing your request" });
        }
    }

    /// <summary>
    /// Send email verification link to current user
    /// </summary>
    [HttpPost("send-verification")]
    [Authorize]
    public async Task<ActionResult> SendVerificationEmail()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized(new { error = "User not found in token" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            if (user.EmailVerified)
            {
                return Ok(new { message = "Email already verified" });
            }

            // Generate verification token
            if (_emailVerificationService == null)
            {
                _logger.LogWarning("EmailVerificationService not available");
                return StatusCode(500, new { error = "Email verification service not configured" });
            }

            var token = await _emailVerificationService.GenerateVerificationTokenAsync(userGuid);
            
            // In development, output verification URL to console
            var isDevelopment = _configuration.GetValue<string>("ASPNETCORE_ENVIRONMENT") == "Development";
            if (isDevelopment)
            {
                var verificationUrl = $"http://localhost:3000/verify-email?token={Uri.EscapeDataString(token)}&userId={userGuid}";
                _logger.LogInformation("Email verification URL (DEV MODE): {Url}", verificationUrl);
                Console.WriteLine($"\n========== EMAIL VERIFICATION ==========");
                Console.WriteLine($"Verification URL: {verificationUrl}");
                Console.WriteLine($"=========================================\n");
            }

            // TODO: In production, send actual email via SMTP/SendGrid
            // await _emailService.SendVerificationEmailAsync(user.Email, verificationUrl);

            return Ok(new { message = "Verification email sent" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending verification email");
            return StatusCode(500, new { error = "An error occurred while sending verification email" });
        }
    }

    /// <summary>
    /// Verify email with token
    /// </summary>
    [HttpPost("verify-email")]
    [AllowAnonymous]
    public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.UserId))
        {
            return BadRequest(new { error = "Token and UserId are required" });
        }

        if (!Guid.TryParse(request.UserId, out var userGuid))
        {
            return BadRequest(new { error = "Invalid UserId format" });
        }

        try
        {
            if (_emailVerificationService == null)
            {
                return StatusCode(500, new { error = "Email verification service not configured" });
            }

            var (success, message) = await _emailVerificationService.VerifyEmailAsync(userGuid, request.Token);
            if (!success)
            {
                return BadRequest(new { error = message });
            }

            return Ok(new { message = "Email verified successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying email");
            return StatusCode(500, new { error = "An error occurred while verifying email" });
        }
    }

    /// <summary>
    /// Get current user info
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<User>> GetCurrentUser()
    {
        try
        {
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Unauthorized(new { error = "User not found in token" });
            }

            var user = await _userManager.FindByEmailAsync(userEmail);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            var roles = await _userManager.GetRolesAsync(user);
            
            return Ok(new User
            {
                Id = user.Id.ToString(),
                Email = user.Email ?? "",
                FirstName = user.FirstName,
                LastName = user.LastName,
                OrganizationId = user.OrganizationId?.ToString(),
                IsActive = user.IsActive,
                EmailVerified = user.EmailVerified,
                CreatedAt = user.CreatedAt.ToString("O"),
                Role = roles.FirstOrDefault() ?? "Candidate"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new { error = "An error occurred while processing your request" });
        }
    }

    private string GenerateJwtToken(ApplicationUser user, IEnumerable<string>? roles = null)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "DefaultSecretKeyForDevelopment1234567890";
        var key = Encoding.UTF8.GetBytes(secretKey);

        var fullName = string.IsNullOrWhiteSpace(user.FirstName)
            ? user.Email ?? ""
            : $"{user.FirstName} {user.LastName}".Trim();

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.Name, fullName),
        };

        // Add OrganizationId claim if user belongs to an organization
        if (user.OrganizationId.HasValue)
        {
            claims.Add(new Claim("org_id", user.OrganizationId.Value.ToString()));
        }

        // Add role claims
        if (roles != null)
        {
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
        }

        var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"] ?? "HospitalityPlatform",
            audience: jwtSettings["Audience"] ?? "HospitalityPlatformUsers",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

/// <summary>
/// Login request DTO
/// </summary>
public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

/// <summary>
/// Register request DTO
/// </summary>
public class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? FullName { get; set; }
    public string? Role { get; set; }  // Optional: "Candidate" (default) or "BusinessOwner"
    public string? OrganizationName { get; set; }  // Required if Role is "BusinessOwner"
}
/// <summary>
/// Verify email request DTO
/// </summary>
public class VerifyEmailRequest
{
    public string Token { get; set; } = "";
    public string UserId { get; set; } = "";
}
/// <summary>
/// Authentication response DTO
/// </summary>
public class AuthResponse
{
    public string Token { get; set; } = "";
    public string? RefreshToken { get; set; }
    public User User { get; set; } = new();
    public string ExpiresAt { get; set; } = "";
}

/// <summary>
/// User data DTO (matches frontend User interface)
/// </summary>
public class User
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? OrganizationId { get; set; }
    public bool IsActive { get; set; }
    public bool EmailVerified { get; set; }
    public string CreatedAt { get; set; } = "";
    public string? Role { get; set; }
}
