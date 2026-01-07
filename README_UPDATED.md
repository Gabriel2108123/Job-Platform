# UK Hospitality Platform - Monorepo

A modern, scalable SaaS platform for UK hospitality hiring built as a monorepo with ASP.NET Core Web API backend and Next.js frontend.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Setup & Environment](#setup--environment)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🚀 Quick Start

### Prerequisites

- **Backend**: .NET 8 SDK, PostgreSQL 14+
- **Frontend**: Node.js 18+, npm or yarn
- **Tools**: Git, VS Code or Visual Studio 2022

### Clone & Initial Setup

```bash
git clone https://github.com/yourusername/Job-Platform.git
cd Job-Platform
```

### Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies (NuGet packages auto-restored)
dotnet restore

# Set environment variables (see .env.example or Environment Setup section)
# Configure appsettings.json

# Run database migrations
dotnet ef database update --project src/HospitalityPlatform.Api

# Run the API
dotnet run --project src/HospitalityPlatform.Api
```

The API will be available at `http://localhost:5000` (or port specified in appsettings).

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set environment variables (see .env.local.example)
# Create .env.local file

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
Job-Platform/
├── backend/                          # ASP.NET Core Web API
│   ├── src/
│   │   ├── HospitalityPlatform.Api/           # API entry point, controllers
│   │   ├── HospitalityPlatform.Core/          # Shared kernel, base entities
│   │   ├── HospitalityPlatform.Identity/      # Users, roles, organizations
│   │   ├── HospitalityPlatform.Auth/          # Authentication & policies
│   │   ├── HospitalityPlatform.Audit/         # Audit logging
│   │   ├── HospitalityPlatform.Billing/       # Billing & subscriptions
│   │   ├── HospitalityPlatform.Database/      # EF Core DbContext
│   │   ├── HospitalityPlatform.Jobs/          # Job postings & applications
│   │   ├── HospitalityPlatform.Messaging/     # Real-time messaging
│   │   ├── HospitalityPlatform.Entitlements/  # Feature entitlements
│   │   ├── HospitalityPlatform.Documents/     # Document handling
│   │   └── HospitalityPlatform.Waitlist/      # Waitlist management
│   └── tests/                        # Integration & unit tests
├── frontend/                         # Next.js App
│   ├── app/                          # App router pages & layouts
│   ├── components/                   # React components
│   │   ├── ui/                       # Reusable UI components
│   │   ├── billing/                  # Billing components
│   │   ├── layout/                   # Header, footer, sidebar
│   │   └── auth/                     # Auth forms
│   ├── lib/                          # Utilities & API client
│   └── public/                       # Static assets
├── scripts/                          # PowerShell utility scripts
├── ARCHITECTURE.md                   # System design & diagrams
├── SECURITY.md                       # Security policy & controls
├── RUNBOOK.md                        # Troubleshooting & operations
└── README.md                         # This file
```

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                      │
│                  (React, TypeScript, Tailwind)               │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS / JWT
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   ASP.NET Core Web API                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           Modular Monolith Architecture                │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ - Identity & Auth (JWT, Roles, Policies)              │ │
│  │ - Jobs & Applications                                  │ │
│  │ - Billing & Subscriptions                              │ │
│  │ - Messaging & Notifications                            │ │
│  │ - Audit Logging                                        │ │
│  │ - Entitlements & Feature Gating                         │ │
│  │ - Document Management                                  │ │
│  │ - Waitlist Management                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   PostgreSQL    Redis Cache   File Storage
   (Data)        (Sessions)     (AWS S3)
```

### Key Design Principles

1. **Modular Monolith**: Clear module boundaries with dependency injection
2. **JWT Authentication**: Stateless, scalable auth with token-based access
3. **Role-Based Access Control (RBAC)**: 5 user roles with granular permissions
4. **Audit Logging**: All critical actions logged with user context
5. **Data Minimization**: No PII beyond necessary contact/employment info
6. **Rate Limiting**: Request throttling to prevent abuse
7. **Email Verification**: Required before job applications
8. **Feature Entitlements**: Subscription-based feature access

---

## 🔧 Setup & Environment

### Environment Variables

#### Backend (`appsettings.json` or environment variables)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hospitality_platform;Username=postgres;Password=YOUR_PASSWORD"
  },
  "JwtSettings": {
    "SecretKey": "YOUR_SECRET_KEY_HERE_MUST_BE_32_CHARS_OR_MORE",
    "Issuer": "HospitalityPlatform",
    "Audience": "HospitalityPlatformUsers",
    "ExpiryInMinutes": 60
  },
  "EmailSettings": {
    "SmtpServer": "smtp.sendgrid.net",
    "SmtpPort": 587,
    "FromAddress": "noreply@platform.hospitality.uk",
    "ApiKey": "YOUR_SENDGRID_API_KEY"
  },
  "RateLimiting": {
    "EnabledPerIp": true,
    "RequestsPerMinute": 60
  },
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://yoursite.com"
  ],
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

