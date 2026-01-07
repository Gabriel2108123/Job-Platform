using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations;

/// <inheritdoc />
public partial class AddWaitlistTable : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "WaitlistEntries",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                AccountType = table.Column<int>(type: "integer", nullable: false),
                BusinessOrProfession = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                SequenceNumber = table.Column<int>(type: "integer", nullable: false),
                IncentiveAwarded = table.Column<int>(type: "integer", nullable: false),
                ReferralCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                Source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_WaitlistEntries", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_WaitlistEntries_AccountType",
            table: "WaitlistEntries",
            column: "AccountType");

        migrationBuilder.CreateIndex(
            name: "IX_WaitlistEntries_AccountType_SequenceNumber",
            table: "WaitlistEntries",
            columns: new[] { "AccountType", "SequenceNumber" });

        migrationBuilder.CreateIndex(
            name: "IX_WaitlistEntries_CreatedAt",
            table: "WaitlistEntries",
            column: "CreatedAt");

        migrationBuilder.CreateIndex(
            name: "IX_WaitlistEntries_Email",
            table: "WaitlistEntries",
            column: "Email",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_WaitlistEntries_IncentiveAwarded",
            table: "WaitlistEntries",
            column: "IncentiveAwarded");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "WaitlistEntries");
    }
}
