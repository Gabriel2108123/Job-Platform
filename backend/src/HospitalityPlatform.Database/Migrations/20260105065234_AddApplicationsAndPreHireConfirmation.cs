using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationsAndPreHireConfirmation : Migration
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
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CoverLetter = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    AppliedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ScreenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InterviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OfferedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PreHireChecksStartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HiredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WithdrawnAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applications_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PreHireConfirmations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConfirmedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    RightToWorkConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConfirmationText = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ConfirmationVersion = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PreHireConfirmations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PreHireConfirmations_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_AppliedAt",
                table: "Applications",
                column: "AppliedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CandidateId",
                table: "Applications",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_JobId",
                table: "Applications",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_JobId_CandidateId",
                table: "Applications",
                columns: new[] { "JobId", "CandidateId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_JobId_Status",
                table: "Applications",
                columns: new[] { "JobId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_OrganizationId",
                table: "Applications",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Status",
                table: "Applications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_PreHireConfirmations_ApplicationId",
                table: "PreHireConfirmations",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_PreHireConfirmations_ConfirmedAt",
                table: "PreHireConfirmations",
                column: "ConfirmedAt");

            migrationBuilder.CreateIndex(
                name: "IX_PreHireConfirmations_OrganizationId",
                table: "PreHireConfirmations",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_PreHireConfirmations_RightToWorkConfirmed",
                table: "PreHireConfirmations",
                column: "RightToWorkConfirmed");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PreHireConfirmations");

            migrationBuilder.DropTable(
                name: "Applications");
        }
    }
}