#### Frontend (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Hospitality Platform
```

### Database Setup

#### Initial Migration

```bash
cd backend
dotnet ef database update --project src/HospitalityPlatform.Api
```

Or use the included PowerShell script:

```powershell
./scripts/db-update.ps1
```

#### Reset Database (Development Only)

```bash
cd backend
dotnet ef database drop --force
dotnet ef database update --project src/HospitalityPlatform.Api
```

#### Seed Sample Data (Optional)

```powershell
./scripts/seed.ps1
```

---

## 💻 Development Workflow

### Running Both Services

Use the provided PowerShell scripts or manual commands:

#### Option 1: PowerShell Scripts (Recommended)

```powershell
# Terminal 1: Backend
./scripts/run.ps1 -Backend

# Terminal 2: Frontend
./scripts/run.ps1 -Frontend

# Or both in watch/dev mode
./scripts/dev.ps1
```

#### Option 2: Manual Commands

```powershell
# Terminal 1: Backend
cd backend
dotnet run --project src/HospitalityPlatform.Api

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Code Style & Linting

**Backend:**
- Follow C# naming conventions (PascalCase classes, camelCase fields)
- Use async/await patterns throughout
- Keep methods focused and under 20 lines
- Add XML documentation for public APIs

**Frontend:**
- Use TypeScript for all files
- Follow ESLint rules (run `npm run lint`)
- Use functional components with hooks
- Co-locate styles with components

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit with clear messages
git commit -m "feat: add authentication modal"

# Push and create pull request
git push origin feature/your-feature-name
```

---

## 🧪 Testing

### Backend Testing

Run all tests:
```bash
dotnet test
```

Run specific test project:
```bash
dotnet test src/HospitalityPlatform.Api.Tests/
```

Run with coverage:
```bash
dotnet test /p:CollectCoverageMetrics=true
```

### Frontend Testing

```bash
# Run ESLint
npm run lint

# Unit tests (when available)
npm run test

# Build check
npm run build
```

### Test Coverage

Current coverage includes:

| Module | Tests | Coverage |
|--------|-------|----------|
| Authentication | Admin service, policy handlers | 85%+ |
| Billing | Invoice generation, subscription logic | 80%+ |
| Messaging | Rate limiting, unlock gates | 75%+ |
| Waitlist | Duplicate email detection, rate limiting | 90%+ |

See [Integration Tests](./TESTING.md) for detailed test specifications.

---

## 📦 Deployment

### Backend Deployment

1. **Build Release**
   ```bash
   dotnet build -c Release
   ```

2. **Publish**
   ```bash
   dotnet publish -c Release -o ./publish
   ```

3. **Deploy to Server**
   - Copy `publish` folder to production server
   - Configure `appsettings.Production.json`
   - Run migrations: `dotnet HospitalityPlatform.Api.dll`

### Frontend Deployment

1. **Build**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify/Static Host**
   - Push to main branch (auto-deploy)
   - Or manually upload `./out` directory

### Environment-Specific Configs

- **Development**: `appsettings.Development.json`, `.env.local`
- **Staging**: `appsettings.Staging.json`, deploy to staging server
- **Production**: `appsettings.Production.json`, secrets via env vars

---

## 🤝 Contributing

### Before Starting

1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for module ownership
2. Review existing code patterns
3. Run tests locally before submitting PR

### Pull Request Process

1. Create feature branch from `develop`
2. Make atomic, well-documented commits
3. Ensure all tests pass
4. Request review from 2+ team members
5. Address feedback and squash commits
6. Merge to `develop`

### Reporting Issues

Use GitHub Issues with:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, versions)

---

## 📚 Additional Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, module interactions
- **[SECURITY.md](./SECURITY.md)** - Security policies, compliance measures
- **[RUNBOOK.md](./RUNBOOK.md)** - Operations, troubleshooting, common tasks
- **[ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md)** - RBAC structure
- **[API Documentation](./backend/src/HospitalityPlatform.Api)** - Swagger/OpenAPI endpoints

---

## ❓ FAQ

**Q: How do I reset my local database?**
```bash
./scripts/db-update.ps1 -Reset
```

**Q: The frontend can't reach the backend. What do I do?**
See [RUNBOOK.md](./RUNBOOK.md#api-connection-issues) for troubleshooting.

**Q: Can I use SQLite instead of PostgreSQL locally?**
Yes, modify `appsettings.json` to use SQLite and adjust `Program.cs` accordingly.

**Q: How are users verified?**
See [SECURITY.md](./SECURITY.md#email-verification) for email verification flow.

---

## 📄 License

[Your License Here]

## Contact

For questions, contact the development team or open an issue on GitHub.

---

**Last Updated**: January 2026  
**Maintainers**: Development Team  
**Status**: Active Development (Step 9 - Documentation & Testing)
