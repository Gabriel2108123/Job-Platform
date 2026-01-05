# Roles and Permissions

## Overview

The UK Hospitality Platform implements a comprehensive role-based access control (RBAC) system with five distinct user roles, each with specific permissions and capabilities.

## User Roles

### 1. Candidate
**Purpose:** Job seekers looking for positions in the hospitality industry

**Typical Users:**
- Chefs
- Waiters/Waitresses
- Bartenders
- Hotel staff
- Kitchen staff
- Front-of-house staff

**Permissions (to be implemented):**
- Create and manage personal profile
- Upload CV/resume
- Browse job listings
- Apply for jobs
- Track application status
- View application history
- Receive job recommendations
- Update availability and preferences

**Cannot:**
- Post jobs
- Access other candidates' data
- View employer dashboards
- Access admin functions

---

### 2. BusinessOwner
**Purpose:** Employers and hiring managers who need to recruit staff

**Typical Users:**
- Restaurant owners
- Hotel managers
- Pub owners
- Catering company managers
- Hospitality venue managers

**Permissions (to be implemented):**
- Manage organization profile
- Post job listings
- Review candidate applications
- Schedule interviews
- Message candidates
- View analytics for their postings
- Invite staff members to their organization
- Manage organization-level settings

**Organization Scope:**
- Can only access data within their organization
- Cannot see other organizations' data
- Can manage users in their organization

**Cannot:**
- Access system administration functions
- View other organizations' candidates
- Modify platform settings

---

### 3. Staff
**Purpose:** Regular employees working within an organization

**Typical Users:**
- HR assistants
- Recruitment coordinators
- Team leaders

**Permissions (to be implemented):**
- View job postings within organization
- Assist with candidate screening
- View candidate profiles (limited)
- Help with scheduling
- Access organization resources

**Organization Scope:**
- Limited to their organization
- Cannot manage organization settings
- Cannot post jobs (unless granted specific permissions)

**Cannot:**
- Manage organization settings
- Access financial information
- Delete job postings
- Access admin functions

---

### 4. Admin
**Purpose:** System administrators with full platform access

**Typical Users:**
- Platform administrators
- Technical support team
- System managers

**Permissions:**
- Full system access
- Manage all organizations
- Manage all users
- Configure platform settings
- Access all data and reports
- Manage roles and permissions
- System configuration
- Database management
- View system-wide analytics
- Moderate content
- Handle escalated issues

**Special Access:**
- Cross-organization access
- Can impersonate users for support
- Access to system logs
- Can override restrictions

**Cannot:**
- Should not interfere with normal business operations without reason
- Must follow audit compliance

---

### 5. Support
**Purpose:** Customer support team members

**Typical Users:**
- Customer service representatives
- Technical support staff
- Account managers

**Permissions (to be implemented):**
- View user accounts
- Reset passwords
- View support tickets
- Assist with account issues
- Access user data for support purposes
- View platform usage
- Generate support reports

**Special Access:**
- Cross-organization viewing (read-only)
- Can access audit logs
- Can view but not modify most data

**Cannot:**
- Modify system configuration
- Delete organizations
- Access financial data
- Perform administrative functions

---

## Policy-Based Authorization

### Available Policies

The system uses policy-based authorization with the following policies:

1. **RequireCandidate** - Endpoints requiring Candidate role
2. **RequireBusinessOwner** - Endpoints requiring BusinessOwner role
3. **RequireStaff** - Endpoints requiring Staff role
4. **RequireAdmin** - Endpoints requiring Admin role
5. **RequireSupport** - Endpoints requiring Support role
6. **RequireOrganizationAccess** - Endpoints requiring organization association

### Usage Example

```csharp
[Authorize(Policy = PolicyNames.RequireBusinessOwner)]
public async Task<IActionResult> PostJob([FromBody] JobPostingDto dto)
{
    // Only BusinessOwners can access this endpoint
}

[Authorize(Policy = PolicyNames.RequireOrganizationAccess)]
public async Task<IActionResult> GetOrganizationData()
{
    // Requires user to be associated with an organization
}
```

## Role Hierarchy

```
Admin (Full Access)
  └─ Support (Cross-org viewing, limited modifications)
      └─ BusinessOwner (Organization management)
          └─ Staff (Organization member)
              └─ Candidate (Job seeker)
```

## Multi-Tenancy and Organizations

### Organization Association

- **BusinessOwner, Staff:** Must belong to an organization
- **Candidate:** May or may not belong to an organization
- **Admin, Support:** Not tied to a specific organization

### Data Isolation

- Data is isolated by `OrganizationId`
- BusinessOwners and Staff can only access their organization's data
- Admin and Support can access across organizations
- Candidates can only access their own data

## Security Considerations

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

### Account Protection
- Account lockout after 5 failed login attempts
- 15-minute lockout duration
- Email verification required (to be implemented)

### Token-Based Authentication
- JWT tokens with 60-minute expiry
- Refresh tokens for extended sessions (to be implemented)
- Tokens include user ID, email, and role claims

## Future Enhancements

### Fine-Grained Permissions
- Custom permission sets within roles
- Permission-based authorization alongside roles
- Dynamic permission assignment

### Role Management
- Role hierarchy with inheritance
- Custom roles per organization
- Role templates

### Advanced Features
- Time-based access control
- Location-based restrictions
- IP whitelisting for admin access
- Two-factor authentication
- Single sign-on (SSO)

## API Endpoint Protection

### Public Endpoints (No Auth Required)
- Health checks
- Registration
- Login
- Password reset request

### Authenticated Endpoints (Any Role)
- Profile management
- Password change
- User settings

### Role-Specific Endpoints
- Job posting management → BusinessOwner
- Candidate application → Candidate
- User management → Admin
- Support tickets → Admin, Support

## Audit Trail

All role-based actions are logged in the audit system:
- User performing the action
- Action timestamp
- Action type (Create, Read, Update, Delete)
- Affected entities
- IP address and user agent
- Organization context

## Testing Role-Based Access

### Unit Tests (to be implemented)
- Test each policy with different roles
- Verify unauthorized access is blocked
- Test organization isolation

### Integration Tests (to be implemented)
- Test end-to-end role scenarios
- Verify cross-organization access controls
- Test role changes and permission updates

## Conclusion

This role-based system provides:
- ✅ Clear separation of concerns
- ✅ Organization-level multi-tenancy
- ✅ Flexible policy-based authorization
- ✅ Strong security boundaries
- ✅ Audit trail for compliance
- ✅ Scalable permission model

The role system can easily be extended with additional roles or fine-grained permissions as the platform grows.
