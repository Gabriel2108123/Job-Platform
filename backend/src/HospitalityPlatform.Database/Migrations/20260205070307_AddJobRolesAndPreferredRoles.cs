using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddJobRolesAndPreferredRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "JobRoleId",
                table: "Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid[]>(
                name: "PreferredJobRoleIds",
                table: "CandidateProfiles",
                type: "uuid[]",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "JobRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Department = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobRoles", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_JobRoleId",
                table: "Jobs",
                column: "JobRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_JobRoles_Department",
                table: "JobRoles",
                column: "Department");

            migrationBuilder.CreateIndex(
                name: "IX_JobRoles_Department_DisplayOrder",
                table: "JobRoles",
                columns: new[] { "Department", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRoles_IsActive",
                table: "JobRoles",
                column: "IsActive");

            migrationBuilder.AddForeignKey(
                name: "FK_Jobs_JobRoles_JobRoleId",
                table: "Jobs",
                column: "JobRoleId",
                principalTable: "JobRoles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Jobs_JobRoles_JobRoleId",
                table: "Jobs");

            migrationBuilder.DropTable(
                name: "JobRoles");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_JobRoleId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "JobRoleId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "PreferredJobRoleIds",
                table: "CandidateProfiles");
        }
    }
}
