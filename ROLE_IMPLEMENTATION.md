# Role-Based Personalization Implementation Guide

**Date Created:** January 13, 2026  
**Status:** ✅ Implementation Complete

---

## Overview

A comprehensive role-based system has been implemented for YokeConnect frontend, enabling personalized user experiences based on the 5 backend roles: **Candidate**, **BusinessOwner**, **Staff**, **Support**, and **Admin**.

---

## Architecture

### 1. **Core Role System** (`lib/roles.ts`)

#### Features:
- **Role Constants**: Defined 5 roles matching backend: Candidate, BusinessOwner, Staff, Support, Admin
- **Role Hierarchy**: Numeric hierarchy for permission checking
- **Navigation Mapping**: Each role has custom navigation items (3-7 items per role)
- **Feature Access**: Define which features are available per role
- **Page Access Control**: Whitelist of accessible routes per role
- **Display Helpers**: Functions for role display names and colors

#### Key Exports:
```typescript
ROLES // Role constants
ROLE_HIERARCHY // Numeric hierarchy (Candidate=1, Admin=5)
ROLE_NAVIGATION // Navigation items per role
ROLE_ACCESSIBLE_PAGES // Whitelisted routes per role
ROLE_FEATURES // Features available per role
hasFeature(role, featureName) // Check feature access
canAccessPage(role, pathname) // Check page access
getRoleDisplayName(role) // Get human-readable name
getRoleColor(role) // Get role-specific color for UI
```

---

### 2. **Custom Hook** (`lib/hooks/useUserRole.ts`)

#### Purpose:
Provides role information and helper functions throughout the app

#### Usage:
```typescript
const { 
  role,              // Current user's role
  loading,           // Loading state
  isCandidate,       // Boolean checks
  isAdmin,
  displayName,       // "Job Seeker", "Administrator", etc.
  color,            // "blue", "purple", etc.
  features,         // Available features
  navigationLinks,  // Role-specific navigation
  hasFeature(name), // Check feature access
  canAccessPage(path) // Check page access
} = useUserRole();
```

---

### 3. **Role-Based Access Control** (`components/auth/RoleBasedAccess.tsx`)

#### Components:

**RequireRole** - Restricts page access by role
```typescript
<RequireRole allowedRoles={['Candidate']}>
  <CandidateProfilePage />
</RequireRole>
```

**RoleBasedRender** - Conditional rendering based on role
```typescript
<RoleBasedRender>
  {(role) => role === 'Admin' ? <AdminDashboard /> : <UserDashboard />}
</RoleBasedRender>
```

---

## Role Navigation Maps

### Candidate (Job Seeker)
- 📋 Browse Jobs `/jobs`
- 📝 My Applications `/applications`
- 💬 Messages `/messages`
- 📄 Documents `/documents`
- 👤 Profile `/profile`

### BusinessOwner
- 📊 Dashboard `/business`
- 📋 Job Posts `/business/jobs`
- 🔄 Hiring Pipeline `/business/pipeline`
- 👥 Team Members `/business/team`
- 💳 Billing `/business/billing`
- 💬 Messages `/messages`

### Staff (Business Staff)
- 📊 Dashboard `/business`
- 📋 Job Posts `/business/jobs`
- 🔄 Hiring Pipeline `/business/pipeline`
- 👥 Team `/business/team`
- 💬 Messages `/messages`

### Support (Support Agent)
- 📊 Dashboard `/support`
- 🎫 Support Tickets `/support/tickets`
- 👥 Users `/support/users`
- 📊 Reports `/support/reports`
- 💬 Messages `/messages`

### Admin (Administrator)
- 📊 Dashboard `/admin`
- 👥 Users `/admin/users`
- 🏢 Organizations `/admin/organizations`
- 💳 Subscriptions `/admin/subscriptions`
- 📋 Audit Logs `/admin/audit-logs`
- 🎫 Waitlist `/admin/waitlist`
- 🆘 Support `/admin/support`

---

## New Pages Created

### 1. **Candidate Profile Page** (`app/profile/page.tsx`)
- Profile editing (first name, last name)
- Statistics dashboard (applications, interviews, offers)
- Recent activity timeline
- RequireRole protection: Candidate only

### 2. **Support Dashboard** (`app/support/page.tsx`)
- Stats overview (open tickets, resolved, response time, satisfaction)
- Quick action buttons
- Recent tickets list
- Knowledge base sections
- RequireRole protection: Support, Admin

### 3. **Support Tickets Page** (`app/support/tickets/page.tsx`)
- Ticket list with filtering (open, in-progress, resolved)
- Status and priority badges
- Quick ticket creation
- Mock data for demonstration
- RequireRole protection: Support, Admin

### 4. **Business Team Management** (`app/business/team/page.tsx`)
- Team member roster
- Team statistics (total, active, pending invites)
- Invite new team members
- Remove team members functionality
- Role-based member management
- RequireRole protection: BusinessOwner, Staff, Admin

---

## Enhanced Components

### 1. **Navigation Component** (`components/layout/Navigation.tsx`)
**Changes:**
- Uses `useUserRole()` hook instead of deprecated methods
- Dynamic navigation items per role
- User role display in header
- Responsive mobile menu with role-aware items
- Automatic role-specific action buttons

**Before:** Static links for each role
**After:** Centralized ROLE_NAVIGATION maps + dynamic rendering

### 2. **Home Page** (`app/page.tsx`)
**Changes:**
- Personalized welcome message with role
- Role-specific call-to-action button
- Emoji indicators for each role (🎯 Candidate, 📊 BusinessOwner, etc.)
- Loading state awareness

**Example:**
```
Welcome back, Administrator!
⚙️ Manage the platform and users
[Open Admin Dashboard →]
```

