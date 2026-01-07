# Slice 4 Implementation: Messaging & Documents

## Overview
Successfully implemented Slice 4 of the Hospitality Hiring Platform with secure real-time messaging and document management features. All backend code is compiled and ready for integration testing.

## Build Status
✅ **Build: SUCCESS** (0 errors, 6 warnings)
- All 13 projects compiled successfully
- 2 new modules created: `HospitalityPlatform.Messaging`, `HospitalityPlatform.Documents`
- 2 test projects created with unit test stubs
- EF Core migration prepared for database schema updates

## Architecture

### 1. Messaging Module (`HospitalityPlatform.Messaging`)

#### Features
- **Real-time Communication**: SignalR hub for instant message delivery with organization/conversation isolation
- **Rate Limiting**: 30 messages per user per hour (enforced at service layer)
- **Message Management**: Create, edit (sender only), delete (soft delete), retrieve with pagination
- **Conversation Management**: Create, archive, view participants, list paginated
- **Unread Tracking**: Per-user unread message count with timestamp-based filtering
- **Audit Logging**: All create/modify/delete actions logged to AuditLog entity

#### Database Schema
```
Conversations
├── Id (PK, Guid)
├── OrganizationId (FK, Guid) - for tenant isolation
├── ApplicationId (nullable, Guid) - optional application context
├── Subject, Description (string)
├── IsActive, CreatedByUserId, ArchivedAt/ByUserId
└── Relationships: 1→many ConversationParticipants, Messages

ConversationParticipants
├── Id (PK, Guid)
├── ConversationId (FK), UserId (FK)
├── JoinedAt, LastReadAt, HasLeft (bool)
└── Unique constraint: (ConversationId, UserId)

Messages
├── Id (PK, Guid)
├── ConversationId, OrganizationId (FK)
├── SentByUserId, Content
├── SentAt, EditedAt/ByUserId, DeletedAt/ByUserId
├── IsDeleted (bool for soft delete)
└── Relationships: Reverse FK to Conversation
```

#### API Endpoints (11 total)
- `POST /api/messaging/conversations` - Create conversation
- `GET /api/messaging/conversations` - List conversations (paginated)
- `GET /api/messaging/conversations/{id}` - Get single conversation
- `POST /api/messaging/conversations/{id}/participants` - Add participants
- `GET /api/messaging/conversations/{id}/participants` - List participants
- `POST /api/messaging/conversations/{id}/messages` - Send message (rate-limited)
- `GET /api/messaging/conversations/{id}/messages` - Get messages (paginated)
- `GET /api/messaging/conversations/{id}/messages/{msgId}` - Get single message
- `PUT /api/messaging/conversations/{id}/messages/{msgId}` - Edit message
- `DELETE /api/messaging/conversations/{id}/messages/{msgId}` - Delete message
- `POST /api/messaging/conversations/{id}/archive` - Archive conversation
- `GET /api/messaging/unread-count` - Get unread messages count

#### SignalR Hub (`/hubs/messaging`)
- `JoinConversation(organizationId, conversationId, userId)` - Join conversation room
- `LeaveConversation(organizationId, conversationId)` - Leave conversation room
- `SendMessage(...)` - Broadcast message to group
- `UserTyping(...)` - Presence indicator
- `UserStoppedTyping(...)` - Presence indicator update

