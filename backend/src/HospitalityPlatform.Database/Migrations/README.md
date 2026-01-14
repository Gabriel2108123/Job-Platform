# Database Migrations

## Authoritative DbContext

**✅ AUTHORITATIVE:** `HospitalityPlatform.Database.ApplicationDbContext`

This is the single source of truth for all EF Core migrations and database schema management.

## Deprecated DbContext

**❌ DEPRECATED:** `HospitalityPlatform.Identity.Data.ApplicationDbContext`

This class is marked as `[Obsolete]` and exists only to avoid breaking existing migration references. Do not use for new code.

## Migration Commands

All migration commands should use the authoritative DbContext:

```bash
# Create a new migration
dotnet ef migrations add MigrationName --project src/HospitalityPlatform.Database --startup-project src/HospitalityPlatform.Api

# Apply migrations
dotnet ef database update --project src/HospitalityPlatform.Database --startup-project src/HospitalityPlatform.Api

# Remove last migration (if not applied)
dotnet ef migrations remove --project src/HospitalityPlatform.Database --startup-project src/HospitalityPlatform.Api
```

## Architecture

- **DbContext Location:** `HospitalityPlatform.Database/ApplicationDbContext.cs`
- **Migrations Location:** `HospitalityPlatform.Database/Migrations/`
- **Entity Configuration:** Configured via Fluent API in ApplicationDbContext.OnModelCreating()
- **Database Provider:** PostgreSQL (via Npgsql.EntityFrameworkCore.PostgreSQL)

## Best Practices

1. Always use the authoritative DbContext for all database operations
2. Test migrations in development before applying to production
3. Keep entity configurations in ApplicationDbContext.OnModelCreating()
4. Use meaningful migration names that describe the schema change
