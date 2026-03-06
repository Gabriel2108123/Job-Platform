import { Role, ROLES } from '@/lib/roles';
import { candidateNav } from './candidateNav';
import { businessOwnerNav } from './businessOwnerNav';
import { businessStaffNav } from './businessStaffNav';
import { adminNav } from './adminNav';
import { supportNav } from './supportNav';

export function getNavigationForUser(role: Role | null, permissions: string[] = []) {
    if (!role) return [];

    switch (role) {
        case ROLES.Candidate:
            return candidateNav;

        case ROLES.BusinessOwner:
            return businessOwnerNav;

        case ROLES.Staff:
            // Business staff nav can be further filtered by permissions if needed
            // For now, we return the base staff nav
            return businessStaffNav;

        case ROLES.Admin:
            return adminNav;

        case ROLES.Support:
            return supportNav;

        default:
            return [];
    }
}
