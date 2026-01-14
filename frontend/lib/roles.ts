/**
 * Role management constants and utilities
 */

export const ROLES = {
  Candidate: 'Candidate',
  BusinessOwner: 'BusinessOwner',
  Staff: 'Staff',
  Admin: 'Admin',
  Support: 'Support',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Role hierarchy for permission checking
 * Higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.Candidate]: 1,
  [ROLES.Staff]: 2,
  [ROLES.BusinessOwner]: 3,
  [ROLES.Support]: 4,
  [ROLES.Admin]: 5,
};

/**
 * Navigation items for each role
 */
export const ROLE_NAVIGATION: Record<Role, NavigationItem[]> = {
  [ROLES.Candidate]: [
    { href: '/jobs', label: 'Browse Jobs', icon: 'briefcase' },
    { href: '/applications', label: 'My Applications', icon: 'file-text' },
    { href: '/messages', label: 'Messages', icon: 'message-square' },
    { href: '/documents', label: 'Documents', icon: 'file' },
    { href: '/profile', label: 'Profile', icon: 'user' },
  ],
  [ROLES.BusinessOwner]: [
    { href: '/business', label: 'Dashboard', icon: 'grid' },
    { href: '/business/jobs', label: 'Job Posts', icon: 'briefcase' },
    { href: '/business/pipeline', label: 'Hiring Pipeline', icon: 'shuffle' },
    { href: '/business/team', label: 'Team Members', icon: 'users' },
    { href: '/business/billing', label: 'Billing', icon: 'credit-card' },
    { href: '/messages', label: 'Messages', icon: 'message-square' },
  ],
  [ROLES.Staff]: [
    { href: '/business', label: 'Dashboard', icon: 'grid' },
    { href: '/business/jobs', label: 'Job Posts', icon: 'briefcase' },
    { href: '/business/pipeline', label: 'Hiring Pipeline', icon: 'shuffle' },
    { href: '/business/team', label: 'Team', icon: 'users' },
    { href: '/messages', label: 'Messages', icon: 'message-square' },
  ],
  [ROLES.Support]: [
    { href: '/support', label: 'Dashboard', icon: 'grid' },
    { href: '/support/tickets', label: 'Support Tickets', icon: 'life-buoy' },
    { href: '/support/users', label: 'Users', icon: 'users' },
    { href: '/support/reports', label: 'Reports', icon: 'bar-chart-2' },
    { href: '/messages', label: 'Messages', icon: 'message-square' },
  ],
  [ROLES.Admin]: [
    { href: '/admin', label: 'Dashboard', icon: 'grid' },
    { href: '/admin/users', label: 'Users', icon: 'users' },
    { href: '/admin/organizations', label: 'Organizations', icon: 'building-2' },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: 'credit-card' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: 'log' },
    { href: '/admin/waitlist', label: 'Waitlist', icon: 'inbox' },
    { href: '/admin/support', label: 'Support', icon: 'life-buoy' },
  ],
};

/**
 * Accessible pages for each role
 */
export const ROLE_ACCESSIBLE_PAGES: Record<Role, string[]> = {
  [ROLES.Candidate]: [
    '/',
    '/jobs',
    '/applications',
    '/messages',
    '/documents',
    '/profile',
    '/register',
    '/login',
  ],
  [ROLES.BusinessOwner]: [
    '/',
    '/business',
    '/business/jobs',
    '/business/pipeline',
    '/business/team',
    '/business/billing',
    '/messages',
    '/logout',
  ],
  [ROLES.Staff]: [
    '/',
    '/business',
    '/business/jobs',
    '/business/pipeline',
    '/business/team',
    '/messages',
    '/logout',
  ],
  [ROLES.Support]: [
    '/',
    '/support',
    '/support/tickets',
    '/support/users',
    '/support/reports',
    '/messages',
    '/logout',
  ],
  [ROLES.Admin]: [
    '/',
    '/admin',
    '/admin/users',
    '/admin/organizations',
    '/admin/subscriptions',
    '/admin/audit-logs',
    '/admin/waitlist',
    '/admin/support',
    '/logout',
  ],
};

