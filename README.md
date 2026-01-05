# UK Hospitality Platform - Monorepo

A modern, scalable SaaS platform for UK hospitality hiring built as a monorepo with ASP.NET Core Web API backend and Next.js frontend.

## 🏗️ Architecture

This is a **modular monolith** architecture with clear boundaries between modules:

### Backend Structure (ASP.NET Core .NET 8)
```
backend/
├── src/
│   ├── HospitalityPlatform.Api/          # Web API entry point
│   ├── HospitalityPlatform.Core/         # Shared kernel (entities, enums, interfaces)
│   ├── HospitalityPlatform.Identity/     # Users, roles, organizations, tenancy
│   ├── HospitalityPlatform.Auth/         # Authentication & authorization policies
│   └── HospitalityPlatform.Audit/        # Audit logging infrastructure
└── tests/                                 # Test projects
```

### Frontend Structure (Next.js + TypeScript + Tailwind)
```
frontend/
├── app/                    # Next.js app router pages
├── components/
│   ├── auth/              # Authentication components
│   └── layout/            # Layout components (Header, Footer)
├── lib/
│   ├── api/               # API client and auth services
│   └── types/             # TypeScript type definitions
└── public/                # Static assets
```

## 🔑 Key Features

### Authentication & Authorization
- **JWT-based authentication** with ASP.NET Core Identity
- **Role-based access control** with 5 user roles:
  - `Candidate` - Job seekers
  - `BusinessOwner` - Employers/hiring managers
  - `Staff` - Regular employees
  - `Admin` - System administrators
  - `Support` - Customer support team
- **Policy-based authorization** with custom requirements and handlers
- **Organization tenancy** for multi-tenant support

### Security
- Secure password requirements (8+ chars, uppercase, lowercase, digits, special chars)
- Account lockout after 5 failed attempts (15-minute timeout)
- JWT token-based authentication with configurable expiry
- CORS configuration for frontend integration

### Database
- **PostgreSQL** with Entity Framework Core
- Identity schema with custom user and role entities
- Organization entities for multi-tenancy
- Audit logging schema
- Initial migration created and ready to apply

### Audit Logging
- Infrastructure for tracking all entity changes
- Captures user actions, IP addresses, and timestamps
- Organization-scoped audit trails

## 🚀 Getting Started

### Prerequisites
- **.NET 8 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)

### Backend Setup

1. **Configure the database connection:**
   
   Edit `backend/src/HospitalityPlatform.Api/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=hospitality_platform;Username=postgres;Password=YOUR_PASSWORD"
     }
   }
   ```

2. **Apply database migrations:**
   ```bash
   cd backend/src/HospitalityPlatform.Api
   dotnet ef database update --project ../HospitalityPlatform.Identity/HospitalityPlatform.Identity.csproj
   ```

3. **Run the backend:**
   ```bash
   cd backend
   dotnet run --project src/HospitalityPlatform.Api/HospitalityPlatform.Api.csproj
   ```
   
   The API will be available at `https://localhost:5001` (or `http://localhost:5000`)

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables:**
   
   Create `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## 🔧 Development

### Backend Commands

```bash
# Build the solution
cd backend
dotnet build

# Run tests (when available)
dotnet test

# Create a new migration
cd backend/src/HospitalityPlatform.Api
dotnet ef migrations add MigrationName --project ../HospitalityPlatform.Identity/HospitalityPlatform.Identity.csproj

# Apply migrations
dotnet ef database update --project ../HospitalityPlatform.Identity/HospitalityPlatform.Identity.csproj
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Public health check endpoint
- `GET /api/health` - Health check with response details
- `GET /api/health/secure` - Authenticated health check

### Authentication (To be implemented)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

## 🎯 User Roles & Permissions

### Role Hierarchy
1. **Admin** - Full system access
2. **Support** - Customer support and limited admin functions
3. **BusinessOwner** - Manage job postings and candidates within their organization
4. **Staff** - Limited access within their organization
5. **Candidate** - Job seeker with profile management

### Policy Names
- `RequireCandidate` - Requires Candidate role
- `RequireBusinessOwner` - Requires BusinessOwner role
- `RequireStaff` - Requires Staff role
- `RequireAdmin` - Requires Admin role
- `RequireSupport` - Requires Support role
- `RequireOrganizationAccess` - Requires organization association

## 🏢 Multi-Tenancy

The platform supports organization-based multi-tenancy:
- Each user can belong to one organization
- Data is isolated by organization ID
- BusinessOwners manage their own organization
- Admin and Support can access across organizations

## 🔐 Security Configuration

### JWT Settings (appsettings.json)
```json
{
  "JwtSettings": {
    "SecretKey": "CHANGE_THIS_IN_PRODUCTION",
    "Issuer": "HospitalityPlatform",
    "Audience": "HospitalityPlatformUsers",
    "ExpiryInMinutes": 60
  }
}
```

⚠️ **Important:** Change the `SecretKey` in production to a secure random string.

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

## 📚 Technology Stack

### Backend
- **Framework:** ASP.NET Core 8.0
- **Database:** PostgreSQL with Entity Framework Core 8.0
- **Authentication:** ASP.NET Core Identity + JWT Bearer
- **ORM:** Entity Framework Core 8.0
- **Database Provider:** Npgsql.EntityFrameworkCore.PostgreSQL 8.0

### Frontend
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI:** React 19

## 🧪 Testing

*Test infrastructure to be added*

## 📝 License

*To be determined*

## 👥 Contributing

*Contributing guidelines to be added*

## 🆘 Support

For issues and questions, please contact the development team.