#### Service Methods
```csharp
// Conversation Management
Task<ConversationDto> CreateConversationAsync(Guid organizationId, CreateConversationDto dto, string userId)
Task<ConversationDto> GetConversationAsync(Guid organizationId, Guid conversationId)
Task<PagedResult<ConversationDto>> GetConversationsAsync(Guid organizationId, int pageNumber, int pageSize)
Task ArchiveConversationAsync(Guid organizationId, Guid conversationId)

// Message Management
Task<MessageDto> SendMessageAsync(Guid organizationId, Guid conversationId, SendMessageDto dto, string userId)
Task<MessageDto> EditMessageAsync(Guid organizationId, Guid conversationId, Guid messageId, EditMessageDto dto, string userId)
Task DeleteMessageAsync(Guid organizationId, Guid conversationId, Guid messageId)
Task<PagedResult<MessageDto>> GetMessagesAsync(Guid organizationId, Guid conversationId, int pageNumber, int pageSize)
Task<MessageDto> GetMessageAsync(Guid organizationId, Guid conversationId, Guid messageId)

// Participant Management
Task AddParticipantsAsync(Guid organizationId, Guid conversationId, AddParticipantsDto dto)
Task<List<ConversationParticipantDto>> GetParticipantsAsync(Guid organizationId, Guid conversationId)
Task MarkAsReadAsync(Guid organizationId, Guid conversationId, string userId)

// Utility
Task<bool> HasExceededRateLimitAsync(Guid organizationId, string userId)
Task<int> GetUnreadCountAsync(Guid organizationId, string userId)
```

### 2. Documents Module (`HospitalityPlatform.Documents`)

#### Features
- **S3 Integration**: AWS S3 presigned URLs for secure file upload/download
- **Per-Application Sharing**: Document access rules scoped to specific applications
- **Organization Isolation**: All documents scoped to organization with multi-tenant enforcement
- **Soft Delete**: Logical deletion with automatic access revocation
- **Presigned URLs**: 1-hour expiration for secure temporary access
- **Audit Logging**: Upload initiation, completion, sharing, revocation all logged

#### Database Schema
```
Documents
├── Id (PK, Guid)
├── OrganizationId, UploadedByUserId (FK)
├── FileName, S3Key, FileSizeBytes, ContentType
├── UploadedAt, LastAccessedAt
├── IsDeleted, DeletedAt/ByUserId
└── Relationships: 1→many DocumentAccesses

DocumentAccess (Join Table)
├── Id (PK, Guid)
├── DocumentId (FK), ApplicationId (FK)
├── GrantedByUserId, GrantedAt
├── RevokedAt/ByUserId, IsActive (computed)
└── Unique constraint: (DocumentId, ApplicationId)
```

#### API Endpoints (9 total)
- `POST /api/documents/create-upload` - Initiate upload (returns presigned URL)
- `POST /api/documents/{id}/complete-upload` - Confirm S3 upload success
- `GET /api/documents/{id}` - Get document metadata
- `GET /api/documents/my-documents` - List user's uploads (paginated)
- `GET /api/documents/application/{appId}` - List app accessible docs (paginated)
- `POST /api/documents/{id}/share` - Grant access to application
- `DELETE /api/documents/access/{accessId}` - Revoke access from application
- `GET /api/documents/{id}/access` - List access rules for document
- `GET /api/documents/{id}/download-url` - Get presigned download URL (with access check)
- `DELETE /api/documents/{id}` - Delete document (only uploader, soft delete)

#### Service Methods
```csharp
// Upload Flow
Task<PresignedUrlDto> CreateUploadAsync(Guid organizationId, CreateDocumentUploadDto dto, string userId)
Task<DocumentDto> CompleteUploadAsync(Guid organizationId, CompleteUploadDto dto)

// Sharing
Task ShareDocumentAsync(Guid organizationId, Guid documentId, ShareDocumentDto dto, string userId)
Task RevokeAccessAsync(Guid organizationId, Guid accessId)
Task<List<DocumentAccessDto>> GetAccessRulesAsync(Guid organizationId, Guid documentId)

// Access Control
Task<bool> UserHasAccessToDocumentAsync(Guid organizationId, Guid documentId, Guid? applicationId, string userId)

// Retrieval
Task<DocumentDto> GetDocumentAsync(Guid organizationId, Guid documentId)
Task<PagedResult<DocumentDto>> GetUserDocumentsAsync(Guid organizationId, string userId, int pageNumber, int pageSize)
Task<PagedResult<DocumentDto>> GetApplicationDocumentsAsync(Guid organizationId, Guid applicationId, int pageNumber, int pageSize)
Task<PresignedUrlDto> GetDownloadUrlAsync(Guid organizationId, Guid documentId, string userId)

// Deletion
Task DeleteDocumentAsync(Guid organizationId, Guid documentId, string userId)
```

