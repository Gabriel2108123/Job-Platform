using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations
{
    public partial class AddDocumentTypeAndRetention : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DocumentType",
                table: "Documents",
                type: "integer",
                nullable: false,
                defaultValue: 99);

            migrationBuilder.AddColumn<DateTime>(
                name: "RetentionDate",
                table: "Documents",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_DocumentType",
                table: "Documents",
                column: "DocumentType");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Documents_DocumentType",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "DocumentType",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "RetentionDate",
                table: "Documents");
        }
    }
}
