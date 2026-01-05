# Billing & Entitlements Frontend Implementation

## Overview
Complete business owner UI for managing Stripe subscriptions and viewing plan-based feature limits. Three main pages with consistent styling, error handling, and role-based access control.

## Pages Implemented

### 1. Plans List & Subscribe
**URL**: `/billing/plans`

**Features**:
- Display all available plans (Free, Pro, Enterprise)
- Show plan name, description, and monthly price
- One-click subscription with loading state
- Error messaging for failed subscriptions
- Link to current subscription if exists
- Business owner role check

**Components**:
- `PlansComponent.tsx` - Main billing plans component
- `app/billing/plans/page.tsx` - Next.js page wrapper
- API: `getPlans()`, `createSubscription()`

**User Flow**:
1. Business owner navigates to `/billing/plans`
2. Sees all available plans with pricing
3. Clicks "Subscribe" on chosen plan
4. Subscription created via API
5. Redirected to subscription management page

### 2. Current Subscription Management
**URL**: `/billing/subscription`

**Features**:
- Display active subscription details (plan, status, price, dates)
- Status badge (Active, Cancelled, etc.)
- Change plan button (links to plans page)
- Cancel subscription with confirmation dialog
- Shows next billing date
- Empty state if no subscription
- Business owner role check

**Components**:
- `SubscriptionComponent.tsx` - Subscription management component
- `app/billing/subscription/page.tsx` - Next.js page wrapper
- API: `getSubscription()`, `cancelSubscription()`

**User Flow**:
1. Business owner navigates to `/billing/subscription`
2. Sees current subscription details
3. Can upgrade by clicking "Change Plan"
4. Can cancel with confirmation
5. Redirected to plans if no subscription
6. Can view entitlements from this page

### 3. Entitlements Dashboard
**URL**: `/billing/entitlements`

**Features**:
- Display all plan limits for organization
- Show usage for each limit type:
  - Jobs Posting Limit
  - Candidate Search Limit
  - Staff Seats
- Usage bars with percentage indicators
- Color-coded warnings (green < yellow < red)
- "At limit" / "Near limit" alerts
- Monthly reset dates shown
- Upgrade prompts when near limits
- Business owner role check

**Components**:
- `EntitlementsComponent.tsx` - Entitlements dashboard component
- `app/billing/entitlements/page.tsx` - Next.js page wrapper
- API: `getEntitlements()`

**User Flow**:
1. Business owner navigates to `/billing/entitlements`
2. Sees all feature limits for current plan
3. Views usage progress bars
4. Gets warned if near limits
5. Can upgrade plan if needed
6. Sees monthly reset dates

## API Integration

### Billing API Endpoints
```typescript
// Get all available plans
GET /api/billing/plans
Response: Plan[]

// Get subscription for organization
GET /api/billing/subscription/{organizationId}
Response: Subscription | null

// Create new subscription
POST /api/billing/subscribe
Body: { organizationId, planType, stripePaymentMethodId }
Response: Subscription

// Cancel subscription
DELETE /api/billing/subscription/{organizationId}
Response: void
```

### Entitlements API Endpoints
```typescript
// Get all entitlements for organization
GET /api/entitlements/{organizationId}
Response: EntitlementLimit[]

// Check specific limit status
GET /api/entitlements/{organizationId}/check/{limitType}
Response: { limitType, hasReachedLimit, remainingLimit }
```

## Type Definitions

### Plan
```typescript
interface Plan {
  id: string;
  name: string;
  description: string;
  planType: string; // 'Free', 'Pro', 'Enterprise'
  priceInCents: number;
  isActive: boolean;
}
```

### Subscription
```typescript
interface Subscription {
  id: string;
  organizationId: string;
  stripeSubscriptionId: string;
  status: string; // 'Active', 'Cancelled', 'PastDue', etc.
  planType: string;
  startDate: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  priceInCents: number;
  trialEndsAt?: string;
}
```

### EntitlementLimit
```typescript
interface EntitlementLimit {
  id: string;
  organizationId: string;
  limitType: string; // 'JobsPostingLimit', 'CandidateSearchLimit', 'StaffSeats'
  maxLimit: number;
  currentUsage: number;
  remainingLimit: number;
  planType: string;
  resetDate?: string;
}
```

## Authentication & Authorization

### Requirements
- User must be authenticated (token in localStorage)
- Must have BusinessOwner or Admin role
- All pages check user role and redirect to login if not authenticated

### Implementation
```typescript
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!token || !storedUser) {
    router.push('/login');
    return;
  }

  // Check role if needed
  if (user && user.id === 'candidate') {
    return <ErrorMessage>You must be a business owner</ErrorMessage>;
  }
}, []);
```

## UI Components & Styling

### Design System
- **Framework**: Next.js 16+ with React 19+
- **Styling**: Tailwind CSS 4
- **Color Palette**:
  - Primary: Blue-600 (`#2563eb`)
  - Success: Green-500 (`#10b981`)
  - Warning: Yellow-500 (`#f59e0b`)
  - Error: Red-600 (`#dc2626`)
  - Background: Gray-50/100 (`#f9fafb`)

### Component Patterns

**Card Layout**:
```tsx
<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
  {content}
</div>
```