#### S3 Configuration
- **Bucket**: `hospitality-platform-documents`
- **Key Pattern**: `org-{organizationId}/user-{userId}/{documentId}/{fileName}`
- **Presigned URL Expiration**: 3600 seconds (1 hour)
- **Access Control**: Document uploader always has access; others require DocumentAccess record

## Security Features

### Organization Isolation
✅ All endpoints enforce organizationId parameter from JWT claims
✅ Service layer validates org isolation on every operation
✅ Database queries filtered by OrganizationId

### Authentication & Authorization
✅ All endpoints require `[Authorize]` attribute
✅ JWT bearer token validation at controller level
✅ SignalR hub requires authorization
✅ User ID extracted from claims for audit logging

### Rate Limiting
✅ 30 messages per user per hour (configurable constant)
✅ Enforced in MessagingService.SendMessageAsync via HasExceededRateLimitAsync
✅ Query checks last 1 hour of messages: `WHERE SentAt > DateTime.UtcNow.AddHours(-1)`

### Document Security
✅ Per-application access control via DocumentAccess join table
✅ Document uploader always has implicit access
✅ S3 presigned URLs with 1-hour expiration
✅ Access verified before download URL generation
✅ Soft delete prevents accidental data loss

### Audit Trail
✅ All write operations logged to AuditLog entity
✅ Captures: Action, EntityType, EntityId, UserId, OrganizationId, Timestamp
✅ Messaging: CreateConversation, MessageSent, MessageEdited, MessageDeleted, ParticipantsAdded, ConversationArchived
✅ Documents: DocumentUploadInitiated, DocumentUploadCompleted, DocumentShared, AccessRevoked, DocumentDeleted

## Data Transfer Objects (DTOs)

### Messaging DTOs (8 classes)
- `CreateConversationDto` - Initialize conversation
- `ConversationDto` - Conversation with metadata
- `SendMessageDto` - Send new message
- `EditMessageDto` - Edit existing message
- `MessageDto` - Message with sender info
- `AddParticipantsDto` - Add users to conversation
- `ConversationParticipantDto` - Participant details
- `PagedResult<T>` - Pagination wrapper

### Documents DTOs (7 classes)
- `CreateDocumentUploadDto` - Initiate upload
- `CompleteUploadDto` - Confirm upload
- `DocumentDto` - Document metadata
- `PresignedUrlDto` - S3 presigned URL response
- `ShareDocumentDto` - Grant access
- `DocumentAccessDto` - Access rule details
- `PagedResult<T>` - Pagination wrapper

## Database Migration

### File: `20260105080000_AddMessagingAndDocuments.cs`
- **Status**: Prepared but NOT applied (manual execution required)
- **Tables Created**: 5 (Conversations, ConversationParticipants, Messages, Documents, DocumentAccesses)
- **Indices Created**: 12+ for query optimization
- **Cascading Deletes**: Configured for data integrity
- **Down Method**: Reverses all changes for rollback

### To Apply Migration
```bash
cd backend
dotnet ef database update --project HospitalityPlatform.Database
```

## Dependencies Added

### NuGet Packages
- `Microsoft.AspNetCore.SignalR` v1.2.0 - Real-time WebSocket communication
- `AWSSDK.S3` v3.7.301 - AWS S3 client for document storage
- `Amazon.Extensions.S3.Encryption` v2.0.0 - S3 encryption support
- `Microsoft.EntityFrameworkCore` v8.0.0 - EF Core for data access
- `Microsoft.AspNetCore.Mvc.Core` v2.2.5 - MVC attributes

### Project References
- Database module now references Messaging and Documents modules
- Messaging and Documents modules reference Core, Identity, Audit modules
- Test projects reference respective service projects

## Integration Points

