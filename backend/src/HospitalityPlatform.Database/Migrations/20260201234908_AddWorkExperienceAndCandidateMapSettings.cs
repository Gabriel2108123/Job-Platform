using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkExperienceAndCandidateMapSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CandidateMapSettings",
                columns: table => new
                {
                    CandidateUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkerMapEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DiscoverableByWorkplaces = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AllowConnectionRequests = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateMapSettings", x => x.CandidateUserId);
                });

            migrationBuilder.CreateTable(
                name: "WorkExperiences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    LocationText = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    RoleTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VisibilityLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "private"),
                    IsMapEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LatApprox = table.Column<decimal>(type: "numeric(9,6)", nullable: true),
                    LngApprox = table.Column<decimal>(type: "numeric(9,6)", nullable: true),
                    PlaceKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkExperiences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CandidateMapSettings_DiscoverableByWorkplaces",
                table: "CandidateMapSettings",
                column: "DiscoverableByWorkplaces");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateMapSettings_WorkerMapEnabled",
                table: "CandidateMapSettings",
                column: "WorkerMapEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_WorkExperiences_CandidateUserId",
                table: "WorkExperiences",
                column: "CandidateUserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkExperiences_CandidateUserId_IsMapEnabled",
                table: "WorkExperiences",
                columns: new[] { "CandidateUserId", "IsMapEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkExperiences_IsMapEnabled",
                table: "WorkExperiences",
                column: "IsMapEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_WorkExperiences_PlaceKey",
                table: "WorkExperiences",
                column: "PlaceKey");

            migrationBuilder.CreateIndex(
                name: "IX_WorkExperiences_VisibilityLevel",
                table: "WorkExperiences",
                column: "VisibilityLevel");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CandidateMapSettings");

            migrationBuilder.DropTable(
                name: "WorkExperiences");
        }
    }
}
