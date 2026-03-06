import { ROUTES } from '../routes';

export const adminNav = [
    { label: 'Dashboard', icon: 'grid', href: ROUTES.ADMIN.HOME },
    { label: 'Users', icon: 'users', href: ROUTES.ADMIN.USERS },
    { label: 'Organizations', icon: 'shield', href: ROUTES.ADMIN.ORGANIZATIONS },
    { label: 'Moderation', icon: 'shield', href: ROUTES.ADMIN.MODERATION },
    { label: 'Subscriptions', icon: 'credit-card', href: ROUTES.ADMIN.SUBSCRIPTIONS },
    { label: 'Audit', icon: 'file-text', href: ROUTES.ADMIN.AUDIT },
    { label: 'Settings', icon: 'settings', href: ROUTES.ADMIN.SETTINGS },
];
