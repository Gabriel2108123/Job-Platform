using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HospitalityPlatform.Core.Interfaces;
using HospitalityPlatform.Database;
using HospitalityPlatform.Audit.Services;

namespace HospitalityPlatform.Api.Services;

public class OrgAuthorizationService : IOrgAuthorizationService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IAuditService _auditService;
    private readonly ILogger<OrgAuthorizationService> _logger;

    public OrgAuthorizationService(
        ApplicationDbContext dbContext,
        IAuditService auditService,
        ILogger<OrgAuthorizationService> logger)
    {
        _dbContext = dbContext;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<bool> HasPermissionAsync(Guid userId, Guid orgId, string permissionKey)
    {
        // "admin.all" means owner access, which overrides any other requirement
        var hasPermission = await _dbContext.OrgMemberRoles
            .Include(mr => mr.OrgRole)
            .ThenInclude(r => r.Permissions)
            .Where(mr => mr.UserId == userId && mr.OrganizationId == orgId)
            .SelectMany(mr => mr.OrgRole.Permissions)
            .AnyAsync(p => p.PermissionKey == permissionKey || p.PermissionKey == "admin.all");

        return hasPermission;
    }

    public async Task EnsurePermissionAsync(Guid userId, Guid orgId, string permissionKey)
    {
        bool hasPermission = await HasPermissionAsync(userId, orgId, permissionKey);
        
        if (!hasPermission)
        {
            var details = new
            {
                action = "permission_denied",
                requiredPermission = permissionKey,
                orgId = orgId.ToString()
            };
            
            // Log high-risk actions being denied
            await _auditService.LogAsync(
                action: "PermissionDenied",
                entityType: "Organization",
                entityId: orgId.ToString(),
                details: details,
                userId: userId.ToString(),
                organizationId: orgId);

            _logger.LogWarning("User {UserId} denied access for {PermissionKey} in Org {OrgId}", userId, permissionKey, orgId);
            
            throw new UnauthorizedAccessException($"You do not have the required permission: {permissionKey}");
        }
    }

    public async Task<Guid?> GetUserOrganizationIdAsync(Guid userId)
    {
        return await _dbContext.OrgMemberRoles
            .Where(mr => mr.UserId == userId)
            .Select(mr => (Guid?)mr.OrganizationId)
            .FirstOrDefaultAsync();
    }
}
