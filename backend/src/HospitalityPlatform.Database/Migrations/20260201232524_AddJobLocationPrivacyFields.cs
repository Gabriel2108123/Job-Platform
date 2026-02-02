using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddJobLocationPrivacyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddressVisibility",
                table: "Jobs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApproxRadiusMeters",
                table: "Jobs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LatApprox",
                table: "Jobs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LatExact",
                table: "Jobs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LngApprox",
                table: "Jobs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LngExact",
                table: "Jobs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LocationVisibility",
                table: "Jobs",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressVisibility",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ApproxRadiusMeters",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LatApprox",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LatExact",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LngApprox",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LngExact",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LocationVisibility",
                table: "Jobs");
        }
    }
}
