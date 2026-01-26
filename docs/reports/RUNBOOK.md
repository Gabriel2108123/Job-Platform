# Operations Runbook

A practical guide for running, debugging, and maintaining the UK Hospitality Platform. Covers common issues, database operations, log inspection, and troubleshooting procedures.

## 📋 Quick Reference

| Issue | Solution |
|-------|----------|
| Backend won't start | [Backend Won't Start](#backend-wont-start) |
| Frontend can't reach API | [API Connection Issues](#api-connection-issues) |
| Database migration fails | [Database Migration Fails](#database-migration-fails) |
| User locked out | [User Account Lockout](#user-account-lockout) |
| Memory leak / slow performance | [Performance Issues](#performance-issues) |
| Email not sending | [Email Service Issues](#email-service-issues) |

---

## 🚀 Common Operations

### Starting Services

#### Using PowerShell Scripts (Recommended)

```powershell
# Start backend and frontend
./scripts/run.ps1

# Start only backend
./scripts/run.ps1 -Backend

# Start only frontend
./scripts/run.ps1 -Frontend

# Development mode (watch + reload)
./scripts/dev.ps1
```

#### Manual Startup

**Terminal 1 - Backend:**
```powershell
cd backend
dotnet run --project src/HospitalityPlatform.Api
# API running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:3000
```

### Stopping Services

- **Backend**: Press `Ctrl+C` in terminal
- **Frontend**: Press `Ctrl+C` in terminal
- **Both**: Press `Ctrl+C` in both terminals

### Database Operations

#### Reset Database (Development Only)

```powershell
./scripts/db-update.ps1 -Reset
```

Or manually:
```bash
cd backend
dotnet ef database drop --force
dotnet ef database update --project src/HospitalityPlatform.Api
```

#### Seed Sample Data

```powershell
./scripts/seed.ps1
```

Creates:
- 3 admin users (admin@platform.com, admin2@platform.com, admin3@platform.com)
- 5 business owners with job postings
- 10 candidate users
- 50+ job applications
- Sample waitlist entries

#### View Database

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d hospitality_platform

# List tables
\dt

# Inspect a table
SELECT * FROM "AspNetUsers" LIMIT 5;
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Symptom**: `dotnet run` fails or hangs at startup

**Diagnosis Steps:**
1. Check .NET SDK version
   ```powershell
   dotnet --version  # Should be 8.x
   ```

2. Check PostgreSQL connection
   ```bash
   psql -h localhost -U postgres -c "SELECT version();"
   ```

3. Verify appsettings.json has valid connection string

4. Check for port conflicts
   ```powershell
   netstat -ano | findstr :5000
   ```

**Solutions:**

| Error | Fix |
|-------|-----|
| "Cannot connect to PostgreSQL" | Ensure PostgreSQL is running (`pg_ctl status`) or check `appsettings.json` credentials |
| "Port 5000 already in use" | Change port in `launchSettings.json` or kill existing process |
| "Database does not exist" | Run: `dotnet ef database update --project src/HospitalityPlatform.Api` |
| "Entity Framework migration pending" | Run migrations: see [Database Migration Fails](#database-migration-fails) |

**Recovery:**
```powershell
# Full clean rebuild
cd backend
dotnet clean
dotnet restore
dotnet build
dotnet run --project src/HospitalityPlatform.Api
```

---

### Frontend Can't Reach API

**Symptom**: Network errors in browser console, "Failed to fetch" messages

**Diagnosis Steps:**

1. **Check both services running**
   ```powershell
   # Should have 2 active terminals
   # Backend: http://localhost:5000
   # Frontend: http://localhost:3000
   ```

2. **Test API directly**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
   # Should return 200 OK or 404 if endpoint doesn't exist
   ```

3. **Check CORS configuration**
   - Open `appsettings.json`
   - Verify `AllowedOrigins` includes `http://localhost:3000`

4. **Inspect browser console**
   - Open DevTools (F12)
   - Check Network tab
   - Look for CORS errors (red CORS policy messages)

5. **Check firewall**
   ```powershell
   # Allow port 5000
   New-NetFirewallRule -DisplayName "Allow ASP.NET Core" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

**Solutions:**

```json
// Fix appsettings.json
{
  "AllowedOrigins": [
    "http://localhost:3000",
    "http://localhost:3001"
  ]
}
```

```javascript
// Fix frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Verify Connection:**
```javascript
// In browser console
fetch('http://localhost:5000/health')
  .then(r => r.text())
  .then(console.log)
  .catch(e => console.error('API Error:', e.message))
```

---

### Database Migration Fails

**Symptom**: Error like "Pending migrations" or "Unable to apply migration"

**Diagnosis Steps:**

1. **Check pending migrations**
   ```bash
   cd backend
   dotnet ef migrations list --project src/HospitalityPlatform.Api
   ```

2. **Review migration status**
   ```bash
   dotnet ef database update --project src/HospitalityPlatform.Api --verbose
   ```

3. **Check PostgreSQL logs**
   ```bash
   tail -f /var/log/postgresql/postgresql.log  # Linux/Mac
   # Windows: Check Event Viewer > Windows Logs > Application
   ```

**Solutions:**

| Error | Fix |
|-------|-----|
| "Cannot use identity column property" | Verify column types in migration match entity definition |
| "Table already exists" | Drop tables: `dotnet ef database drop --force` then update |
| "Foreign key constraint error" | Ensure parent records exist; check migration order |
| "Migration not found" | Regenerate: `dotnet ef migrations add YourMigrationName` |

**Rollback Migration:**
```bash
# Revert to previous migration
dotnet ef database update {previous_migration_name} --project src/HospitalityPlatform.Api

# Or drop entire database
dotnet ef database drop --force
```

**Create New Migration:**
```bash
cd backend
dotnet ef migrations add AddNewFeature --project src/HospitalityPlatform.Api
dotnet ef database update --project src/HospitalityPlatform.Api
```

---

### User Account Lockout

**Symptom**: User cannot login after 5 failed attempts

**Why It Happens:**
- Incorrect password entered 5 times
- System automatically locks account for 15 minutes
- Account lockout is logged for security audit

**Unlock User (Admin Only):**

**Option 1: Via API (if admin)**
```bash
POST /api/admin/users/{userId}/unlock
Authorization: Bearer {admin_token}
```

**Option 2: Direct Database**
```sql
-- Connect to PostgreSQL
UPDATE "AspNetUsers" 
SET "LockoutEnd" = NULL 
WHERE "Email" = 'user@example.com';
```

**Option 3: Wait 15 Minutes**
- Automatic unlock after lockout period expires
- User can attempt login again

**Check Lockout Status:**
```sql
SELECT "Email", "LockoutEnd", "AccessFailedCount" 
FROM "AspNetUsers" 
WHERE "Email" = 'user@example.com';
```

**Prevent Future Lockouts:**
- Increase `MaxFailedAccessAttempts` in `Program.cs`
- Decrease `DefaultLockoutTimeSpan` if too restrictive
- Implement password reset flow for forgotten passwords

---

### Email Service Issues

**Symptom**: Verification emails not received, or SMTP connection errors

**Diagnosis:**

1. **Check email configuration**
   ```json
   {
     "EmailSettings": {
       "SmtpServer": "smtp.sendgrid.net",
       "SmtpPort": 587,
       "FromAddress": "noreply@platform.com",
       "ApiKey": "YOUR_KEY_HERE"
     }
   }
   ```

2. **Verify SMTP credentials**
   ```powershell
   # Test SMTP connection
   $smtp = New-Object System.Net.Mail.SmtpClient("smtp.sendgrid.net", 587)
   $smtp.EnableSsl = $true
   $smtp.Credentials = New-Object System.Net.NetworkCredential("apikey", "YOUR_API_KEY")
   $smtp.Send("from@example.com", "to@example.com", "Test", "Test body")
   ```

3. **Check backend logs**
   ```bash
   # View recent logs
   tail -100 logs/app.log | grep -i "email\|smtp\|mail"
   ```

4. **Verify email bouncing**
   - Check SendGrid dashboard for bounces/complaints
   - Verify sender domain SPF/DKIM records

**Solutions:**

| Issue | Fix |
|-------|-----|
| "Authentication failed" | Verify API key is correct and has email send permissions |
| "Network timeout" | Check firewall allows SMTP port 587; verify SMTP server address |
| "Invalid From address" | Verify sender domain is verified in SendGrid |
| "Rate limited" | Check SendGrid rate limits; wait before retrying |

**Resend Verification Email:**
```bash
POST /api/auth/resend-verification
Body: { "email": "user@example.com" }
```

---

### Performance Issues

**Symptom**: Slow API responses, high memory usage, or CPU spikes

**Diagnosis:**

1. **Check API response times**
   ```powershell
   # Test endpoint performance
   Measure-Command {
     Invoke-RestMethod -Uri "http://localhost:5000/api/jobs" -Method GET
   }
   ```

2. **Monitor memory usage**
   ```powershell
   Get-Process -Name dotnet | Select-Object ProcessName, WorkingSet, Handles
   ```

3. **View database query performance**
   ```bash
   # Enable query logging in appsettings.json
   "LogLevel": {
     "Microsoft.EntityFrameworkCore.Database.Command": "Information"
   }
   ```

4. **Inspect slow queries**
   ```sql
   -- PostgreSQL slow query log
   SELECT query, calls, mean_exec_time, max_exec_time 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 10;
   ```

**Solutions:**

| Issue | Fix |
|-------|-----|
| Memory leak | Restart backend service; check for circular references in code |
| Slow database queries | Add indexes on frequently filtered columns; optimize LINQ queries |
| High CPU | Profile with debugger; look for inefficient loops or blocking operations |
| Too many database connections | Increase connection pool size; check for connection leaks |

**Optimization Checklist:**
- [ ] Queries use `.Select()` to fetch only needed columns
- [ ] Frequently accessed data cached in Redis
- [ ] Database indexes on foreign keys and filters
- [ ] Async/await used throughout (no blocking calls)
- [ ] Pagination implemented for large result sets

---

### Rate Limiting / Throttling Issues

**Symptom**: Getting "429 Too Many Requests" errors unexpectedly

**Check Rate Limit Status:**
```bash
# View rate limit headers in response
curl -v http://localhost:5000/api/endpoint 2>&1 | grep -i "x-ratelimit"
```

**Diagnosis:**
1. Check how many requests made in last minute
2. Verify request source IP (shared IP = shared limit)
3. Review rate limit config in `appsettings.json`

**Solutions:**

| Issue | Fix |
|-------|-----|
| Exceeding request limit | Wait 1 minute; spread requests over time |
| Multiple clients on same IP | Use load balancer IP forwarding; whitelist IPs |
| Development rate limits too strict | Increase limits in `appsettings.Development.json` |
| Admin needs bypass | Add IP to whitelist in rate limit middleware |

**Whitelist IP (Admin):**
```json
{
  "RateLimiting": {
    "WhitelistedIps": ["192.168.1.100", "10.0.0.0/8"]
  }
}
```

---

## 📊 Monitoring & Logs

### View Application Logs

**Backend Logs:**
```bash
# Real-time log streaming
tail -f logs/application.log

# Filter for errors
grep "ERROR\|FATAL" logs/application.log

# Last 50 log entries
tail -50 logs/application.log

# Search for specific user
grep "user@example.com" logs/application.log | tail -20
```

**Frontend Console Errors:**
- Open browser DevTools (F12)
- Console tab shows all JavaScript errors
- Network tab shows failed API requests
- Storage tab shows local/session storage

### Audit Trail

**View User Activity:**
```bash
# Login history for user
SELECT * FROM "AuditLogs" 
WHERE "UserId" = 'user-id' 
AND "Action" = 'Login' 
ORDER BY "Timestamp" DESC 
LIMIT 20;
```

**View Failed Logins (Last 24 Hours):**
```bash
SELECT "UserId", "IpAddress", "Timestamp", "Reason"
FROM "AuditLogs"
WHERE "Action" = 'Login' 
AND "Status" = 'Failure'
AND "Timestamp" > NOW() - INTERVAL '24 hours'
ORDER BY "Timestamp" DESC;
```

**View Admin Actions:**
```bash
SELECT * FROM "AuditLogs"
WHERE "Action" IN ('Delete', 'Update')
AND "Timestamp" > NOW() - INTERVAL '7 days'
ORDER BY "Timestamp" DESC;
```

---

## 🔄 Backup & Recovery

### Database Backup

```bash
# Full database backup
pg_dump hospitality_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
pg_dump hospitality_platform | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Database Restore

```bash
# Restore from backup
psql -U postgres -d hospitality_platform < backup_20260107_120000.sql

# Or from compressed backup
gunzip < backup_20260107_120000.sql.gz | psql -U postgres -d hospitality_platform
```

### Backup Schedule

- **Development**: Manual as needed
- **Staging**: Daily automated backups
- **Production**: Hourly automated backups (RTO: 1 hour)

---

## 📞 Escalation

### When to Contact Developers

| Issue | Contact |
|-------|---------|
| Unfamiliar error message | Check RUNBOOK.md, then contact backend team |
| Data corruption | Stop services immediately; contact lead developer |
| Security breach | See [SECURITY.md](./SECURITY.md#reporting-security-issues) |
| Unknown database state | Restore from backup; investigate root cause |

### Getting Help

1. **Search existing docs**: README.md, SECURITY.md, ARCHITECTURE.md
2. **Check logs**: Application and audit logs often explain issues
3. **Search GitHub Issues**: May already be documented
4. **Ask in team chat**: Provide error message, steps to reproduce, environment

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`dotnet test`)
- [ ] No pending migrations (`dotnet ef migrations list`)
- [ ] Database backed up
- [ ] Appsettings configured (JWT secret, SMTP, origins)
- [ ] Environment variables set (secrets vault)
- [ ] Frontend built successfully (`npm run build`)
- [ ] Smoke tests pass (login, job posting, application)
- [ ] Audit logging enabled
- [ ] Rate limiting configured appropriately
- [ ] SSL certificate valid
- [ ] Backups scheduled and tested
- [ ] Monitoring/alerting configured
- [ ] Runbook distributed to support team

---

**Last Updated**: January 2026  
**Audience**: DevOps, System Administrators, Support Engineers  
**Update Frequency**: As new issues are discovered
