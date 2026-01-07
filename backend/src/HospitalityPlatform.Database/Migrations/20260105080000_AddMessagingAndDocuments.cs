using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HospitalityPlatform.Database.Migrations;

/// <inheritdoc />
public partial class AddMessagingAndDocuments : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Create Conversations table
        migrationBuilder.CreateTable(
            name: "Conversations",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                Subject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                ApplicationId = table.Column<Guid>(type: "uuid", nullable: true),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                CreatedByUserId = table.Column<string>(type: "text", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                ArchivedByUserId = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Conversations", x => x.Id);
            });

        // Create ConversationParticipants table
        migrationBuilder.CreateTable(
            name: "ConversationParticipants",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<string>(type: "text", nullable: false),
                JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                LastReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                HasLeft = table.Column<bool>(type: "boolean", nullable: false),
                LeftAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ConversationParticipants", x => x.Id);
                table.ForeignKey(
                    name: "FK_ConversationParticipants_Conversations_ConversationId",
                    column: x => x.ConversationId,
                    principalTable: "Conversations",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // Create Messages table
        migrationBuilder.CreateTable(
            name: "Messages",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                SentByUserId = table.Column<string>(type: "text", nullable: false),
                Content = table.Column<string>(type: "text", nullable: false),
                SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                EditedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                EditedByUserId = table.Column<string>(type: "text", nullable: true),
                IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                DeletedByUserId = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Messages", x => x.Id);
                table.ForeignKey(
                    name: "FK_Messages_Conversations_ConversationId",
                    column: x => x.ConversationId,
                    principalTable: "Conversations",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // Create Documents table
        migrationBuilder.CreateTable(
            name: "Documents",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                S3Key = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                UploadedByUserId = table.Column<string>(type: "text", nullable: false),
                UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                LastAccessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                DeletedByUserId = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Documents", x => x.Id);
            });

        // Create DocumentAccesses table
        migrationBuilder.CreateTable(
            name: "DocumentAccesses",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                GrantedByUserId = table.Column<string>(type: "text", nullable: false),
                GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                RevokedByUserId = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_DocumentAccesses", x => x.Id);
                table.ForeignKey(
                    name: "FK_DocumentAccesses_Documents_DocumentId",
                    column: x => x.DocumentId,
                    principalTable: "Documents",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // Create indices for Conversations
        migrationBuilder.CreateIndex(
            name: "IX_Conversations_ApplicationId",
            table: "Conversations",
            column: "ApplicationId");

        migrationBuilder.CreateIndex(
            name: "IX_Conversations_CreatedAt",
            table: "Conversations",
            column: "CreatedAt");

        migrationBuilder.CreateIndex(
            name: "IX_Conversations_IsActive",
            table: "Conversations",
            column: "IsActive");

        migrationBuilder.CreateIndex(
            name: "IX_Conversations_OrganizationId",
            table: "Conversations",
            column: "OrganizationId");

        // Create indices for ConversationParticipants
        migrationBuilder.CreateIndex(
            name: "IX_ConversationParticipants_ConversationId",
            table: "ConversationParticipants",
            column: "ConversationId");

        migrationBuilder.CreateIndex(
            name: "IX_ConversationParticipants_ConversationId_UserId",
            table: "ConversationParticipants",
            columns: new[] { "ConversationId", "UserId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_ConversationParticipants_UserId",
            table: "ConversationParticipants",
            column: "UserId");

        // Create indices for Messages
        migrationBuilder.CreateIndex(
            name: "IX_Messages_ConversationId",
            table: "Messages",
            column: "ConversationId");

        migrationBuilder.CreateIndex(
            name: "IX_Messages_ConversationId_SentAt",
            table: "Messages",
            columns: new[] { "ConversationId", "SentAt" });

        migrationBuilder.CreateIndex(
            name: "IX_Messages_OrganizationId",
            table: "Messages",
            column: "OrganizationId");

        migrationBuilder.CreateIndex(
            name: "IX_Messages_SentAt",
            table: "Messages",
            column: "SentAt");

        // Create indices for Documents
        migrationBuilder.CreateIndex(
            name: "IX_Documents_OrganizationId_IsDeleted",
            table: "Documents",
            columns: new[] { "OrganizationId", "IsDeleted" });

        migrationBuilder.CreateIndex(
            name: "IX_Documents_UploadedAt",
            table: "Documents",
            column: "UploadedAt");

        migrationBuilder.CreateIndex(
            name: "IX_Documents_UploadedByUserId",
            table: "Documents",
            column: "UploadedByUserId");

        migrationBuilder.CreateIndex(
            name: "IX_Documents_OrganizationId",
            table: "Documents",
            column: "OrganizationId");

        // Create indices for DocumentAccesses
        migrationBuilder.CreateIndex(
            name: "IX_DocumentAccesses_ApplicationId",
            table: "DocumentAccesses",
            column: "ApplicationId");

        migrationBuilder.CreateIndex(
            name: "IX_DocumentAccesses_DocumentId",
            table: "DocumentAccesses",
            column: "DocumentId");

        migrationBuilder.CreateIndex(
            name: "IX_DocumentAccesses_DocumentId_ApplicationId",
            table: "DocumentAccesses",
            columns: new[] { "DocumentId", "ApplicationId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_DocumentAccesses_GrantedAt",
            table: "DocumentAccesses",
            column: "GrantedAt");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "ConversationParticipants");

        migrationBuilder.DropTable(
            name: "DocumentAccesses");

        migrationBuilder.DropTable(
            name: "Messages");

        migrationBuilder.DropTable(
            name: "Documents");

        migrationBuilder.DropTable(
            name: "Conversations");
    }
}