/**
 * Features available by role
 */
export const ROLE_FEATURES: Record<Role, Feature[]> = {
  [ROLES.Candidate]: [
    { name: 'browse_jobs', label: 'Browse Jobs' },
    { name: 'apply_jobs', label: 'Apply to Jobs' },
    { name: 'view_applications', label: 'View Applications' },
    { name: 'messaging', label: 'Messaging' },
    { name: 'document_management', label: 'Document Upload' },
    { name: 'profile_management', label: 'Profile Management' },
  ],
  [ROLES.BusinessOwner]: [
    { name: 'create_jobs', label: 'Create Job Posts' },
    { name: 'manage_jobs', label: 'Manage Job Posts' },
    { name: 'view_applications', label: 'View Applications' },
    { name: 'hiring_pipeline', label: 'Hiring Pipeline' },
    { name: 'team_management', label: 'Team Management' },
    { name: 'billing_management', label: 'Billing Management' },
    { name: 'messaging', label: 'Messaging' },
    { name: 'reports', label: 'Hiring Reports' },
  ],
  [ROLES.Staff]: [
    { name: 'view_jobs', label: 'View Job Posts' },
    { name: 'view_applications', label: 'View Applications' },
    { name: 'update_applications', label: 'Update Applications' },
    { name: 'hiring_pipeline', label: 'Hiring Pipeline' },
    { name: 'team_view', label: 'View Team' },
    { name: 'messaging', label: 'Messaging' },
  ],
  [ROLES.Support]: [
    { name: 'support_tickets', label: 'Support Tickets' },
    { name: 'user_support', label: 'User Support' },
    { name: 'escalations', label: 'Handle Escalations' },
    { name: 'messaging', label: 'Messaging' },
    { name: 'reports', label: 'Support Reports' },
  ],
  [ROLES.Admin]: [
    { name: 'user_management', label: 'User Management' },
    { name: 'organization_management', label: 'Organization Management' },
    { name: 'subscription_management', label: 'Subscription Management' },
    { name: 'audit_logs', label: 'Audit Logs' },
    { name: 'system_configuration', label: 'System Configuration' },
    { name: 'support_management', label: 'Support Management' },
    { name: 'analytics', label: 'Analytics & Reports' },
  ],
};

export interface NavigationItem {
  href: string;
  label: string;
  icon: string;
}

export interface Feature {
  name: string;
  label: string;
}

/**
 * Check if user has access to a feature
 */
export function hasFeature(role: Role | null, featureName: string): boolean {
  if (!role) return false;
  return ROLE_FEATURES[role]?.some((f) => f.name === featureName) ?? false;
}

/**
 * Check if user has access to a page
 */
export function canAccessPage(role: Role | null, pathname: string): boolean {
  if (!role) return false;
  const baseRoute = pathname.split('?')[0];
  return ROLE_ACCESSIBLE_PAGES[role]?.some((page) => baseRoute.startsWith(page)) ?? false;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role | null | string): string {
  if (!role) return 'Guest';
  const roleMap: Record<string, string> = {
    [ROLES.Candidate]: 'Job Seeker',
    [ROLES.BusinessOwner]: 'Business Owner',
    [ROLES.Staff]: 'Staff Member',
    [ROLES.Support]: 'Support Agent',
    [ROLES.Admin]: 'Administrator',
  };
  return roleMap[role] || role;
}

/**
 * Get role color for UI elements
 */
export function getRoleColor(role: Role | null | string): string {
  if (!role) return 'gray';
  const colorMap: Record<string, string> = {
    [ROLES.Candidate]: 'blue',
    [ROLES.BusinessOwner]: 'purple',
    [ROLES.Staff]: 'green',
    [ROLES.Support]: 'orange',
    [ROLES.Admin]: 'red',
  };
  return colorMap[role] || 'gray';
}