---

## Feature Matrix

| Feature | Candidate | BusinessOwner | Staff | Support | Admin |
|---------|-----------|---------------|-------|---------|-------|
| Browse Jobs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Apply to Jobs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Post Jobs | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Applications | ✅ | ✅ | ✅ | ❌ | ✅ |
| Hiring Pipeline | ❌ | ✅ | ✅ | ❌ | ❌ |
| Team Management | ❌ | ✅ | ❌ | ❌ | ❌ |
| Billing | ❌ | ✅ | ❌ | ❌ | ❌ |
| Support Tickets | ❌ | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ❌ | ✅ |
| Organization Mgmt | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Usage Examples

### Protecting a Page
```typescript
'use client';
import { RequireRole } from '@/components/auth/RoleBasedAccess';

export default function AdminPage() {
  return (
    <RequireRole allowedRoles={['Admin']}>
      <AdminContent />
    </RequireRole>
  );
}
```

### Checking Features
```typescript
const { hasFeature } = useUserRole();

if (hasFeature('create_jobs')) {
  return <CreateJobButton />;
}
```

### Conditional Navigation
```typescript
const { navigationLinks } = useUserRole();

<nav>
  {navigationLinks.map(link => (
    <Link key={link.href} href={link.href}>
      {link.label}
    </Link>
  ))}
</nav>
```

### Getting User Info
```typescript
const { role, displayName, color, loading } = useUserRole();

if (loading) return <Spinner />;

<span className={`text-${color}-600`}>
  Welcome, {displayName}!
</span>
```

---

## File Structure

```
frontend/
├── lib/
│   ├── roles.ts                    // Role system core
│   ├── hooks/
│   │   └── useUserRole.ts          // Custom hook
│   └── auth-helpers.ts             // (existing, still used)
├── components/
│   ├── auth/
│   │   └── RoleBasedAccess.tsx      // Access control components
│   ├── layout/
│   │   └── Navigation.tsx           // (updated)
│   └── dashboard/
│       └── RoleDashboardSection.tsx // (new dashboard widget)
└── app/
    ├── page.tsx                     // (updated with role personalization)
    ├── profile/
    │   └── page.tsx                 // (new Candidate profile)
    ├── support/
    │   ├── page.tsx                 // (new Support dashboard)
    │   └── tickets/
    │       └── page.tsx             // (new Support tickets)
    └── business/
        └── team/
            └── page.tsx             // (new Team management)
```

---

## Integration Checklist

- ✅ Role constants defined and exported
- ✅ useUserRole hook created and functional
- ✅ RequireRole component implemented
- ✅ Navigation updated with role awareness
- ✅ Home page personalization added
- ✅ Candidate profile page created
- ✅ Support dashboard created
- ✅ Support tickets page created
- ✅ Business team management page created
- ✅ Role-based navigation rendering
- ✅ Feature access checking system
- ✅ Page access control lists

---

## TODO / Future Enhancements

1. **Backend Integration**
   - [ ] Connect to actual API endpoints for stats and data
   - [ ] Implement real ticket fetching
   - [ ] Implement team member management API calls
   - [ ] Add profile update endpoint

2. **Additional Pages**
   - [ ] Support user management page
   - [ ] Support reports page
   - [ ] Role-specific dashboards with real data
   - [ ] Admin role management interface

3. **Improvements**
   - [ ] Add role-based breadcrumbs
   - [ ] Implement role-based search filters
   - [ ] Add role-specific notifications
   - [ ] Create role transition flows (e.g., Candidate → BusinessOwner)

4. **UI/UX Enhancements**
   - [ ] Add role indicator badges throughout UI
   - [ ] Create role-specific color schemes
   - [ ] Implement role-based tutorial flows
   - [ ] Add role-specific help/documentation

---

## Testing

### Manual Testing Checklist

1. **Login as different roles and verify:**
   - ✅ Navigation shows correct items
   - ✅ Protected pages redirect properly
   - ✅ Role display in header is correct
   - ✅ Home page shows role-appropriate CTA

2. **Test each role:**
   - [ ] Candidate: Can see jobs/applications, restricted from admin
   - [ ] BusinessOwner: Can see business tools, restricted from support
   - [ ] Staff: Can see business tools (limited), no team management
   - [ ] Support: Can see support tickets, not business features
   - [ ] Admin: Can access all admin features

3. **Test access control:**
   - [ ] Direct URL access to restricted pages redirects
   - [ ] Feature checks work correctly
   - [ ] Page access lists are enforced

---

## Notes

- All role logic is centralized in `lib/roles.ts` for easy maintenance
- The `useUserRole()` hook uses localStorage for role retrieval (set at login)
- Loading states are properly handled in all components
- Components gracefully degrade when role is not available
- Mobile navigation respects role-based navigation maps
- All new pages have been created with responsive design

---

## How to Add a New Page for a Role

1. Create new page file: `app/[section]/[page]/page.tsx`
2. Import RequireRole: `import { RequireRole } from '@/components/auth/RoleBasedAccess'`
3. Wrap component with RequireRole:
   ```typescript
   export default function NewPage() {
     return (
       <RequireRole allowedRoles={['RoleName']}>
         <PageContent />
       </RequireRole>
     );
   }
   ```
4. Add route to ROLE_ACCESSIBLE_PAGES in `lib/roles.ts`
5. Add navigation item to ROLE_NAVIGATION in `lib/roles.ts`

---

## Deployment Notes

- No database migrations needed (frontend only)
- No backend API changes required (uses existing auth storage)
- Works with current JWT token structure
- Backward compatible with existing authentication
- No new environment variables needed

---

**Implementation completed successfully! 🎉**
