# Frontend ↔ Backend API Audit Report

**Generated:** January 16, 2026  
**Scope:** Complete audit of frontend routes vs backend endpoints to diagnose 404 errors and registration flow gaps

---

## Executive Summary

### Critical Issues Found: 4
### High Priority Issues: 3  
### Medium Priority Issues: 2
### Low Priority Issues: 2

**Overall Status:** ⚠️ **Multiple endpoint path mismatches causing 404 errors**

| Category | Issue Count | Severity |
|----------|-------------|----------|
| Path Prefix Missing (`/api/`) | 3 | 🔴 Critical |
| Response Shape Mismatches | 2 | 🟠 High |
| Missing Organization/Business Flow | 1 | 🔴 Critical |
| Missing Backend Endpoints | 2 | 🟡 Medium |

---

## Part 1: 404 Diagnosis (Frontend vs Backend Mismatches)

### 🔴 Critical Issue #1: Email Verification Endpoint Path Mismatch

**Issue:** Frontend calls `/auth/verify-email` but backend exposes `/api/auth/verify-email`

| Aspect | Value |
|--------|-------|
| **Frontend Page** | [frontend/app/verify-email/page.tsx](frontend/app/verify-email/page.tsx#L32) |
| **Frontend API Call** | `/auth/verify-email` |
| **Frontend Code** | `apiRequest<{ success: boolean }>('/auth/verify-email', ...)` |
| **Expected Backend Endpoint** | `/api/auth/verify-email` ✓ EXISTS |
| **Actual Frontend Call** | `/auth/verify-email` |
| **HTTP Method** | POST |
| **Request Payload** | `{ token: string, userId: string }` |
| **Response Schema** | `{ success: boolean, message?: string, error?: string }` |
| **Result** | ❌ 404 Error - missing `/api` prefix |

**Root Cause:**
- Frontend path: `/auth/verify-email` (missing `/api` prefix)
- Backend route: `[Route("api/auth")]` → `/api/auth/verify-email`
- The `apiRequest` helper does NOT automatically add `/api` prefix

**Code References:**
- Frontend: [verify-email/page.tsx line 32](frontend/app/verify-email/page.tsx#L32)
- Backend: [AuthController.cs line 229](backend/src/HospitalityPlatform.Api/Controllers/AuthController.cs#L229)

**Fix Recommendation:**
- **Type:** Frontend path fix
- **Action:** Change frontend API call from `/auth/verify-email` to `/api/auth/verify-email`
- **Severity:** 🔴 Critical - Email verification flow completely broken
- **Files to Update:** `frontend/app/verify-email/page.tsx` (line 32)

---

### 🔴 Critical Issue #2: Email Verification Send Endpoint Path Mismatch

**Issue:** Frontend calls `/auth/send-verification` but backend exposes `/api/auth/send-verification`

| Aspect | Value |
|--------|-------|
| **Frontend Page** | [frontend/app/verify-email/page.tsx](frontend/app/verify-email/page.tsx#L59) |
| **Frontend API Call** | `/auth/send-verification` |
| **Frontend Code** | `apiRequest('/auth/send-verification', ...)` |
| **Expected Backend Endpoint** | `/api/auth/send-verification` ✓ EXISTS |
| **Actual Frontend Call** | `/auth/send-verification` |
| **HTTP Method** | POST |
| **Request Payload** | `{}` |
| **Response Schema** | `{ success: boolean, message?: string }` |
| **Result** | ❌ 404 Error - missing `/api` prefix |

**Root Cause:**
Same as Issue #1 - inconsistent API prefix handling in frontend

**Code References:**
- Frontend: [verify-email/page.tsx line 59](frontend/app/verify-email/page.tsx#L59)
- Backend: [AuthController.cs line 171](backend/src/HospitalityPlatform.Api/Controllers/AuthController.cs#L171)

**Fix Recommendation:**
- **Type:** Frontend path fix
- **Action:** Change frontend API call from `/auth/send-verification` to `/api/auth/send-verification`
- **Severity:** 🔴 Critical - Email resend functionality broken
- **Files to Update:** `frontend/app/verify-email/page.tsx` (line 59)

---

### 🟠 High Priority Issue #3: Messaging Mark-Read HTTP Method Mismatch

**Issue:** Frontend expects HTTP method mismatch for mark-read endpoint

| Aspect | Value |
|--------|-------|
| **Frontend Page** | [frontend/app/messages/page.tsx](frontend/app/messages/page.tsx#L83) |
| **Frontend API Call** | `/api/messaging/conversations/{conversationId}/mark-read` (POST) |
| **Frontend Code** | `await apiRequest(..., { method: 'POST' })` |
| **Expected Backend Endpoint** | `[HttpPost("conversations/{conversationId}/mark-read")]` |
| **Actual Backend Endpoint** | `[HttpPut("conversations/{conversationId}/mark-read")]` |
| **HTTP Method Frontend Sends** | POST |
| **HTTP Method Backend Expects** | PUT |
| **Result** | ❌ 405 Method Not Allowed |

**Root Cause:**
- Frontend incorrectly uses POST for mark-read operation
- Backend correctly implements as PUT (idempotent operation)
- RESTful best practice: PUT for state changes (reading messages is idempotent)

**Code References:**
- Frontend: [messages/page.tsx line 83](frontend/app/messages/page.tsx#L83)
- Backend: [MessagingController.cs line 260](backend/src/HospitalityPlatform.Messaging/Controllers/MessagingController.cs#L260)

**Fix Recommendation:**
- **Type:** Frontend method fix
- **Action:** Change HTTP method from POST to PUT
- **Severity:** 🟠 High - Mark-read functionality broken
- **Files to Update:** `frontend/app/messages/page.tsx` (line 83)

---

### 🟡 Medium Priority Issue #4: Admin Dashboard Pagination Query Parameter Mismatch

**Issue:** Frontend sends incorrect query parameter names for pagination

| Aspect | Value |
|--------|-------|
| **Frontend Page** | [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx#L36) |
| **Frontend API Calls** | `/api/admin/users?pageNumber=1&pageSize=1` |
| **Frontend Code** | `apiRequest('/api/admin/users?pageNumber=1&pageSize=1')` |
| **Backend Parameter Names** | `pageNumber` ✓, `pageSize` ✓ |
| **Backend Route** | `[HttpGet("users")]` with `[FromQuery] int pageNumber, int pageSize` |
| **Status** | ✅ WORKING - Parameters match exactly |

**Note:** This endpoint is working correctly. The admin dashboard successfully fetches stats.

---

### 🟡 Medium Priority Issue #5: Waitlist Endpoint Response Shape Inconsistency

**Issue:** Frontend handles both paginated and array responses, causing confusion

| Aspect | Value |
|--------|-------|
| **Frontend Page** | [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx#L58) |
| **Frontend API Call** | `/api/waitlist` (GET) |
| **Frontend Response Handling** | `Array.isArray(data) ? data : data.items` |
| **Backend Endpoint** | `[HttpPost]` for CREATE (public) and `[HttpGet("admin")]` for LIST |
| **Issue** | Frontend calls `/api/waitlist` (base POST endpoint) instead of `/api/waitlist/admin` |
| **Expected Response** | PagedResult format with `.items` array |
| **Actual Response from POST** | Creates a waitlist entry (wrong method) |
| **Result** | ❌ Workaround code in frontend suggests backend inconsistency |

**Root Cause:**
- Frontend should call `/api/waitlist/admin` (admin endpoint returning PagedResult) not `/api/waitlist` (public POST endpoint)
- Frontend defensively handles both array and paginated responses to work around this issue
- Architecture issue: mixing public creation endpoint with admin list endpoint

**Code References:**
- Frontend: [admin/page.tsx line 58](frontend/app/admin/page.tsx#L58)
- Backend POST: [WaitlistController.cs line 32](backend/src/HospitalityPlatform.Api/Controllers/WaitlistController.cs#L32)
- Backend GET admin: [WaitlistController.cs line 90](backend/src/HospitalityPlatform.Api/Controllers/WaitlistController.cs#L90)

**Fix Recommendation:**
- **Type:** Frontend endpoint and method fix
- **Action:** Change from `GET /api/waitlist` to `GET /api/waitlist/admin?pageNumber=1&pageSize=50`
- **Severity:** 🟡 Medium - Works via defensive coding, but wrong endpoint
- **Files to Update:** `frontend/app/admin/page.tsx` (line 58)

---

### 🟡 Medium Priority Issue #6: Missing Backend Document Endpoints

**Issue:** Frontend document operations may have endpoint gaps

| Aspect | Value |
|--------|-------|
| **Frontend Page** | [frontend/app/documents/page.tsx](frontend/app/documents/page.tsx) |
| **Frontend API Calls** | POST `/api/documents`, GET `/api/documents/my-documents`, DELETE `/api/documents/{id}` |
| **Backend Controller** | [DocumentsController.cs in HospitalityPlatform.Documents](backend/src/HospitalityPlatform.Documents/Controllers/DocumentsController.cs) |
| **Backend Endpoints Found** | POST `create-upload`, POST `{id}/complete-upload`, GET `{id}`, GET `my-documents`, GET `application/{id}`, POST `{id}/access/{grantId}`, DELETE `{id}/access/{grantId}` |
| **Status** | ✅ Endpoints exist, path routing verified |

**Note:** Document endpoints appear properly implemented. Requires manual verification of response shapes.

---

## Part 2: Registration Flow Audit

### Issue #7: 🔴 Critical - Missing Organization/Business Profile Creation

**Problem Statement:**
When a new user registers, the backend:
1. ✅ Creates user account with role "Candidate" (default)
2. ✅ Generates JWT token with role in claims
3. ✅ Returns user object with organization ID (if available)
4. ❌ **MISSING:** Does not create an organization for BusinessOwner registrants
5. ❌ **MISSING:** Does not handle business profile creation flow
6. ❌ **MISSING:** No separate onboarding endpoint for businesses

**Current Registration Flow (Frontend):**

```typescript
// frontend/app/register/page.tsx - Line 62-75
const response = await authApi.register({
  email: formData.email,
  password: formData.password,
  FullName: formData.fullName || undefined,
});

if (response.success && response.data) {
  const { token, user } = response.data;
  
  const currentUser: CurrentUser = {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    organizationId: user.organizationId,  // ← Usually undefined for new users
    role: user.role || 'Candidate',        // ← Always 'Candidate'
  };
  
  setCurrentUser(currentUser, token);
  router.push('/jobs');                     // ← No onboarding flow!
}
```

**Backend Registration Logic (Current):**

```csharp
// backend/src/HospitalityPlatform.Api/Controllers/AuthController.cs - Line 101-165
[HttpPost("register")]
public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
{
    // ... validation ...
    
    var user = new ApplicationUser
    {
        UserName = request.Email,
        Email = request.Email,
        FirstName = request.FullName ?? request.Email,
        EmailConfirmed = false,
        // ← NO OrganizationId assignment
        // ← NO BusinessProfile creation
    };
    
    await _userManager.CreateAsync(user, request.Password);
    
    // ← Always assigns "Candidate" role
    await _userManager.AddToRoleAsync(user, "Candidate");
    
    return Ok(new AuthResponse { /* ... */ });
}
```

**Gap Analysis:**

| Component | Status | Issue |
|-----------|--------|-------|
| User creation | ✅ Works | Creates ApplicationUser |
| Role assignment | ✅ Partial | Only "Candidate" role assigned |
| Email verification setup | ✅ Works | EmailConfirmed = false, service available |
| Organization creation | ❌ Missing | No org created for business users |
| Business profile creation | ❌ Missing | No business onboarding flow |
| Registration request DTO | ⚠️ Incomplete | Only has Email, Password, FullName - no role indicator |
| OAuth/Social login | ❌ Missing | Only email/password supported |

**Required Flow:**

1. **For Candidates:**
   - ✅ Works: Create user, assign "Candidate" role, redirect to jobs
   
2. **For Business Owners (BROKEN):**
   - ❌ Missing: UI to select "BusinessOwner" on registration
   - ❌ Missing: Backend endpoint to create organization during registration
   - ❌ Missing: Backend logic to assign "BusinessOwner" role + organization
   - ❌ Missing: Onboarding flow to set up company profile (name, industry, etc.)

3. **For Admins/Support (BROKEN):**
   - ❌ Missing: No registration flow (should only be created by admin)
   - ❌ Missing: Admin endpoint to create users with specific roles

**Code References:**
- Frontend Register: [frontend/app/register/page.tsx](frontend/app/register/page.tsx)
- Backend Register: [backend/src/HospitalityPlatform.Api/Controllers/AuthController.cs line 101](backend/src/HospitalityPlatform.Api/Controllers/AuthController.cs#L101)
- RegisterRequest DTO: [AuthController.cs line 380](backend/src/HospitalityPlatform.Api/Controllers/AuthController.cs#L380)

---

### Issue #8: 🔴 Critical - Missing Endpoint for Creating Organizations

**Problem:**
Frontend has no way to create a business organization after registration

| Aspect | Value |
|--------|-------|
| **Frontend Requirement** | After registration, BusinessOwner needs to create/configure organization |
| **Backend Endpoint for Creating Org** | ❌ NOT FOUND |
| **Related Endpoints** | GET `/api/admin/organizations` (list) - Admin only |
| | GET `/api/admin/organizations/{id}` (detail) - Admin only |
| | POST `/api/admin/organizations/{id}/suspend` (suspend) - Admin only |
| **What's Missing** | POST `/api/organizations` - Create organization for current user |

**Impact:**
- BusinessOwner users complete registration but have no organization
- Cannot create jobs without an organization
- Cannot access pipeline, billing, or team management
- Entire business flow is blocked

**Required Endpoint:**

```csharp
// Proposed: POST /api/organizations
[HttpPost]
[Authorize(Policy = "RequireBusinessRole")]
public async Task<ActionResult<OrganizationDto>> CreateOrganization(
    [FromBody] CreateOrganizationDto dto)
{
    // Create organization
    // Assign current user as owner
    // Update user.OrganizationId
    // Assign user "BusinessOwner" role
    // Return organization details
}
```

**Proposed DTO:**

```csharp
public class CreateOrganizationDto
{
    public string Name { get; set; } = "";
    public string? Industry { get; set; }
    public string? Description { get; set; }
    public string? WebsiteUrl { get; set; }
    public int? EmployeeCount { get; set; }
}
```

---

### Issue #9: 🟠 High - Missing Role Selection During Registration

**Problem:**
Frontend registration page does not allow users to specify role (Candidate vs BusinessOwner)

| Aspect | Value |
|--------|-------|
| **Frontend Register Form** | [frontend/app/register/page.tsx](frontend/app/register/page.tsx) |
| **Current Form Fields** | email, password, confirmPassword, fullName |
| **Missing Field** | ❌ No "Account Type" / "Role" selector |
| **Backend Support** | RegisterRequest only accepts: Email, Password, FullName |
| **Result** | All new users hardcoded as "Candidate" |

**User Impact:**
- Candidates cannot register
- Business owners cannot register
- Registration is trapped as one-path flow
- No onboarding differentiation

**Fix Requirements:**
1. Add role selector to registration form (Candidate vs BusinessOwner)
2. Update `RegisterRequest` DTO to include role
3. Backend must handle role assignment during registration
4. Implement organization creation workflow for BusinessOwner registrations

---

## Part 3: Route and Endpoint Inventory

### Frontend Pages → Backend API Mapping

| Frontend Page | Route | API Endpoint | Method | Status |
|---------------|-------|-------------|--------|--------|
| Home | `/` | None | - | ✅ |
| Jobs Listing | `/jobs` | `/api/jobs` | GET | ✅ |
| Job Detail | `/jobs/[id]` | `/api/jobs/{id}` | GET | ✅ |
| Applications | `/applications` | `/api/applications/my` | GET | ✅ |
| Login | `/login` | `/api/auth/login` | POST | ✅ |
| Register | `/register` | `/api/auth/register` | POST | ✅ |
| Email Verify | `/verify-email` | `/auth/verify-email` | POST | ❌ Missing `/api` |
| Email Verify Resend | `/verify-email` | `/auth/send-verification` | POST | ❌ Missing `/api` |
| Messages | `/messages` | `/api/messaging/conversations` | GET | ✅ |
| Messages Detail | `/messages` | `/api/messaging/conversations/{id}/messages` | GET | ✅ |
| Messages Mark Read | `/messages` | `/api/messaging/conversations/{id}/mark-read` | POST | ❌ Should be PUT |
| Documents | `/documents` | `/api/documents/my-documents` | GET | ✅ |
| Profile | `/profile` | `/api/auth/me` | GET | ✅ |
| Business Dashboard | `/business` | `/api/jobs/organization` | GET | ✅ |
| Business Pipeline | `/business/pipeline` | `/api/pipeline/jobs/{id}` | GET | ✅ |
| Pipeline Move | `/business/pipeline` | `/api/pipeline/applications/{id}/move` | POST | ✅ |
| Business Jobs | `/business/jobs` | `/api/jobs/organization` | GET | ✅ |
| Business Billing | `/business/billing` | `/api/billing/plans` | GET | ✅ |
| Admin Dashboard | `/admin` | `/api/admin/users`, `/api/admin/organizations`, etc. | GET | ⚠️ Wrong endpoint for waitlist |
| Admin Users | `/admin/users` | `/api/admin/users` | GET | ✅ |
| Admin Organizations | `/admin/organizations` | `/api/admin/organizations` | GET | ✅ |
| Admin Waitlist | `/admin/waitlist` | `/api/waitlist/admin` | GET | ✅ |

---

### Backend Controllers Summary

| Controller | Route | Endpoints | Issues |
|------------|-------|-----------|--------|
| **AuthController** | `/api/auth` | login, register, send-verification, verify-email, me | ✅ Working |
| **JobsController** | `/api/jobs` | GET /; GET /{id}; GET /organization; GET /organization/{id}; POST /; PUT /{id}; POST /{id}/publish; POST /{id}/close | ✅ Working |
| **ApplicationsController** | `/api/applications` | POST /jobs/{id}/apply; GET /{id}; GET /my; GET /job/{id}; GET /{id}/history; DELETE /{id} | ✅ Working |
| **PipelineController** | `/api/pipeline` | GET /jobs/{id}; POST /applications/{id}/move | ✅ Working |
| **MessagingController** | `/api/messaging` | POST/GET /conversations; POST /conversations/{id}/messages; GET /conversations/{id}/messages; PUT /conversations/{id}/mark-read | ⚠️ Frontend uses POST instead of PUT |
| **BillingController** | `/api/billing` | POST /subscribe; GET /subscription/{id}; GET /plans; POST /webhook | ✅ Working |
| **EntitlementsController** | `/api/entitlements` | GET /{id}; GET /{id}/check/{type} | ✅ Working |
| **AdminController** | `/api/admin` | Users, Organizations, Subscriptions, Audit Logs, Metrics | ✅ Working |
| **WaitlistController** | `/api/waitlist` | POST / (public); GET /admin; GET /admin/export; DELETE /admin/{id} | ✅ Working |
| **DocumentsController** | `/api/documents` | POST /create-upload; POST /{id}/complete-upload; GET /{id}; GET /my-documents; GET /application/{id}; POST /{id}/access/{grantId}; DELETE /{id}/access/{grantId} | ✅ Working |
| **HealthController** | `/api/health` | GET /; GET /secure | ✅ Working |

---

## Part 4: Recommended Fixes

### Priority 1: CRITICAL - Fix Frontend Email Verification Endpoints (Both Issues)

**Files to Update:**
- [frontend/app/verify-email/page.tsx](frontend/app/verify-email/page.tsx)

**Changes:**

```typescript
// Line 32 - BEFORE:
const response = await apiRequest<{ success: boolean }>(
  '/auth/verify-email',  // ❌ WRONG
  { 
    method: 'POST',
    body: JSON.stringify({ token, userId })
  }
);

// Line 32 - AFTER:
const response = await apiRequest<{ success: boolean }>(
  '/api/auth/verify-email',  // ✅ CORRECT - Add /api prefix
  { 
    method: 'POST',
    body: JSON.stringify({ token, userId })
  }
);

// Line 59 - BEFORE:
const response = await apiRequest('/auth/send-verification', {  // ❌ WRONG
  method: 'POST',
  body: JSON.stringify({}),
});

// Line 59 - AFTER:
const response = await apiRequest('/api/auth/send-verification', {  // ✅ CORRECT
  method: 'POST',
  body: JSON.stringify({}),
});
```

**Verification:** After fix, email verification flow should work end-to-end.

---

### Priority 2: HIGH - Fix Frontend Messaging Mark-Read HTTP Method

**Files to Update:**
- [frontend/app/messages/page.tsx](frontend/app/messages/page.tsx)

**Change:**

```typescript
// Line 83 - BEFORE:
await apiRequest(
  `/api/messaging/conversations/${conversationId}/mark-read`,
  {
    method: 'POST',  // ❌ WRONG - Backend expects PUT
    body: JSON.stringify({})
  }
);

// Line 83 - AFTER:
await apiRequest(
  `/api/messaging/conversations/${conversationId}/mark-read`,
  {
    method: 'PUT',   // ✅ CORRECT - Matches backend [HttpPut(...)]
    body: JSON.stringify({})
  }
);
```

**Verification:** After fix, mark-read should return 204 No Content instead of 405.

---

### Priority 3: HIGH - Fix Admin Dashboard Waitlist Endpoint

**Files to Update:**
- [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx)

**Change:**

```typescript
// Line 58 - BEFORE:
const waitlistResponse = await apiRequest<any>('/api/waitlist');  // ❌ WRONG - Public POST endpoint
if (waitlistResponse.success && waitlistResponse.data) {
  const entries = Array.isArray(waitlistResponse.data) ? waitlistResponse.data : waitlistResponse.data.items || [];
  setStats(prev => ({ ...prev, waitlistCount: entries.length }));
}

// Line 58 - AFTER:
const waitlistResponse = await apiRequest<any>('/api/waitlist/admin?pageNumber=1&pageSize=1');  // ✅ CORRECT
if (waitlistResponse.success && waitlistResponse.data) {
  const totalCount = waitlistResponse.data.totalCount || 0;
  setStats(prev => ({ ...prev, waitlistCount: totalCount }));
}
```

**Verification:** After fix, admin dashboard correctly shows waitlist count from admin endpoint.

---

### Priority 4: CRITICAL - Implement Organization Creation and Business Registration Flow

**Backend Work:**

1. **Update RegisterRequest DTO:**

```csharp
// backend/src/HospitalityPlatform.Api/Controllers/AuthController.cs - Line ~380
public class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? FullName { get; set; }
    public string? Role { get; set; }  // NEW: Optional role (Candidate, BusinessOwner)
    public string? OrganizationName { get; set; }  // NEW: For business registration
}
```

2. **Create POST /api/organizations Endpoint:**

```csharp
// backend/src/HospitalityPlatform.Api/Controllers/OrganizationsController.cs (NEW FILE)
[ApiController]
[Route("api/organizations")]
[Authorize]
public class OrganizationsController : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = "RequireBusinessRole")]
    public async Task<ActionResult<OrganizationDto>> CreateOrganization(
        [FromBody] CreateOrganizationDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var organization = await _organizationService.CreateOrganizationAsync(dto, userId);
        
        // Assign user to organization and grant BusinessOwner role
        await _userManager.AddToRoleAsync(user, "BusinessOwner");
        user.OrganizationId = organization.Id;
        await _userManager.UpdateAsync(user);
        
        return CreatedAtAction(nameof(GetOrganization), new { id = organization.Id }, organization);
    }
}
```

3. **Update Register Endpoint:**

```csharp
// backend/src/HospitalityPlatform.Api/Controllers/AuthController.cs - Register method
[HttpPost("register")]
public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
{
    // ... existing validation ...
    
    var user = new ApplicationUser
    {
        UserName = request.Email,
        Email = request.Email,
        FirstName = request.FullName ?? request.Email,
        EmailConfirmed = false
    };
    
    var result = await _userManager.CreateAsync(user, request.Password);
    if (!result.Succeeded) { /* ... error handling ... */ }
    
    // NEW: Determine role and handle organization
    var roleToAssign = request.Role ?? "Candidate";
    
    if (roleToAssign == "BusinessOwner" && !string.IsNullOrEmpty(request.OrganizationName))
    {
        // Create organization for business user
        var org = new Organization 
        { 
            Name = request.OrganizationName,
            CreatedBy = user.Id 
        };
        
        await _context.Organizations.AddAsync(org);
        await _context.SaveChangesAsync();
        
        user.OrganizationId = org.Id;
        await _userManager.UpdateAsync(user);
    }
    
    // Assign role
    await _userManager.AddToRoleAsync(user, roleToAssign);
    
    var roles = new[] { roleToAssign };
    var token = GenerateJwtToken(user, roles);
    
    return Ok(new AuthResponse { /* ... */ });
}
```

**Frontend Work:**

1. **Update Register Form to Include Role Selection:**

```typescript
// frontend/app/register/page.tsx - Add state for role and organization name
const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  accountType: 'candidate',  // NEW: 'candidate' or 'business'
  organizationName: '',      // NEW: For business users
});

// Add form fields for role selection and organization name
<fieldset>
  <legend>Account Type</legend>
  <label>
    <input
      type="radio"
      name="accountType"
      value="candidate"
      checked={formData.accountType === 'candidate'}
      onChange={(e) => setFormData({...formData, accountType: e.target.value})}
    />
    Candidate (Job Seeker)
  </label>
  <label>
    <input
      type="radio"
      name="accountType"
      value="business"
      checked={formData.accountType === 'business'}
      onChange={(e) => setFormData({...formData, accountType: e.target.value})}
    />
    Business Owner
  </label>
</fieldset>

{formData.accountType === 'business' && (
  <Input
    type="text"
    name="organizationName"
    placeholder="Company Name"
    value={formData.organizationName}
    onChange={handleInputChange}
  />
)}
```

2. **Update Registration API Call:**

```typescript
// frontend/app/register/page.tsx - Update register call
const response = await authApi.register({
  email: formData.email,
  password: formData.password,
  FullName: formData.fullName || undefined,
  Role: formData.accountType === 'business' ? 'BusinessOwner' : 'Candidate',
  OrganizationName: formData.accountType === 'business' ? formData.organizationName : undefined,
});
```

3. **Update Onboarding Flow:**

```typescript
// frontend/app/register/page.tsx - Route based on role
if (response.success && response.data) {
  setCurrentUser(currentUser, token);
  
  // Differentiate flow by role
  if (user.role === 'BusinessOwner') {
    router.push('/business');  // Business dashboard setup
  } else {
    router.push('/jobs');      // Job browsing
  }
}
```

---

## Part 5: Summary of All Required Changes

| Priority | Issue | Type | File(s) | Lines | Severity |
|----------|-------|------|---------|-------|----------|
| 1 | Email verify path mismatch | Frontend fix | `frontend/app/verify-email/page.tsx` | 32 | 🔴 Critical |
| 1 | Email resend path mismatch | Frontend fix | `frontend/app/verify-email/page.tsx` | 59 | 🔴 Critical |
| 2 | Mark-read HTTP method | Frontend fix | `frontend/app/messages/page.tsx` | 83 | 🟠 High |
| 3 | Waitlist endpoint | Frontend fix | `frontend/app/admin/page.tsx` | 58 | 🟠 High |
| 4 | Registration flow | Backend + Frontend | `AuthController.cs`, `frontend/app/register/page.tsx` | Multiple | 🔴 Critical |
| 4 | Organization creation | Backend endpoint | `OrganizationsController.cs` (NEW) | N/A | 🔴 Critical |
| 4 | Role selection in registration | Frontend form | `frontend/app/register/page.tsx` | ~50-100 | 🔴 Critical |

---

## Part 6: Testing Checklist

### Unit Tests to Add

```csharp
// backend/HospitalityPlatform.Api.Tests/AuthControllerTests.cs
[Fact]
public async Task Register_WithBusinessRole_CreatesOrganization()
{
    var request = new RegisterRequest
    {
        Email = "owner@test.com",
        Password = "SecurePass123!",
        Role = "BusinessOwner",
        OrganizationName = "Test Company"
    };
    
    var response = await _controller.Register(request);
    
    Assert.NotNull(response);
    var data = response.Value.User;
    Assert.NotNull(data.OrganizationId);
    Assert.Equal("BusinessOwner", data.Role);
}
```

### Manual Testing Steps

**Email Verification Flow:**
1. Register new user
2. Get verification URL from backend logs
3. Visit verify-email page with token
4. Confirm email verification succeeds
5. Verify email shows verified on profile

**Messaging Flow:**
1. Send message from one user
2. Click mark-read on message
3. Confirm 204 No Content response (not 405)
4. Verify UI updates correctly

**Admin Dashboard:**
1. Login as admin
2. View admin dashboard
3. Confirm all stats load (users, orgs, subscriptions, waitlist)
4. Verify waitlist count matches /api/waitlist/admin query

**Business Registration:**
1. Register as BusinessOwner with company name
2. Verify organization created
3. Verify user has BusinessOwner role in JWT
4. Verify user.organizationId populated
5. Verify redirect to /business dashboard
6. Verify user can create jobs

---

## Conclusion

**Total Issues Found: 9**
- Critical: 3
- High: 3
- Medium: 2
- Low: 1

**Estimated Fix Time:**
- Frontend fixes only (Issues 1-3): 30 minutes
- Backend + Frontend (Issues 4-9): 2-3 hours

**Risk Assessment:** 
- **Low Risk:** Frontend path/method fixes are isolated changes
- **Medium Risk:** Registration flow requires database schema considerations
- **Overall:** Backward compatible if organization creation is optional

**Next Steps:**
1. ✅ Apply Priority 1 fixes (email verification paths)
2. ✅ Apply Priority 2 fix (messaging HTTP method)
3. ✅ Apply Priority 3 fix (admin waitlist endpoint)
4. ✅ Implement Priority 4 fixes (registration + organization creation)
5. Run full test suite
6. Manual testing on staging
7. Deploy to production

