/**
 * Centralized route naming constants for all roles.
 */

export const ROUTES = {
    // Public
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    WAITLIST: '/waitlist',

    // Candidate
    CANDIDATE: {
        HOME: '/candidate',
        JOBS: '/candidate/jobs',
        APPLICATIONS: '/candidate/applications',
        MESSAGES: '/candidate/messages',
        DOCUMENTS: '/candidate/documents',
        NETWORK: '/candidate/network',
        PROFILE: '/candidate/profile',
        SETTINGS: '/candidate/settings',
    },

    // Business
    BUSINESS: {
        HOME: '/business',
        JOBS: '/business/jobs',
        JOB_DETAIL: (id: string) => `/business/jobs/${id}`,
        CANDIDATES: '/business/candidates',
        CANDIDATE_DETAIL: (id: string) => `/business/candidates/${id}`,
        MESSAGES: '/business/messages',
        TEAM: '/business/team',
        BILLING: '/business/billing',
        SETTINGS: '/business/settings',
        ACTIVITY: '/business/activity',
    },

    // Admin
    ADMIN: {
        HOME: '/admin',
        USERS: '/admin/users',
        ORGANIZATIONS: '/admin/organizations',
        MODERATION: '/admin/moderation',
        SUBSCRIPTIONS: '/admin/subscriptions',
        AUDIT: '/admin/audit',
        SETTINGS: '/admin/settings',
        VERIFICATION: '/admin/verification',
        REPORTS: '/admin/reports',
        CONFIG: '/admin/config',
    },

    // Support
    SUPPORT: {
        HOME: '/support',
        TICKETS: '/support/tickets',
        USERS: '/support/users',
        ORGANIZATIONS: '/support/organizations',
        SAFE_ACTIONS: '/support/safe-actions',
        KB: '/support/kb',
    },

    // Shared
    PROFILE: '/profile',
    SETTINGS: '/settings',
    NOT_FOUND: '/404',
    NO_PERMISSION: '/no-permission',
} as const;
