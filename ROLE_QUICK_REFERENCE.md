# Role-Based System - Quick Reference

## Import the Hook
```typescript
import { useUserRole } from '@/lib/hooks/useUserRole';
```

## Use the Hook
```typescript
const { 
  role,              // 'Candidate' | 'BusinessOwner' | 'Staff' | 'Support' | 'Admin'
  loading,           // boolean
  isCandidate,       // boolean
  isBusinessOwner,   // boolean
  isStaff,           // boolean
  isSupport,         // boolean
  isAdmin,           // boolean
  isBusinessUser,    // boolean (BusinessOwner or Staff)
  displayName,       // 'Job Seeker' | 'Business Owner' | 'Staff Member' | 'Support Agent' | 'Administrator'
  color,             // 'blue' | 'purple' | 'green' | 'orange' | 'red'
  features,          // Feature[] - array of available features
  navigationLinks,   // NavigationItem[] - array of nav items for this role
  hasFeature(name),  // (name: string) => boolean
  canAccessPage(path) // (path: string) => boolean
} = useUserRole();
```

## Protect a Page
```typescript
import { RequireRole } from '@/components/auth/RoleBasedAccess';

<RequireRole allowedRoles={['Admin']}>
  <AdminPage />
</RequireRole>
```

## Conditional Rendering
```typescript
import { RoleBasedRender } from '@/components/auth/RoleBasedAccess';

<RoleBasedRender>
  {(role) => (
    role === 'Admin' ? <AdminView /> : <UserView />
  )}
</RoleBasedRender>
```

## Check Feature Access
```typescript
const { hasFeature } = useUserRole();

{hasFeature('create_jobs') && <CreateJobButton />}
```

## Role Values
```typescript
'Candidate'      // Job seeker
'BusinessOwner'  // Hiring manager
'Staff'          // Team member (can't manage team/billing)
'Support'        // Support agent
'Admin'          // Administrator
```

## Display Names
```typescript
'Candidate' → 'Job Seeker'
'BusinessOwner' → 'Business Owner'
'Staff' → 'Staff Member'
'Support' → 'Support Agent'
'Admin' → 'Administrator'
```

## Colors by Role
```typescript
'Candidate' → 'blue'
'BusinessOwner' → 'purple'
'Staff' → 'green'
'Support' → 'orange'
'Admin' → 'red'
```

## Navigation Items Per Role

### Candidate (5 items)
- Browse Jobs
- My Applications
- Messages
- Documents
- Profile

### BusinessOwner (6 items)
- Dashboard
- Job Posts
- Hiring Pipeline
- Team Members
- Billing
- Messages

### Staff (5 items)
- Dashboard
- Job Posts
- Hiring Pipeline
- Team
- Messages

### Support (5 items)
- Dashboard
- Support Tickets
- Users
- Reports
- Messages

### Admin (7 items)
- Dashboard
- Users
- Organizations
- Subscriptions
- Audit Logs
- Waitlist
- Support

## Feature Access Examples

```typescript
// Check specific features
if (hasFeature('create_jobs')) { /* ... */ }
if (hasFeature('messaging')) { /* ... */ }
if (hasFeature('team_management')) { /* ... */ }
if (hasFeature('support_tickets')) { /* ... */ }
if (hasFeature('user_management')) { /* ... */ }
```

## Common Patterns

### Show/Hide Based on Role
```typescript
const { isAdmin } = useUserRole();

return (
  <div>
    {isAdmin && <AdminPanel />}
    {!isAdmin && <UserPanel />}
  </div>
);
```

### Show/Hide Based on Feature
```typescript
const { hasFeature } = useUserRole();

return (
  <div>
    {hasFeature('billing_management') && <BillingSection />}
  </div>
);
```

### Redirect Non-Admin Users
```typescript
import { RequireRole } from '@/components/auth/RoleBasedAccess';

export default function AdminPanel() {
  return (
    <RequireRole allowedRoles={['Admin']}>
      <AdminContent />
    </RequireRole>
  );
}
```

### Dynamic Navigation
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

### Welcome Message
```typescript
const { role, displayName } = useUserRole();

return (
  <div>
    {role === 'Candidate' && '🎯'}
    {role === 'BusinessOwner' && '📊'}
    {role === 'Staff' && '📋'}
    {role === 'Support' && '🆘'}
    {role === 'Admin' && '⚙️'}
    
    Welcome back, {displayName}!
  </div>
);
```

## Files to Know

| File | Purpose |
|------|---------|
| `lib/roles.ts` | Core role system - roles, navigation, features, access lists |
| `lib/hooks/useUserRole.ts` | Custom hook for role access in components |
| `components/auth/RoleBasedAccess.tsx` | Access control components (RequireRole, RoleBasedRender) |
| `components/layout/Navigation.tsx` | Main navigation - uses role system |
| `app/page.tsx` | Home page - personalized per role |

## Example Complete Component

```typescript
'use client';

import { useUserRole } from '@/lib/hooks/useUserRole';
import { RequireRole } from '@/components/auth/RoleBasedAccess';

export default function Dashboard() {
  const { 
    role, 
    displayName, 
    isAdmin,
    hasFeature,
    navigationLinks 
  } = useUserRole();

  return (
    <RequireRole allowedRoles={['Admin', 'Support']}>
      <div className="dashboard">
        <h1>Welcome, {displayName}!</h1>
        
        {isAdmin && <AdminStats />}
        
        {hasFeature('support_tickets') && <SupportTickets />}
        
        <nav>
          {navigationLinks.map(link => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </RequireRole>
  );
}
```

---

**Need the full implementation guide?** See `ROLE_IMPLEMENTATION.md`
