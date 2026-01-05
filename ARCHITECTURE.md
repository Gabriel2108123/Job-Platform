# Architecture Documentation

## Overview

The UK Hospitality Platform is built as a **modular monolith** - a single deployable unit with clear internal boundaries between modules. This approach provides the development simplicity of a monolith while maintaining the modularity needed for future scalability.

## Design Principles

1. **Modular Boundaries** - Clear separation between modules with well-defined interfaces
2. **Domain-Driven Design** - Each module represents a bounded context
3. **Single Responsibility** - Each module has a single, well-defined purpose
4. **Dependency Rule** - Dependencies flow from outer layers to inner layers
5. **Testability** - Each module can be tested independently

## Backend Architecture

### Module Breakdown

#### 1. Core Module (Shared Kernel)
**Purpose:** Shared entities, enums, and interfaces used across all modules

**Key Components:**
- `BaseEntity` - Base class for all domain entities with audit fields
- `TenantEntity` - Base class for tenant-scoped entities
- `UserRole` enum - System-wide role definitions
- Common interfaces and value objects

**Dependencies:** None

#### 2. Identity Module
**Purpose:** User management, roles, and organization tenancy

**Key Components:**
- `ApplicationUser` - Extended IdentityUser with organization association
- `ApplicationRole` - Extended IdentityRole with custom properties
- `Organization` - Multi-tenant organization entity
- `ApplicationDbContext` - Database context with Identity integration

**Key Features:**
- Multi-tenant organization support
- User-to-organization mapping
- Custom Identity schema
- PostgreSQL integration via Entity Framework Core

**Dependencies:** Core

#### 3. Auth Module
**Purpose:** Authentication and policy-based authorization

**Key Components:**
- `PolicyNames` - Centralized policy name constants
- `RoleRequirement` - Custom authorization requirement for roles
- `OrganizationRequirement` - Custom requirement for organization access
- `RoleRequirementHandler` - Handler for role-based authorization
- `OrganizationRequirementHandler` - Handler for organization-based authorization

**Key Features:**
- JWT-based authentication
- Policy-based authorization
- Custom authorization handlers
- Role-based access control
- Organization-based access control

**Dependencies:** Core

#### 4. Audit Module
**Purpose:** Audit logging infrastructure

**Key Components:**
- `AuditLog` - Entity for storing audit trail
- `IAuditService` - Service interface for audit logging

**Key Features:**
- Change tracking
- User action logging
- IP address and user agent capture
- Organization-scoped audit trails

**Dependencies:** Core

#### 5. Api Module
**Purpose:** Web API entry point and configuration

**Key Components:**
- `Program.cs` - Application startup and configuration
- Controllers for endpoints
- Swagger/OpenAPI configuration
- CORS configuration

**Key Features:**
- RESTful API endpoints
- JWT authentication middleware
- Authorization policies configuration
- Swagger documentation
- CORS support for frontend

**Dependencies:** Core, Identity, Auth, Audit

### Data Flow

```
Client Request
    ↓
[API Layer] - Controllers, Middleware
    ↓
[Auth Layer] - Authentication, Authorization
    ↓
[Business Logic] - Services (future)
    ↓
[Data Access] - EF Core, Repositories (future)
    ↓
PostgreSQL Database
```

### Security Layers

1. **Transport Security** - HTTPS
2. **Authentication** - JWT Bearer tokens
3. **Authorization** - Policy-based with custom requirements
4. **Data Security** - Organization-based isolation
5. **Audit Trail** - All changes logged

## Frontend Architecture

### Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── api/             # API client
│   └── types/           # TypeScript definitions
└── public/              # Static assets
```

### Key Patterns

1. **Component-Based Architecture** - Reusable React components
2. **Type Safety** - TypeScript throughout
3. **API Abstraction** - Centralized API client
4. **Server Components** - Next.js 13+ App Router with server components
5. **Responsive Design** - Tailwind CSS for mobile-first design

### Authentication Flow

```
User Login
    ↓
[Frontend] - Collect credentials
    ↓
[API Client] - POST /api/auth/login
    ↓
[Backend] - Validate & generate JWT
    ↓
[Frontend] - Store token in localStorage
    ↓
