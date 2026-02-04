import { apiRequest } from './client';

export interface OrganizationProfile {
    id: string;
    name: string;
    businessName?: string;
    location?: string;
    website?: string;
    industry?: string;
    companySize?: string;
    pointOfContactName?: string;
    pointOfContactEmail?: string;
    pointOfContactPhone?: string;
    logoUrl?: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface UpdateOrganizationProfileRequest {
    businessName?: string;
    location?: string;
    website?: string;
    industry?: string;
    companySize?: string;
    pointOfContactName?: string;
    pointOfContactEmail?: string;
    pointOfContactPhone?: string;
    description?: string;
}

/**
 * Get current organization's profile
 */
export async function getOrganizationProfile(): Promise<OrganizationProfile> {
    const response = await apiRequest<OrganizationProfile>('/api/organizations/profile');
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data returned');
    return response.data;
}

/**
 * Update current organization's profile
 */
export async function updateOrganizationProfile(
    data: UpdateOrganizationProfileRequest
): Promise<OrganizationProfile> {
    const response = await apiRequest<OrganizationProfile>('/api/organizations/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data returned');
    return response.data;
}
