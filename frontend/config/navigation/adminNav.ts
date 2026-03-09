import { ROUTES } from '../routes';

export const adminNav = [
    { label: 'Dashboard', icon: 'grid', href: ROUTES.ADMIN.HOME },
    { label: 'Users', icon: 'users', href: ROUTES.ADMIN.USERS },
    { label: 'Organizations', icon: 'shield', href: ROUTES.ADMIN.ORGANIZATIONS },
    { label: 'Moderation', icon: 'shield', href: ROUTES.ADMIN.MODERATION },
    { label: 'Subscriptions', icon: 'credit-card', href: ROUTES.ADMIN.SUBSCRIPTIONS },
    { label: 'Audit Logs', icon: 'file-text', href: ROUTES.ADMIN.AUDIT },
    { label: 'Support', icon: 'life-buoy', href: ROUTES.SUPPORT.HOME },
];