[Subsequent Requests] - Include Bearer token in headers
```

## Database Schema

### Identity Tables
- `Users` - Application users with organization association
- `Roles` - User roles (Admin, Support, BusinessOwner, Staff, Candidate)
- `UserRoles` - Many-to-many mapping
- `UserClaims` - Custom claims
- `UserLogins` - External login providers
- `UserTokens` - Authentication tokens
- `RoleClaims` - Role-based claims

### Business Tables
- `Organizations` - Multi-tenant organizations

### Audit Tables
- `AuditLogs` - Audit trail (to be implemented in DbContext)

## Multi-Tenancy Strategy

### Organization-Based Tenancy

1. **Data Isolation:**
   - Each user belongs to one organization
   - Most entities have `OrganizationId` foreign key
   - Queries automatically filtered by organization

2. **Access Control:**
   - BusinessOwners manage their organization
   - Staff have limited access within organization
   - Admin/Support can access across organizations

3. **Authorization Pattern:**
   ```csharp
   [Authorize(Policy = PolicyNames.RequireOrganizationAccess)]
   ```

## Scalability Considerations

### Current State (Modular Monolith)
- Single deployment unit
- Shared database
- Vertical scaling

### Future Evolution Options
1. **Microservices** - Extract modules into separate services if needed
2. **CQRS** - Separate read/write models for performance
3. **Event Sourcing** - Audit trail becomes first-class
4. **Service Mesh** - If moving to microservices

## Deployment Architecture

### Current (Monolith)
```
[Load Balancer]
    ↓
[API Server(s)]
    ↓
[PostgreSQL Database]

[CDN] → [Frontend (Next.js)]
```

### Future (Microservices - if needed)
```
[API Gateway]
    ↓
├─ [Identity Service]
├─ [Auth Service]
├─ [Business Logic Service(s)]
└─ [Audit Service]
    ↓
[PostgreSQL Cluster]
```

## Security Architecture

### Authentication
- JWT tokens with configurable expiry
- Refresh token support (to be implemented)
- Password hashing via ASP.NET Core Identity
- Account lockout protection

### Authorization
- Policy-based authorization
- Custom authorization handlers
- Role-based access control
- Organization-based access control

### Data Protection
- Organization-based data isolation
- Audit logging for compliance
- HTTPS enforcement
- CORS configuration

### Future Enhancements
- OAuth2/OpenID Connect integration
- Two-factor authentication
- Rate limiting
- API key management
- Field-level encryption

## Development Guidelines

### Module Independence
- Each module should be independently testable
- Minimize cross-module dependencies
- Use interfaces for module communication
- Avoid circular dependencies

### Code Organization
```
Module/
├── Entities/          # Domain entities
├── Services/          # Business logic
├── Interfaces/        # Contracts
├── Data/             # Data access
└── Handlers/         # Authorization handlers (if applicable)
```

### Testing Strategy (Future)
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Mock external dependencies

## Monitoring & Observability (Future)

### Logging
- Structured logging with Serilog (to be added)
- Log levels: Debug, Info, Warning, Error, Fatal
- Request/response logging

### Metrics
- Performance metrics (to be added)
- Business metrics (to be added)
- Health checks (implemented)

### Tracing
- Distributed tracing (future consideration)
- Request correlation IDs

## Technology Decisions

### Why PostgreSQL?
- Open source and cost-effective
- Excellent JSON support for flexible data
- Strong ACID compliance
- Great performance for read-heavy workloads
- Popular in modern web applications

### Why ASP.NET Core?
- High performance
- Cross-platform
- Built-in dependency injection
- Excellent tooling
- Strong type system with C#
- Native authentication/authorization support

### Why Next.js?
- React framework with great DX
- Server-side rendering for SEO
- File-based routing
- Built-in optimization
- Excellent TypeScript support

### Why JWT?
- Stateless authentication
- Works well with microservices (future)
- Mobile-friendly
- Industry standard

## Conclusion

This modular monolith architecture provides:
- ✅ Clear boundaries between concerns
- ✅ Easy to develop and deploy initially
- ✅ Can evolve to microservices if needed
- ✅ Strong security foundations
- ✅ Multi-tenant support
- ✅ Audit trail capabilities

The architecture balances immediate simplicity with future scalability needs.
