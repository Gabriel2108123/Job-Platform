using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentWalletWithSharing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DocumentRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: true),
                    CandidateUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    RequestedByUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    DocumentType = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentShareGrants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    BusinessUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: true),
                    DocumentRequestId = table.Column<Guid>(type: "uuid", nullable: true),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevokedByUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    RevocationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentShareGrants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentShareGrants_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentShareGrants_DocumentRequests_DocumentRequestId",
                        column: x => x.DocumentRequestId,
                        principalTable: "DocumentRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentRequests_ApplicationId",
                table: "DocumentRequests",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentRequests_CandidateUserId",
                table: "DocumentRequests",
                column: "CandidateUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentRequests_CandidateUserId_Status",
                table: "DocumentRequests",
                columns: new[] { "CandidateUserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentRequests_CreatedAt",
                table: "DocumentRequests",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentRequests_RequestedByUserId",
                table: "DocumentRequests",
                column: "RequestedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentRequests_Status",
                table: "DocumentRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_ApplicationId",
                table: "DocumentShareGrants",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_BusinessUserId",
                table: "DocumentShareGrants",
                column: "BusinessUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_CandidateUserId",
                table: "DocumentShareGrants",
                column: "CandidateUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_DocumentId",
                table: "DocumentShareGrants",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_DocumentId_BusinessUserId",
                table: "DocumentShareGrants",
                columns: new[] { "DocumentId", "BusinessUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_DocumentId_BusinessUserId_RevokedAt",
                table: "DocumentShareGrants",
                columns: new[] { "DocumentId", "BusinessUserId", "RevokedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_DocumentRequestId",
                table: "DocumentShareGrants",
                column: "DocumentRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_ExpiresAt",
                table: "DocumentShareGrants",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentShareGrants_GrantedAt",
                table: "DocumentShareGrants",
                column: "GrantedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentShareGrants");

            migrationBuilder.DropTable(
                name: "DocumentRequests");
        }
    }
}
