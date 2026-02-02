using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    /// <inheritdoc />
    public partial class Phase3_CoworkerDiscovery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CoworkerConnections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequesterId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiverId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlaceKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    WorkplaceName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoworkerConnections", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CoworkerConnections_PlaceKey",
                table: "CoworkerConnections",
                column: "PlaceKey");

            migrationBuilder.CreateIndex(
                name: "IX_CoworkerConnections_ReceiverId",
                table: "CoworkerConnections",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_CoworkerConnections_RequesterId",
                table: "CoworkerConnections",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_CoworkerConnections_RequesterId_ReceiverId_PlaceKey",
                table: "CoworkerConnections",
                columns: new[] { "RequesterId", "ReceiverId", "PlaceKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CoworkerConnections_Status",
                table: "CoworkerConnections",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CoworkerConnections");
        }
    }
}
