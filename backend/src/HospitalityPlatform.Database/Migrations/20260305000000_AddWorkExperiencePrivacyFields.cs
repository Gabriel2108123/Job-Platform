using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    public partial class AddWorkExperiencePrivacyFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowCoworkerDiscovery",
                table: "WorkExperiences",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowCoworkerDiscovery",
                table: "WorkExperiences");
        }
    }
}
