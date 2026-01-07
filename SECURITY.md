# Security Policy & Data Protection

This document outlines the security measures, data handling practices, and compliance controls implemented in the UK Hospitality Platform.

## 📋 Table of Contents

- [Data Minimization Policy](#data-minimization-policy)
- [Authentication & Authorization](#authentication--authorization)
- [Email Verification](#email-verification)
- [Rate Limiting](#rate-limiting)
- [Audit Logging](#audit-logging)
- [Secure Coding Practices](#secure-coding-practices)
- [Reporting Security Issues](#reporting-security-issues)

---

## 🔐 Data Minimization Policy

### Principle

We collect **only the minimum data necessary** to provide platform services. We explicitly do **NOT** collect, store, or process:

- ❌ **Passport information**
- ❌ **Visa documentation** or visa status
- ❌ **Right to Work (RTW) documents**
- ❌ **Full immigration details**
- ❌ **Sensitive biographical data** (NHS numbers, tax IDs)

### Collected Data

**User Account Data:**
- Name (first and last)
- Email address (verified)
- Hashed password
- Phone number (optional)
- Profile location (city/region only)

**Professional Data:**
- Job title/profession
- Industry sector
- Years of experience (optional)
- Skills (user-provided tags)

**Employment Data:**
- Current employer (optional)
- Employment type (full-time, part-time, contract)
- Availability to start

**Application Data:**
- Job applications submitted
- Cover letter/application text (user-provided)
- Timestamps of actions

**Billing Data:**
- Subscription tier
- Payment method (last 4 digits, no full numbers)
- Invoice history

### Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Active User Profile | While account active | Service delivery |
| Application History | 3 years | Legal/dispute resolution |
| Invoice Records | 7 years | Tax compliance (UK) |
| Audit Logs | 2 years | Security investigation |
| Failed Login Attempts | 15 minutes | Rate limiting |
| Deleted Account Data | 30 days | Account recovery option |

### GDPR Compliance

- **Data Subject Rights**: Users can export, update, or delete their data via account settings
- **Right to be Forgotten**: Data deletion after 30-day grace period
- **Data Processing Agreements**: Available upon request for enterprise customers
- **Data Transfer**: No international transfers outside UK/EU

---

## 🔑 Authentication & Authorization

### JWT Token Authentication

**Implementation:**
- Tokens issued upon successful login
- Claims include: `userId`, `role`, `organizationId`, `email`
- 60-minute expiry (configurable)
- Refresh tokens for extended sessions

**Security Features:**
- HS256 algorithm with 256-bit secret key
- Tokens signed server-side, cannot be forged client-side
- JWT secret stored in environment variables (never in code)

### Password Security

**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character (!@#$%^&*)

**Hashing:**
- ASP.NET Core Identity uses PBKDF2 with 10,000 iterations
- Salted hashes, per-user salt generation
- No plaintext passwords stored anywhere

**Account Lockout:**
- 5 failed login attempts triggers lockout
- 15-minute lockout period
- Admin can manually unlock accounts

### Role-Based Access Control (RBAC)

**5 User Roles:**

| Role | Capabilities | Data Access |
|------|--------------|-------------|
| **Candidate** | Apply for jobs, manage profile, view job descriptions | Own profile, own applications |
| **BusinessOwner** | Post jobs, review applications, manage team, billing | Own job postings, applicant data, team |
| **Staff** | Limited role (internal use) | Assigned jobs/applications |
| **Admin** | Full platform access, user management, billing oversight | All user data, audit logs |
| **Support** | Assist users, limited data access, no deletion rights | Limited user/application data |

**Authorization Policies:**
- Policy-based via custom `AuthorizationHandler`
- Requirement handlers verify claims at endpoint
- Resource-level authorization (only own data accessible)

**Example Policy:**
```csharp
// Only Candidates can view their own applications
protected override Task HandleRequirementAsync(
    AuthorizationHandlerContext context,
    ViewApplicationRequirement requirement)
{
    var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var applicationOwnerId = context.Resource as string;
    
    if (userId == applicationOwnerId)
        context.Succeed(requirement);
    
    return Task.CompletedTask;
}
```

---

## ✉️ Email Verification

### Flow

1. **Registration**
   - User enters email address
   - Verification email sent (6-hour validity)
   - Email contains unique verification token

2. **Verification Link Click**
   - Token validated server-side
   - Email marked as verified in database
   - User session created

3. **Gated Features**
   - **Job Applications**: Require verified email (prevents spam)
   - **Messaging**: Require verified email + subscription
   - **Email Notifications**: Only sent to verified addresses

### Implementation

**Token Generation:**
```csharp
var verificationToken = new EmailVerificationToken
{
    UserId = user.Id,
    Token = _tokenGenerator.GenerateRandomToken(32),
    ExpiresAt = DateTime.UtcNow.AddHours(6),
    CreatedAt = DateTime.UtcNow
};
```

**Verification Gate:**
```csharp
[Authorize]
[HttpPost("apply")]
public async Task<IActionResult> ApplyForJob(string jobId)
{
    var user = await _userManager.GetUserAsync(User);
    
    // Check email verification status
    if (!user.EmailConfirmed)
        return BadRequest("Please verify your email before applying.");
    
    // Proceed with application...
}
```

### Email Best Practices

- Verification tokens are single-use
- Tokens are cryptographically random (not predictable)
- Failed verification attempts logged for audit
- No token reuse across multiple verification steps

---

## 🚦 Rate Limiting

### Implementation

**Per-IP Rate Limiting:**
- 60 requests per minute (default)
- Applied globally to all endpoints
- Distributed via Redis cache (production)
- In-memory fallback (development)

**Endpoint-Specific Limits:**

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| POST `/login` | 5 attempts / 15 min | Prevent brute force |
| POST `/register` | 3 per hour per IP | Prevent spam registration |
| POST `/apply` | 10 per hour per user | Prevent application spam |
| POST `/export` | 1 per day per user | Prevent data harvesting |
| POST `/contact` | 5 per day per IP | Prevent contact spam |

**Redis-Backed Rate Limiting:**
```csharp
public class RateLimitMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        var key = $"ratelimit:{context.Connection.RemoteIpAddress}:{context.Request.Path}";
        var count = await _cache.GetAsync<int>(key);
        
        if (count >= _options.RequestsPerMinute)
        {
            context.Response.StatusCode = 429; // Too Many Requests
            await context.Response.WriteAsync("Rate limit exceeded. Try again in 1 minute.");
            return;
        }
        
        await _cache.IncrementAsync(key, TimeSpan.FromMinutes(1));
        await next(context);
    }
}
```

**User-Based Rate Limiting:**
- Waitlist joins: 1 per user (prevents duplicates)
- Job applications: 50 per day per user
- Email sends: 100 per day per user

### Bypass Rules

- Admins not rate-limited (authorization-based bypass)
- Whitelisted IPs (office networks, CI/CD) can be exempted via config

---

## 📝 Audit Logging

### Logged Events

**Security Events:**
- User login (success/failure)
- Failed password attempts
- Account lockouts
- Authorization failures
- Role/permission changes

**Data Modification Events:**
- User profile updates
- Job posting creation/deletion
- Job application submission
- Job application status change
- Billing changes (subscription, payment)
- Email verification completion

**Admin Actions:**
- User account deletion
- Role assignments
- Feature flag changes
- System configuration changes

**Suspicious Activity:**
- Rate limit violations
- Multiple failed logins
- Unusual data access patterns
- Account lockouts

### Log Entry Structure

```csharp
public class AuditLog
{
    public int Id { get; set; }
    public string UserId { get; set; }           // Actor
    public string EntityType { get; set; }       // Job, Application, User, etc.
    public string EntityId { get; set; }         // Specific record ID
    public string Action { get; set; }           // Create, Update, Delete, View
    public string OldValues { get; set; }        // JSON before
    public string NewValues { get; set; }        // JSON after
    public string IpAddress { get; set; }
    public string UserAgent { get; set; }
    public DateTime Timestamp { get; set; }      // UTC
    public string Status { get; set; }           // Success, Failure
    public string Reason { get; set; }           // Why it was logged
}
```

### Audit Log Access

- **Users**: Can view own audit history (logins, profile changes)
- **Admins**: Can view all audit logs with filtering
- **Support**: Limited audit access (for investigation)

**Audit Log Query Example:**
```csharp
// View all logins for a user in the last 30 days
var loginLogs = await _auditService.GetLogsAsync(
    userId: currentUserId,
    action: "Login",
    days: 30
);

// Admin: View all failed authentication attempts
var failures = await _auditService.GetLogsAsync(
    action: "Login",
    status: "Failure",
    days: 7
);
```

### Log Retention

- Audit logs retained for **2 years**
- Deleted account data anonymized (user ID removed) after 30 days
- Logs stored in PostgreSQL `AuditLog` table
- Backed up daily (include in DB backups)

---

## 🛡️ Secure Coding Practices

### Input Validation

**All user input validated:**
- Email: RFC 5322 regex
- Phone: E.164 format
- Passwords: Length + character requirements
- Text fields: Max length, SQL injection prevention

```csharp
[StringLength(100, MinimumLength = 2)]
[RegularExpression(@"^[a-zA-Z\s'-]*$", ErrorMessage = "Invalid name format")]
public string Name { get; set; }
```

### SQL Injection Prevention

- **Entity Framework Core** used exclusively (parameterized queries)
- No string interpolation in SQL
- LINQ queries compiled to safe SQL

```csharp
// Safe ✅
var users = await _context.Users
    .Where(u => u.Email == email)
    .ToListAsync();

// Never do this ❌
// var users = await _context.Users.FromSqlRaw($"SELECT * FROM Users WHERE Email = {email}");
```

### CORS Security

**Allowed Origins Configuration:**
```json
"AllowedOrigins": [
  "http://localhost:3000",
  "https://app.hospitality.uk",
  "https://admin.hospitality.uk"
]
```

- Strict origin whitelist (no wildcards)
- Credentials allowed only for trusted origins
- Preflight requests validated

### HTTPS/TLS

- **Required**: All production traffic HTTPS only
- **Certificate**: Let's Encrypt or equivalent
- **HSTS**: Strict-Transport-Security header enabled
- **TLS 1.2+**: No older protocols

### Secrets Management

**Never in Code:**
- API keys
- Database passwords
- JWT secrets
- Email credentials

**Proper Storage:**
- **Development**: `.env.local` (git ignored)
- **Production**: Environment variables or secrets vault (AWS Secrets Manager, Azure Key Vault)
- **CI/CD**: GitHub Secrets for build pipelines

**Example:**
```csharp
// Load from environment, never hardcode
var jwtSecret = builder.Configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JWT secret not configured");
```

### Dependency Management

- Regular dependency updates via NuGet/npm
- Security vulnerability scanning in CI/CD
- Only trusted packages from official repositories

---

## 🔔 Reporting Security Issues

### Please Do NOT

❌ Open public GitHub issues for security vulnerabilities  
❌ Discuss vulnerabilities in chat/forums  
❌ Exploit vulnerabilities for any purpose

### Report To

**Email**: security@hospitality-platform.uk  
**PGP Key**: [Available on request]

**Include:**
1. Description of vulnerability
2. Steps to reproduce
3. Potential impact
4. Your contact information

### Response Timeline

- **Acknowledgment**: Within 24 hours
- **Investigation**: 7-14 days
- **Fix & Patch Release**: 30 days (critical: 14 days)
- **Public Disclosure**: Coordinated with reporter

---

## 📚 Additional Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Microsoft Security Best Practices](https://docs.microsoft.com/en-us/dotnet/standard/security/)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)

---

## ✅ Security Checklist for Developers

Before submitting code:

- [ ] No hardcoded secrets or API keys
- [ ] All user input validated and sanitized
- [ ] SQL queries use parameterized statements (EF Core)
- [ ] Error messages don't expose sensitive information
- [ ] Sensitive operations logged to audit trail
- [ ] Authorization checks on all protected endpoints
- [ ] HTTPS used for all external communication
- [ ] Dependencies up-to-date (run security audit)
- [ ] No debugging code left in production
- [ ] Tests include security scenarios (invalid input, unauthorized access)

---

**Last Updated**: January 2026  
**Classification**: Public (Security Policy)  
**Review Frequency**: Quarterly or on major version release
