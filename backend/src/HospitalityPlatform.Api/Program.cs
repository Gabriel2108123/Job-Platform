using HospitalityPlatform.Auth.Handlers;
using HospitalityPlatform.Auth.Policies;
using HospitalityPlatform.Auth.Requirements;
using HospitalityPlatform.Database;
using HospitalityPlatform.Identity.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
});

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    
    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    
    // User settings
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "DefaultSecretKeyForDevelopment1234567890";
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "HospitalityPlatform",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "HospitalityPlatformUsers",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Authorization with custom policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(PolicyNames.RequireCandidate, policy =>
        policy.Requirements.Add(new RoleRequirement("Candidate")));
    
    options.AddPolicy(PolicyNames.RequireBusinessOwner, policy =>
        policy.Requirements.Add(new RoleRequirement("BusinessOwner")));
    
    options.AddPolicy(PolicyNames.RequireBusinessRole, policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("BusinessOwner") || context.User.IsInRole("BusinessStaff")));
    
    options.AddPolicy(PolicyNames.RequireStaff, policy =>
        policy.Requirements.Add(new RoleRequirement("Staff")));
    
    options.AddPolicy(PolicyNames.RequireAdmin, policy =>
        policy.Requirements.Add(new RoleRequirement("Admin")));
    
    options.AddPolicy(PolicyNames.RequireSupport, policy =>
        policy.Requirements.Add(new RoleRequirement("Support")));
    
    options.AddPolicy(PolicyNames.RequireOrganizationAccess, policy =>
        policy.Requirements.Add(new OrganizationRequirement()));
});

// Register authorization handlers
builder.Services.AddScoped<IAuthorizationHandler, RoleRequirementHandler>();
builder.Services.AddScoped<IAuthorizationHandler, OrganizationRequirementHandler>();

// Register application services
builder.Services.AddScoped<HospitalityPlatform.Audit.Services.IAuditService, HospitalityPlatform.Audit.Services.AuditService>();
builder.Services.AddScoped<HospitalityPlatform.Jobs.Services.IJobService, HospitalityPlatform.Jobs.Services.JobService>();
builder.Services.AddScoped<HospitalityPlatform.Jobs.Services.IApplicationService, HospitalityPlatform.Jobs.Services.ApplicationService>();
builder.Services.AddScoped<HospitalityPlatform.Jobs.Services.IJobsDbContext>(provider => provider.GetRequiredService<HospitalityPlatform.Database.ApplicationDbContext>());

// Register Billing services
builder.Services.AddScoped<HospitalityPlatform.Billing.Services.IBillingService, HospitalityPlatform.Billing.Services.BillingService>();
builder.Services.AddScoped<HospitalityPlatform.Billing.Services.IBillingDbContext>(provider => provider.GetRequiredService<HospitalityPlatform.Database.ApplicationDbContext>());

// Register Entitlements services
builder.Services.AddScoped<HospitalityPlatform.Entitlements.Services.IEntitlementsService, HospitalityPlatform.Entitlements.Services.EntitlementsService>();
builder.Services.AddScoped<HospitalityPlatform.Entitlements.Services.IEntitlementsDbContext>(provider => provider.GetRequiredService<HospitalityPlatform.Database.ApplicationDbContext>());

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3000" })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply database migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to apply database migrations");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("HealthCheck")
    .WithOpenApi();

app.Run();