**Loading State**:
```tsx
if (loading) {
  return <div className="text-gray-500">Loading...</div>;
}
```

**Error State**:
```tsx
{error && (
  <div className="bg-red-50 border-l-4 border-red-400 p-4">
    <p className="text-red-700">{error}</p>
  </div>
)}
```

**Status Badge**:
```tsx
<span className={`px-3 py-1 rounded-full text-sm ${
  status === 'Active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-gray-100 text-gray-800'
}`}>
  {status}
</span>
```

**Progress Bar**:
```tsx
<div className="bg-gray-200 rounded-full h-3">
  <div
    className={`h-full rounded-full ${colorClass}`}
    style={{ width: `${Math.min(percent, 100)}%` }}
  />
</div>
```

## File Structure
```
frontend/
├── app/
│   └── billing/
│       ├── layout.tsx              # Billing pages layout
│       ├── plans/
│       │   └── page.tsx            # Plans list page
│       ├── subscription/
│       │   └── page.tsx            # Subscription management page
│       └── entitlements/
│           └── page.tsx            # Entitlements dashboard page
├── components/
│   └── billing/
│       ├── PlansComponent.tsx       # Plans display & subscription
│       ├── SubscriptionComponent.tsx # Subscription management
│       └── EntitlementsComponent.tsx # Entitlements dashboard
├── lib/
│   └── api/
│       ├── billing.ts              # Billing API client
│       └── entitlements.ts         # Entitlements API client
└── components/layout/
    └── Header.tsx                  # Updated with Billing link
```

## State Management

### Local State
- `loading` - Loading state for API calls
- `error` - Error messages from API
- `subscribing` - Loading state for subscription action
- `plans/subscription/entitlements` - Data from API

### Session State (localStorage)
- `user` - Current user object with organizationId
- `token` - JWT authentication token

## Error Handling

### API Errors
- Network failures
- 4xx/5xx responses
- Timeout errors
- JSON parsing failures

### User Errors
- No subscription available
- Limit reached
- Failed subscription creation
- Failed cancellation

### UI Feedback
- Error banners with context
- Loading spinners during operations
- Success redirects
- Confirmation dialogs for destructive actions

## Features & Behaviors

### Plans Page
✅ Display all active plans
✅ Show pricing in dollars
✅ Subscribe button with loading state
✅ Error handling for failed subscriptions
✅ Link to current subscription
✅ Role-based access control

### Subscription Page
✅ Show active subscription details
✅ Display status with color coding
✅ Monthly price and next billing date
✅ Change plan button
✅ Cancel with confirmation dialog
✅ Redirect to plans if no subscription
✅ Link to entitlements dashboard
✅ Role-based access control

### Entitlements Dashboard
✅ List all feature limits
✅ Show current usage vs. max
✅ Usage progress bars (green/yellow/red)
✅ Percentage calculations
✅ "At limit" warnings in red
✅ "Near limit" warnings in yellow (80%+)
✅ Monthly reset dates
✅ Upgrade prompts
✅ Unlimited ("∞") for Enterprise
✅ Role-based access control

### Header Navigation
✅ Added "Billing" link for authenticated users
✅ Consistent with existing navigation
✅ Points to subscription management page

## Testing Checklist

### Authentication
- [ ] Unauthenticated users redirected to login
- [ ] Candidate role blocked from billing pages
- [ ] BusinessOwner/Admin role allowed

### Plans Page
- [ ] Plans load from API
- [ ] Pricing displays correctly
- [ ] Subscribe button creates subscription
- [ ] Error shown if subscription fails
- [ ] Loading state during subscription

### Subscription Page
- [ ] Subscription loads from API
- [ ] Details display correctly
- [ ] Cancel button works with confirmation
- [ ] Cancellation updates UI
- [ ] Empty state shows if no subscription
- [ ] Links to plans work

### Entitlements Dashboard
- [ ] Entitlements load from API
- [ ] Usage bars calculate correctly
- [ ] Colors change based on usage (green < yellow < red)
- [ ] Warnings show when appropriate
- [ ] Unlimited Enterprise limits display "∞"
- [ ] Reset dates display correctly

### Navigation
- [ ] All links between pages work
- [ ] Header Billing link functional
- [ ] Back buttons work
- [ ] URL routing correct

## Future Enhancements

1. **Payment Methods**: Add Stripe payment method UI
2. **Billing History**: Invoice and payment history view
3. **Usage Analytics**: Charts for usage trends
4. **Notifications**: Alerts when approaching limits
5. **Team Management**: View team members using seats
6. **Auto-scaling**: Automatic usage tracking
7. **Custom Limits**: Enterprise custom limits support
8. **Webhooks**: Real-time limit updates

## Known Limitations

1. **Stripe Integration**: Currently uses placeholder payment method ID
2. **Real-time Updates**: Requires manual refresh to see updated limits
3. **Session Management**: Uses localStorage (should migrate to secure session)
4. **Role Detection**: Simple ID-based role check (should use proper auth context)

## Dependencies
- `next`: ^16.1.1
- `react`: ^19.2.3
- `tailwindcss`: ^4
- Existing `lib/api/client.ts` for API requests
- Existing `lib/types/auth.ts` for user types
