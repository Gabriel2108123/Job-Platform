using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationsAndPipeline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateUserId = table.Column<string>(type: "text", nullable: false),
                    CurrentStatus = table.Column<int>(type: "integer", nullable: false),
                    CoverLetter = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    CvFileUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AppliedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationStatusHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: true),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    ChangedByUserId = table.Column<string>(type: "text", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PreHireCheckConfirmation = table.Column<bool>(type: "boolean", nullable: true),
                    PreHireCheckConfirmationText = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationStatusHistories", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_AppliedAt",
                table: "Applications",
                column: "AppliedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CandidateUserId",
                table: "Applications",
                column: "CandidateUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CurrentStatus",
                table: "Applications",
                column: "CurrentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_JobId",
                table: "Applications",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_JobId_CandidateUserId",
                table: "Applications",
                columns: new[] { "JobId", "CandidateUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_JobId_CurrentStatus",
                table: "Applications",
                columns: new[] { "JobId", "CurrentStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_ApplicationId",
                table: "ApplicationStatusHistories",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_ApplicationId_ChangedAt",
                table: "ApplicationStatusHistories",
                columns: new[] { "ApplicationId", "ChangedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_ChangedAt",
                table: "ApplicationStatusHistories",
                column: "ChangedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationStatusHistories");

            migrationBuilder.DropTable(
                name: "Applications");
        }
    }
}
