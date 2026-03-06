using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using HospitalityPlatform.Api.Services;
using HospitalityPlatform.Audit.Services;
using HospitalityPlatform.Core.Entities;
using HospitalityPlatform.Core.Interfaces;
using HospitalityPlatform.Database;
using HospitalityPlatform.Identity.Entities;
using Microsoft.Extensions.Logging;

namespace HospitalityPlatform.Api.Tests.Services
{
    public class OrgAuthorizationServiceTests
    {
        private DbContextOptions<ApplicationDbContext> CreateInMemoryDbContextOptions(string dbName)
        {
            return new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
        }

        [Fact]
        public async Task HasPermissionAsync_WhenUserHasRoleWithPermission_ReturnsTrue()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var options = CreateInMemoryDbContextOptions(dbName);
            var mockAuditService = new Mock<IAuditService>();

            var userId = Guid.NewGuid();
            var organizationId = Guid.NewGuid();
            var permissionKey = "jobs.create";

            using (var context = new ApplicationDbContext(options))
            {
                var role = new OrgRole
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    Name = "Editor"
                };

                context.OrgRoles.Add(role);
                
                context.OrgRolePermissions.Add(new OrgRolePermission
                {
                    Id = Guid.NewGuid(),
                    OrgRoleId = role.Id,
                    PermissionKey = permissionKey
                });

                context.OrgMemberRoles.Add(new OrgMemberRole
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    UserId = userId,
                    OrgRoleId = role.Id
                });

                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var mockLogger = new Mock<ILogger<OrgAuthorizationService>>();
                var service = new OrgAuthorizationService(context, mockAuditService.Object, mockLogger.Object);

                // Act
                var result = await service.HasPermissionAsync(userId, organizationId, permissionKey);

                // Assert
                Assert.True(result);
            }
        }

        [Fact]
        public async Task HasPermissionAsync_WhenUserLacksPermission_ReturnsFalse()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var options = CreateInMemoryDbContextOptions(dbName);
            var mockAuditService = new Mock<IAuditService>();

            var userId = Guid.NewGuid();
            var organizationId = Guid.NewGuid();

            using (var context = new ApplicationDbContext(options))
            {
                var role = new OrgRole
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    Name = "Viewer"
                };

                context.OrgRoles.Add(role);
                
                context.OrgRolePermissions.Add(new OrgRolePermission
                {
                    Id = Guid.NewGuid(),
                    OrgRoleId = role.Id,
                    PermissionKey = "jobs.view"
                });

                context.OrgMemberRoles.Add(new OrgMemberRole
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    UserId = userId,
                    OrgRoleId = role.Id
                });

                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var mockLogger = new Mock<ILogger<OrgAuthorizationService>>();
                var service = new OrgAuthorizationService(context, mockAuditService.Object, mockLogger.Object);

                // Act
                var result = await service.HasPermissionAsync(userId, organizationId, "jobs.create");

                // Assert
                Assert.False(result);
            }
        }

        [Fact]
        public async Task HasPermissionAsync_WhenUserHasAdminAllPermission_ReturnsTrueForAnyPermission()
        {
            // Arrange
            var dbName = Guid.NewGuid().ToString();
            var options = CreateInMemoryDbContextOptions(dbName);
            var mockAuditService = new Mock<IAuditService>();

            var userId = Guid.NewGuid();
            var organizationId = Guid.NewGuid();

            using (var context = new ApplicationDbContext(options))
            {
                var role = new OrgRole
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    Name = "Owner"
                };

                context.OrgRoles.Add(role);
                
                context.OrgRolePermissions.Add(new OrgRolePermission
                {
                    Id = Guid.NewGuid(),
                    OrgRoleId = role.Id,
                    PermissionKey = "admin.all"
                });

                context.OrgMemberRoles.Add(new OrgMemberRole
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    UserId = userId,
                    OrgRoleId = role.Id
                });

                await context.SaveChangesAsync();
            }

            using (var context = new ApplicationDbContext(options))
            {
                var mockLogger = new Mock<ILogger<OrgAuthorizationService>>();
                var service = new OrgAuthorizationService(context, mockAuditService.Object, mockLogger.Object);

                // Act
                var result = await service.HasPermissionAsync(userId, organizationId, "some.random.permission");

                // Assert
                Assert.True(result);
            }
        }
    }
}
