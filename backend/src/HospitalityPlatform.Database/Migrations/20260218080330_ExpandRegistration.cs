using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    /// <inheritdoc />
    public partial class ExpandRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AgreedToPrivacy",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AgreedToTerms",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CountryOfResidence",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentStatus",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOver16",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryRole",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReferralCode",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AgreedToPrivacy",
                table: "Organizations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AgreedToTerms",
                table: "Organizations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AuthorizedToHire",
                table: "Organizations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CountryOfRegistration",
                table: "Organizations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiscountCode",
                table: "Organizations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TradingName",
                table: "Organizations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VATNumber",
                table: "Organizations",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgreedToPrivacy",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AgreedToTerms",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CountryOfResidence",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrentStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsOver16",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PrimaryRole",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ReferralCode",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AgreedToPrivacy",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "AgreedToTerms",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "AuthorizedToHire",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "CountryOfRegistration",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "DiscountCode",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "TradingName",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "VATNumber",
                table: "Organizations");
        }
    }
}