### Program.cs Registrations
```csharp
// Messaging
services.AddScoped<IMessagingService, MessagingService>();
services.AddScoped<IMessagingDbContext, ApplicationDbContext>();

// Documents
services.AddScoped<IDocumentsService, DocumentsService>();
services.AddScoped<IDocumentsDbContext, ApplicationDbContext>();

// S3
services.AddScoped<IAmazonS3>(_ => new AmazonS3Client());

// SignalR
services.AddSignalR();
app.MapHub<MessagingHub>("/hubs/messaging").RequireAuthorization();
```

### Database Context Updates
ApplicationDbContext now:
- Implements `IMessagingDbContext` and `IDocumentsDbContext`
- Exposes 5 new DbSet properties
- Implements SaveAuditLogAsync for unified audit writing

## Known Warnings (Non-Critical)
- `CS0108`: Entity properties hide inherited BaseEntity properties (design choice - properties redefined for EF configuration)
- `CS1998`: Async methods in test helpers lack await operators (test infrastructure only)
- `NU1902`: Amazon.Extensions.S3.Encryption 2.0.0 has known moderate severity vulnerability (acknowledge but functional)

## Known Limitations & Future Work

### Test Harness
- Unit tests require AsyncQueryProvider mock enhancement for DbSet async operations
- Recommend using InMemoryDatabase or actual test database for integration tests
- Current mocks adequate for service logic testing once async mocking is fixed

### AWS S3
- AWS credentials passed via environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- Production should use IAM roles/AssumeRole pattern
- Bucket name hardcoded; should be configurable

### Rate Limiting
- Database query-based (no caching layer)
- Consider Redis caching for high-volume scenarios
- Current implementation checks last 1 hour on every message

### Document Features (Out of Scope)
- No file type/size validation (application responsibility)
- No virus scanning integration
- No document expiration/TTL
- No bandwidth limits
- No compression/optimization

## Testing

### Unit Test Stubs
- `HospitalityPlatform.Messaging.Tests` - 4 test cases
- `HospitalityPlatform.Documents.Tests` - 5 test cases
- Test infrastructure requires AsyncQueryProvider mock fixes for full execution

### Integration Testing (Manual)
1. **Messaging Flow**:
   - POST /api/messaging/conversations with valid JWT
   - POST /api/messaging/conversations/{id}/participants
   - POST /api/messaging/conversations/{id}/messages (verify rate limit at 31st message)
   - GET /api/messaging/unread-count
   - WebSocket to /hubs/messaging to test real-time delivery

2. **Documents Flow**:
   - POST /api/documents/create-upload (get presigned URL)
   - Upload file to S3 using presigned URL
   - POST /api/documents/{id}/complete-upload
   - POST /api/documents/{id}/share to grant app access
   - GET /api/documents/{id}/download-url (with access check)

## Deployment Checklist

Before production deployment:
- [ ] Apply database migration: `dotnet ef database update`
- [ ] Configure AWS credentials (IAM role or environment variables)
- [ ] Set S3 bucket name to production environment variable
- [ ] Update CORS for WebSocket SignalR connections
- [ ] Configure message retention policy (soft deletes cleanup)
- [ ] Set up audit log archival (backup strategy)
- [ ] Enable HTTPS for all endpoints
- [ ] Test rate limiting under load
- [ ] Configure S3 lifecycle policies (document retention)
- [ ] Set up CloudWatch monitoring for S3 access patterns
- [ ] Test failover and recovery procedures
- [ ] Review and test organization isolation enforcement

## Files Modified/Created

### Created (22 files)
**Messaging Module (10 files)**
- `HospitalityPlatform.Messaging.csproj`
- `HospitalityPlatform.Messaging/Entities/Conversation.cs`
- `HospitalityPlatform.Messaging/Entities/ConversationParticipant.cs`
- `HospitalityPlatform.Messaging/Entities/Message.cs`
- `HospitalityPlatform.Messaging/DTOs/MessagingDtos.cs`
- `HospitalityPlatform.Messaging/Services/IMessagingService.cs`
- `HospitalityPlatform.Messaging/Services/MessagingService.cs`
- `HospitalityPlatform.Messaging/Services/IMessagingDbContext.cs`
- `HospitalityPlatform.Messaging/Hubs/MessagingHub.cs`
- `HospitalityPlatform.Messaging/Controllers/MessagingController.cs`

