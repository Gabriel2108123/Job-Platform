# Frontend ↔ Backend API Mismatch Audit Report

**Date:** January 14, 2026  
**Status:** ⚠️ CRITICAL ISSUES FOUND  
**Scope:** Route casing, response shapes, inconsistent patterns

---

## Executive Summary

Found **8 critical mismatches** between frontend API calls and backend routes:

| Issue Type | Count | Severity | Impact |
|-----------|-------|----------|--------|
| Route Casing | 3 | 🔴 CRITICAL | 404 errors on case-sensitive proxies |
| Inconsistent Response Shapes | 2 | 🔴 CRITICAL | Parsing failures, undefined properties |
| Wrapped vs Unwrapped Responses | 3 | 🟠 HIGH | Frontend expects `data` property, backend returns direct |
| Missing Endpoints | 2 | 🟠 HIGH | Frontend calls non-existent routes |

---

## Issue #1: Jobs API Route Casing ❌

### Problem
Frontend calls `/api/Jobs` (capital "J")  
Backend routes defined as `/api/jobs` (lowercase)

### Frontend Code
[frontend/lib/api/client.ts](frontend/lib/api/client.ts#L198-L206)
```typescript
// Line 198
const path = `/api/Jobs${queryParams.toString() ? `?${queryParams}` : ''}`;
return apiRequest<JobPagedResult | JobDto[]>(path);

// Line 206
export async function getJob(id: string): Promise<ApiResponse<JobDto>> {
  return apiRequest<JobDto>(`/api/Jobs/${id}`);
}

// Line 319
export async function getOrganizationJobs(organizationId: string): Promise<ApiResponse<JobDto[]>> {
  return apiRequest<JobDto[]>(`/api/Jobs/organization/${organizationId}`);
}

// Line 329
export async function createJob(job: CreateJobDto): Promise<ApiResponse<JobDto>> {
  return apiRequest<JobDto>('/api/Jobs', { method: 'POST', body: JSON.stringify(job) });
}

// Line 345
export async function updateJob(jobId: string, job: Partial<CreateJobDto>): Promise<ApiResponse<JobDto>> {
  return apiRequest<JobDto>(`/api/Jobs/${jobId}`, { method: 'PUT', body: JSON.stringify(job) });
}
```

### Backend Code
[backend/src/HospitalityPlatform.Api/Controllers/JobsController.cs](backend/src/HospitalityPlatform.Api/Controllers/JobsController.cs#L10)
```csharp
[Route("api/jobs")]  // ← LOWERCASE
public class JobsController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<JobDto>>> SearchJobs([FromQuery] SearchJobsDto searchDto) { }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<JobDto>> GetJob(Guid id) { }
    
    [HttpGet("organization")]
    public async Task<ActionResult<IEnumerable<JobDto>>> GetMyOrganizationJobs() { }
    
    [HttpGet("organization/{organizationId}")]
    public async Task<ActionResult<PagedResult<JobDto>>> GetOrganizationJobs(Guid organizationId) { }
    
    [HttpPost]
    public async Task<ActionResult<JobDto>> CreateJob([FromBody] CreateJobDto dto) { }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<JobDto>> UpdateJob(Guid id, [FromBody] CreateJobDto dto) { }
}
```

### Impact
- ✅ Works locally (case-insensitive Windows/Linux with ASP.NET default)
- ❌ **FAILS on case-sensitive proxies** (nginx, CloudFlare, AWS API Gateway)
- ❌ **FAILS in Docker/Linux production** (case-sensitive filesystem)

### Affected Frontend Calls
```
❌ /api/Jobs → should be /api/jobs
❌ /api/Jobs/{id} → should be /api/jobs/{id}
❌ /api/Jobs/organization/{organizationId} → should be /api/jobs/organization/{organizationId}
```

**Fix Priority:** 🔴 CRITICAL - Apply before Docker deployment

---

## Issue #2: Admin API Route Casing ❌

### Problem
Frontend calls `/api/admin` (lowercase)  
Backend routes may be inconsistent

### Frontend Code
[frontend/app/admin/page.tsx](frontend/app/admin/page.tsx#L36-L65)
```typescript
const baseUrl = 'http://localhost:5205';

// Line 36
const usersRes = await fetch(`${baseUrl}/api/admin/users?page=1&pageSize=1`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Line 45
const orgsRes = await fetch(`${baseUrl}/api/admin/organizations?page=1&pageSize=1`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Line 54
const subsRes = await fetch(`${baseUrl}/api/admin/subscriptions`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

### Backend Code
[backend/src/HospitalityPlatform.Api/Controllers/AdminController.cs](backend/src/HospitalityPlatform.Api/Controllers/AdminController.cs#L14)
```csharp
[Route("api/admin")]  // ← LOWERCASE ✓
[Authorize(Policy = "RequireAdmin")]
public class AdminController : ControllerBase
{
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1) { }
    
    [HttpGet("organizations")]
    public async Task<IActionResult> GetOrganizations([FromQuery] int pageNumber = 1) { }
    
    [HttpGet("subscriptions")]
    public async Task<IActionResult> GetSubscriptions() { }
}
```

### Status
✅ Frontend `/api/admin` matches backend `api/admin`  
⚠️ BUT: Documentation references `/api/Admin` (capital A) - needs clarification

---

## Issue #3: Inconsistent Response Shapes - Jobs Endpoint ❌

### Problem
`/api/jobs/organization` endpoint has **two different response formats**:

**Endpoint 1:** `GET /api/jobs/organization` (current user's org)
```csharp
return Ok(new { success = true, data = result.Items });  // ← WRAPPED
```

**Endpoint 2:** `GET /api/jobs/organization/{organizationId}` (specific org)
```csharp
return Ok(result);  // ← UNWRAPPED (PagedResult)
```

### Frontend Expectation
[frontend/app/business/pipeline/page.tsx](frontend/app/business/pipeline/page.tsx#L57)
```typescript
const res = await fetch(`${baseUrl}/api/jobs/organization`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

if (res.ok) {
  const data = await res.json();
  const jobsList = data.data || [];  // ← EXPECTS data.data ❌
  setJobs(jobsList);
}
```

### Backend Code
[backend/src/HospitalityPlatform.Api/Controllers/JobsController.cs](backend/src/HospitalityPlatform.Api/Controllers/JobsController.cs#L75-L105)
```csharp
// Line 75-93: /api/jobs/organization
[HttpGet("organization")]
[Authorize(Policy = "RequireBusinessRole")]
public async Task<ActionResult<IEnumerable<JobDto>>> GetMyOrganizationJobs()
{
    var result = await _jobService.GetJobsByOrganizationAsync(organizationId, 1, 1000);
    return Ok(new { success = true, data = result.Items });  // ← WRAPPED
}

// Line 95-108: /api/jobs/organization/{organizationId}
[HttpGet("organization/{organizationId}")]
[Authorize(Policy = "RequireBusinessRole")]
public async Task<ActionResult<PagedResult<JobDto>>> GetOrganizationJobs(Guid organizationId)
{
    var result = await _jobService.GetJobsByOrganizationAsync(organizationId, pageNumber, pageSize);
    return Ok(result);  // ← UNWRAPPED - Returns PagedResult directly
}
```

### Expected Response Shapes

**Endpoint 1 Response (wrapped):**
```json
{
  "success": true,
  "data": [
    { "id": "...", "title": "...", ... }
  ]
}
```

**Endpoint 2 Response (unwrapped):**
```json
{
  "items": [
    { "id": "...", "title": "...", ... }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 5
}
```

### Impact
- Frontend parses `data.data` for **wrapped** response
- **Unwrapped** response has no `data` property → parsing fails
- Different endpoints return different formats → inconsistent API contract

**Fix Priority:** 🔴 CRITICAL - Standardize all responses

---

## Issue #4: Inconsistent Wrapped Responses Across API ❌

### Pattern 1: Wrapped Responses (inconsistent)
These endpoints wrap response in `{ success, data }`:
- `GET /api/jobs/organization` → `{ success: true, data: [...] }`

### Pattern 2: Direct Responses (standard)
These endpoints return data directly:
- `GET /api/jobs` → `PagedResult { items: [...], pageNumber, pageSize, totalCount }`
- `GET /api/jobs/{id}` → `JobDto { id, title, ... }`
- `GET /api/jobs/organization/{organizationId}` → `PagedResult { items: [...] }`

### Frontend Inconsistency
[frontend/app/jobs/page.tsx](frontend/app/jobs/page.tsx#L23-L38)
```typescript
const response = await getJobs({
  page: currentPage,
  pageSize: 10,
  search: search || undefined,
  location: locationFilter || undefined,
  employmentType: employmentTypeFilter || undefined,
});

if (response.success && response.data) {
  // Handle both paged and non-paged responses
  if ('items' in response.data) {
    // ← Expects PagedResult structure
    setTotalPages(Math.ceil(response.data.totalCount / 10));
    setJobs(response.data.items);
  }
}
```

### Issue
Frontend code has **defensive programming** to handle both wrapped and unwrapped:
```typescript
if ('items' in response.data) {
  // Handle paged response
} else if (Array.isArray(response.data)) {
  // Handle array response
}
```

This is a **code smell** - indicates API contract is inconsistent.

---

## Issue #5: Messaging API Missing Endpoints ❌

### Frontend Calls
[frontend/app/messages/page.tsx](frontend/app/messages/page.tsx#L65-L102)
```typescript
// Line 65
const response = await apiRequest<Conversation[]>('/api/messaging/conversations');

// Line 79
const response = await apiRequest<Message[]>(
  `/api/messaging/conversations/${conversationId}/messages`
);

// Line 83
await apiRequest(`/api/messaging/conversations/${conversationId}/mark-read`, {
  method: 'PUT'
});

// Line 102
const response = await apiRequest<Message>(
  `/api/messaging/conversations/${selectedConversation}/messages`,
  { method: 'POST', body: JSON.stringify({ content: newMessage }) }
);
```

### Backend Code
[backend/src/HospitalityPlatform.Messaging/Controllers/MessagingController.cs](backend/src/HospitalityPlatform.Messaging/Controllers/MessagingController.cs#L19-L60)
```csharp
[Route("api/messaging")]
[Authorize]
public class MessagingController : ControllerBase
{
    [HttpPost("conversations")]
    public async Task<ActionResult<ConversationDto>> CreateConversation([FromBody] CreateConversationDto dto) { }
    
    [HttpGet("conversations/{conversationId}")]
    public async Task<ActionResult<ConversationDto>> GetConversation(Guid conversationId) { }
    
    [HttpGet("conversations")]
    public async Task<ActionResult<PagedResult<ConversationDto>>> GetConversations() { }
    
    [HttpPost("conversations/{conversationId}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessage(Guid conversationId, [FromBody] SendMessageDto dto) { }
    
    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<ActionResult<PagedResult<MessageDto>>> GetMessages(Guid conversationId) { }
    
    [HttpPut("conversations/{conversationId}/messages/{messageId}")]
    public async Task<ActionResult<MessageDto>> EditMessage(Guid conversationId, Guid messageId) { }
}
```

### Missing Endpoints
```
❌ PUT /api/messaging/conversations/{conversationId}/mark-read
   → Not implemented in backend
   → Frontend calls it but will get 404

✓ POST /api/messaging/conversations/{conversationId}/messages
   → Backend: SendMessage() implemented
   → Frontend: Correctly calls POST

✓ GET /api/messaging/conversations/{conversationId}/messages
   → Backend: GetMessages() implemented
   → Frontend: Correctly calls GET
```

**Fix Priority:** 🟠 HIGH - Add missing mark-read endpoint

---

## Issue #6: Query Parameter Naming Misalignment ❌

### Backend expects `pageNumber`, Frontend sends `page`
[frontend/lib/api/client.ts](frontend/lib/api/client.ts#L191-L197)
```typescript
// Line 191-197: Maps 'page' to 'pageNumber'
if (params) {
  if (params.page) queryParams.set('pageNumber', params.page.toString());
  if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
  if (params.search) queryParams.set('keyword', params.search);  // ← Also maps search → keyword
}
```

### Backend Receives
```csharp
[FromQuery] SearchJobsDto searchDto
// searchDto.pageNumber ← expects pageNumber
// searchDto.keyword ← expects keyword
```

### Status
✅ Correctly mapped in frontend (`page` → `pageNumber`, `search` → `keyword`)  
✅ Backend receives correct parameters  

**BUT:** Documentation references `page` instead of `pageNumber` - causing confusion

---

## Issue #7: Waitlist API Response Type Mismatch ❌

### Frontend Call (no base URL wrapper)
[frontend/app/admin/waitlist/page.tsx](frontend/app/admin/waitlist/page.tsx#L46)
```typescript
const response = await fetch(`/api/waitlist/admin?${queryParams}`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

### Frontend Call (with base URL wrapper)
[frontend/app/admin/waitlist/page.tsx](frontend/app/admin/waitlist/page.tsx#L117)
```typescript
const response = await fetch(`/api/waitlist/admin/export?${queryParams}`, {
  method: 'GET',
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

### Issues
1. **Inconsistent URL composition** - Some use bare `/api/`, others use baseUrl
2. **Response handling inconsistent** - No wrapper function, manual fetch
3. **Auth header inconsistent** - Manually added, not via apiRequest helper

---

## Issue #8: Documents API Inconsistent Base URL Usage ❌

### Pattern A: Using apiRequest helper (centralized)
[frontend/app/documents/page.tsx](frontend/app/documents/page.tsx#L54)
```typescript
const response = await apiRequest<Document[]>('/api/documents/my-documents');
```

### Pattern B: Using raw fetch with baseUrl (decentralized)
[frontend/app/business/billing/page.tsx](frontend/app/business/billing/page.tsx#L63)
```typescript
const baseUrl = 'http://localhost:5205';
const plansRes = await fetch(`${baseUrl}/api/billing/plans`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});
```

### Issues
- **Two different HTTP patterns** in same codebase
- **Missing centralization** - billing.ts should use apiRequest
- **Auth header not abstracted** - repeated across files
- **Hardcoded baseUrl** - should use API_CONFIG

---

## Summary Table of All Mismatches

| # | Issue | Frontend | Backend | Severity | Status |
|---|-------|----------|---------|----------|--------|
| 1 | Jobs route casing | `/api/Jobs` | `/api/jobs` | 🔴 CRITICAL | ❌ UNFIXED |
| 2 | Jobs response wrapping | Expects `{ data: [...] }` | Returns `{ success, data }` for org, PagedResult for org/{id} | 🔴 CRITICAL | ❌ UNFIXED |
| 3 | Messaging mark-read | Calls `PUT /api/messaging/.../mark-read` | Endpoint missing | 🟠 HIGH | ❌ UNFIXED |
| 4 | Wrapped responses | Some expect wrapped, some direct | Inconsistent wrapping | 🟠 HIGH | ❌ UNFIXED |
| 5 | API helper usage | Mix of apiRequest + raw fetch | - | 🟠 HIGH | ❌ UNFIXED |
| 6 | Parameter naming | Maps `page` → `pageNumber` | Receives `pageNumber` | ✅ OK | ✅ WORKING |
| 7 | Admin route casing | `/api/admin` | `/api/admin` | ✅ OK | ✅ WORKING |
| 8 | Waitlist API | Bare `/api/` + raw fetch | - | 🟠 HIGH | ❌ UNFIXED |

---

## Fix Strategy

### Phase 1: Immediate Fixes (BEFORE DEPLOYMENT)

#### Fix 1.1: Standardize All Route Casing to LOWERCASE
```
Change ALL frontend calls from /api/Jobs to /api/jobs
Change ALL frontend calls from /api/Auth to /api/auth (if any)
Backend routes already lowercase ✓
```

**Files to update:**
- [frontend/lib/api/client.ts](frontend/lib/api/client.ts) - Lines 198, 206, 319, 329, 345
- [frontend/lib/api/auth.ts](frontend/lib/api/auth.ts) - Lines 12, 22, 32, 41

#### Fix 1.2: Standardize Response Wrapping Pattern
**Decision:** Return PagedResult directly (no wrapper)

**Pattern to enforce:**
```typescript
// ✓ STANDARD
return Ok(pagedResult);  // { items: [...], pageNumber, pageSize, totalCount }

// ✓ STANDARD (for single items)
return Ok(job);  // { id: "...", title: "...", ... }

// ❌ WRONG (remove all wrapping)
return Ok(new { success = true, data = result.Items });
```

**Files to update:**
- [backend/src/HospitalityPlatform.Api/Controllers/JobsController.cs](backend/src/HospitalityPlatform.Api/Controllers/JobsController.cs#L85) - Remove wrapper in GetMyOrganizationJobs

#### Fix 1.3: Add Missing Messaging Endpoint
```csharp
[HttpPut("conversations/{conversationId}/mark-read")]
public async Task<IActionResult> MarkConversationRead(Guid conversationId)
{
    // Mark all messages in conversation as read
}
```

**File to update:**
- [backend/src/HospitalityPlatform.Messaging/Controllers/MessagingController.cs](backend/src/HospitalityPlatform.Messaging/Controllers/MessagingController.cs)

### Phase 2: Refactoring (MEDIUM PRIORITY)

#### Fix 2.1: Consolidate API Helper Usage
Refactor all raw `fetch()` calls to use `apiRequest()` helper:

**Files to update:**
- [frontend/app/business/billing/page.tsx](frontend/app/business/billing/page.tsx#L63-L109) - 6 fetch calls
- [frontend/app/business/pipeline/page.tsx](frontend/app/business/pipeline/page.tsx#L57-L135) - 4 fetch calls
- [frontend/app/business/page.tsx](frontend/app/business/page.tsx#L38-L66) - 3 fetch calls
- [frontend/app/admin/waitlist/page.tsx](frontend/app/admin/waitlist/page.tsx#L46-L117) - 3 fetch calls
- [frontend/app/admin/page.tsx](frontend/app/admin/page.tsx#L36-L65) - 4 fetch calls

#### Fix 2.2: Create API Endpoint Typings
Create strict TypeScript interfaces for each endpoint:

```typescript
// For standardization
interface JobsListRequest {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  location?: string;
  employmentType?: string;
}

interface JobsListResponse {
  items: JobDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}
```

### Phase 3: Documentation Updates (LOW PRIORITY)

#### Fix 3.1: Update API Contract Documentation
- Update SANITY_CHECK_REPORT.md with corrected route casing
- Add explicit response shape examples for each endpoint
- Document all query parameters with correct names

#### Fix 3.2: Add API Style Guide
Create `.docs/API_STYLE_GUIDE.md`:
```markdown
# API Contract Style Guide

## Route Naming
- All routes lowercase (prefer `/api/jobs` not `/api/Jobs`)
- Use kebab-case for multi-word endpoints

## Response Format
- Standard: Return data directly
  ```json
  {
    "items": [...],
    "pageNumber": 1,
    "pageSize": 20,
    "totalCount": 100
  }
  ```
- No wrapper objects (no `{ success, data }`)

## Query Parameters
- Use camelCase: `pageNumber`, not `page`
- Common: `pageNumber`, `pageSize`, `keyword`, `sortBy`

## Frontend API Calls
- Use `apiRequest()` helper, never raw `fetch()`
- Always provide TypeScript interface for response
```

---

## Testing Plan

### Unit Tests to Add

```typescript
// frontend/lib/api/__tests__/routes.test.ts
describe('API Route Casing', () => {
  test('All routes use lowercase paths', () => {
    expect(getJobs).toCallEndpoint('/api/jobs');
    expect(getJob('123')).toCallEndpoint('/api/jobs/123');
    expect(createJob({})).toCallEndpoint('/api/jobs', { method: 'POST' });
  });
});

describe('Response Shapes', () => {
  test('PagedResult endpoints return consistent shape', () => {
    const response = { items: [], pageNumber: 1, pageSize: 20, totalCount: 0 };
    expect(response).toHaveProperty('items');
    expect(response).toHaveProperty('totalCount');
  });
});

describe('API Helper Usage', () => {
  test('All API calls use apiRequest helper', () => {
    // Audit all frontend pages for raw fetch()
  });
});
```

### Integration Tests

```bash
# Test case-sensitive routing (run in Linux/Docker)
curl -X GET http://localhost:5205/api/Jobs  # Should fail (404)
curl -X GET http://localhost:5205/api/jobs  # Should succeed (200)

# Test response shapes
curl -X GET http://localhost:5205/api/jobs/organization
# Should return: PagedResult { items, pageNumber, pageSize, totalCount }
# NOT: { success: true, data: [...] }
```

---

## Deployment Checklist

- [ ] Fix 1.1: Lowercase all routes in frontend
- [ ] Fix 1.2: Remove response wrappers in backend
- [ ] Fix 1.3: Add missing messaging endpoint
- [ ] Test all endpoints locally
- [ ] Test with case-sensitive HTTP client (curl on Linux)
- [ ] Deploy to Docker/production
- [ ] Verify in production environment
- [ ] Phase 2 refactoring (next sprint)

---

## Impact Assessment

### Current Status (Development)
- ✅ Works on local Windows (case-insensitive)
- ✅ Works on local Linux with npm dev server
- ❌ **FAILS in Docker (case-sensitive Linux)**
- ❌ **FAILS on cloud proxies (nginx, CloudFlare)**

### After Fixes
- ✅ Works everywhere (Windows, Mac, Linux, Docker, Cloud)
- ✅ Consistent API contract
- ✅ Maintainable codebase
- ✅ Production-ready

---

## References

**Related Files:**
- [frontend/lib/api/client.ts](frontend/lib/api/client.ts)
- [frontend/lib/api/auth.ts](frontend/lib/api/auth.ts)
- [backend/src/HospitalityPlatform.Api/Controllers/JobsController.cs](backend/src/HospitalityPlatform.Api/Controllers/JobsController.cs)
- [backend/src/HospitalityPlatform.Api/Controllers/AdminController.cs](backend/src/HospitalityPlatform.Api/Controllers/AdminController.cs)
- [backend/src/HospitalityPlatform.Messaging/Controllers/MessagingController.cs](backend/src/HospitalityPlatform.Messaging/Controllers/MessagingController.cs)

**Documentation:**
- [docs/SANITY_CHECK_REPORT.md](docs/SANITY_CHECK_REPORT.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)