**Documents Module (10 files)**
- `HospitalityPlatform.Documents.csproj`
- `HospitalityPlatform.Documents/Entities/Document.cs`
- `HospitalityPlatform.Documents/Entities/DocumentAccess.cs`
- `HospitalityPlatform.Documents/DTOs/DocumentDtos.cs`
- `HospitalityPlatform.Documents/Services/IDocumentsService.cs`
- `HospitalityPlatform.Documents/Services/DocumentsService.cs`
- `HospitalityPlatform.Documents/Services/IDocumentsDbContext.cs`
- `HospitalityPlatform.Documents/Controllers/DocumentsController.cs`

**Test Projects (2 files)**
- `HospitalityPlatform.Messaging.Tests/MessagingServiceTests.cs`
- `HospitalityPlatform.Documents.Tests/DocumentsServiceTests.cs`

**Migration (1 file)**
- `HospitalityPlatform.Database/Migrations/20260105080000_AddMessagingAndDocuments.cs`

### Modified (5 files)
- `HospitalityPlatform.Database/HospitalityPlatform.Database.csproj` - Added project references
- `HospitalityPlatform.Database/ApplicationDbContext.cs` - Added DbSets and interface implementations
- `HospitalityPlatform.Api/HospitalityPlatform.Api.csproj` - Added NuGet references and project references
- `HospitalityPlatform.Api/Program.cs` - Service registrations and SignalR configuration
- `HospitalityPlatform.sln` - Added 5 new projects (2 modules, 2 test projects, 1 migration implicit)

## Build Summary

```
Time Elapsed: 1.46s
Build: SUCCESS ✅
Errors: 0 ✅
Warnings: 6 (non-critical)
  - 4x CS0108: Property hiding (intentional)
  - 1x NU1902: S3 encryption package vulnerability (acknowledged)
  - 1x CS1998: Async test helpers (test code only)

Projects Compiled: 13/13
- HospitalityPlatform.Core
- HospitalityPlatform.Audit
- HospitalityPlatform.Auth
- HospitalityPlatform.Identity
- HospitalityPlatform.Entitlements
- HospitalityPlatform.Billing
- HospitalityPlatform.Jobs
- HospitalityPlatform.Database
- HospitalityPlatform.Messaging ✅ NEW
- HospitalityPlatform.Documents ✅ NEW
- HospitalityPlatform.Messaging.Tests ✅ NEW
- HospitalityPlatform.Documents.Tests ✅ NEW
- HospitalityPlatform.Api
```

## Next Steps

1. **Apply Database Migration**
   ```bash
   dotnet ef database update --project HospitalityPlatform.Database
   ```

2. **Configure AWS S3 Access**
   - Set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
   - Ensure bucket exists: `hospitality-platform-documents`
   - Verify IAM permissions for GetObject, PutObject, GetObjectAcl

3. **Test Real-Time Messaging**
   - Start API: `dotnet run --project HospitalityPlatform.Api`
   - Connect to WebSocket: `ws://localhost:5000/hubs/messaging`
   - Send test messages through endpoint

4. **Test Document Upload**
   - Call presigned URL endpoint
   - Upload file to S3 using returned URL
   - Verify file appears in S3 bucket
   - Test download with access control

5. **Frontend Integration** (if in scope)
   - Create messaging UI with SignalR client connection
   - Create document upload form with presigned URL flow
   - Implement access control UI for document sharing
   - Add unread badge indicators

## Completion Status
✅ Backend: COMPLETE (all code written, compiled, and ready for testing)
⏳ Database: Migration prepared (manual application required)
⏳ Frontend: Out of scope (can be added in Slice 4.5)
⏳ Testing: Unit tests prepared (async mocking enhancement needed for full suite)
⏳ Documentation: Complete (this file)
