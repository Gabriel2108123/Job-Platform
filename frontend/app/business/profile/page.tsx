'use client';

import { useState, useEffect } from 'react';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getOrganizationProfile, updateOrganizationProfile, OrganizationProfile } from '@/lib/api/organization';

const INDUSTRY_OPTIONS = [
    'Hotels & Resorts',
    'Restaurants',
    'Cafes & Coffee Shops',
    'Bars & Pubs',
    'Catering Services',
    'Event Venues',
    'Fast Food',
    'Fine Dining',
    'Tourism & Travel',
    'Other Hospitality',
];

const COMPANY_SIZE_OPTIONS = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '500+ employees',
];

export default function BusinessProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'company' | 'contact' | 'settings'>('company');
    const [profile, setProfile] = useState<OrganizationProfile | null>(null);
    const [formData, setFormData] = useState({
        businessName: '',
        location: '',
        website: '',
        industry: '',
        companySize: '',
        description: '',
        pointOfContactName: '',
        pointOfContactEmail: '',
        pointOfContactPhone: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getOrganizationProfile();
            setProfile(data);
            setFormData({
                businessName: data.businessName || '',
                location: data.location || '',
                website: data.website || '',
                industry: data.industry || '',
                companySize: data.companySize || '',
                description: data.description || '',
                pointOfContactName: data.pointOfContactName || '',
                pointOfContactEmail: data.pointOfContactEmail || '',
                pointOfContactPhone: data.pointOfContactPhone || '',
            });
        } catch (error) {
            console.error('Failed to load organization profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updatedProfile = await updateOrganizationProfile(formData);
            setProfile(updatedProfile);
            setEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
        );
    }

    return (
        <RequireRole allowedRoles={['BusinessOwner', 'Staff']}>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <Card className="overflow-hidden mb-8 shadow-xl border-none">
                        <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-navy)] h-32 relative">
                            <div className="absolute -bottom-12 left-8">
                                <div className="w-28 h-28 rounded-2xl bg-white p-1 shadow-lg ring-4 ring-white">
                                    <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-4xl border-2 border-dashed border-gray-200">
                                        {profile?.logoUrl ? (
                                            <img src={profile.logoUrl} alt="Company Logo" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            '🏢'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardBody className="pt-16 pb-8 px-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-[var(--brand-navy)]">
                                        {profile?.businessName || profile?.name || 'Company Profile'}
                                    </h1>
                                    <p className="text-gray-500 font-medium mt-1">
                                        {profile?.industry || 'Hospitality Business'}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    {editing && (
                                        <Button variant="outline" onClick={() => setEditing(false)}>
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        variant={editing ? 'primary' : 'outline'}
                                        onClick={() => (editing ? handleSaveProfile() : setEditing(true))}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
                                    </Button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                                <button
                                    className={`px-4 py-2 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'company'
                                            ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setActiveTab('company')}
                                >
                                    Company Information
                                </button>
                                <button
                                    className={`px-4 py-2 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'contact'
                                            ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setActiveTab('contact')}
                                >
                                    Contact Information
                                </button>
                                <button
                                    className={`px-4 py-2 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'settings'
                                            ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    onClick={() => setActiveTab('settings')}
                                >
                                    Account Settings
                                </button>
                            </div>

                            {/* Company Information Tab */}
                            {activeTab === 'company' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                Business Name
                                            </label>
                                            <Input
                                                name="businessName"
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                                disabled={!editing}
                                                placeholder="Your Business Name"
                                                className="py-3 px-4"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                Location
                                            </label>
                                            <Input
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                disabled={!editing}
                                                placeholder="City, Country"
                                                className="py-3 px-4"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                Industry
                                            </label>
                                            <select
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleInputChange}
                                                disabled={!editing}
                                                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                                            >
                                                <option value="">Select Industry</option>
                                                {INDUSTRY_OPTIONS.map((industry) => (
                                                    <option key={industry} value={industry}>
                                                        {industry}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                Company Size
                                            </label>
                                            <select
                                                name="companySize"
                                                value={formData.companySize}
                                                onChange={handleInputChange}
                                                disabled={!editing}
                                                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                                            >
                                                <option value="">Select Size</option>
                                                {COMPANY_SIZE_OPTIONS.map((size) => (
                                                    <option key={size} value={size}>
                                                        {size}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                            Website
                                        </label>
                                        <Input
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            placeholder="https://www.example.com"
                                            className="py-3 px-4"
                                            type="url"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                            Company Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            placeholder="Tell job seekers about your company, culture, and what makes you unique..."
                                            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Contact Information Tab */}
                            {activeTab === 'contact' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
                                        <strong>Point of Contact:</strong> This information will be shown to job applicants when they apply to your positions.
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                            Contact Person Name
                                        </label>
                                        <Input
                                            name="pointOfContactName"
                                            value={formData.pointOfContactName}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            placeholder="Hiring Manager Name"
                                            className="py-3 px-4"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                Contact Email
                                            </label>
                                            <Input
                                                name="pointOfContactEmail"
                                                value={formData.pointOfContactEmail}
                                                onChange={handleInputChange}
                                                disabled={!editing}
                                                placeholder="hiring@company.com"
                                                className="py-3 px-4"
                                                type="email"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                Contact Phone
                                            </label>
                                            <Input
                                                name="pointOfContactPhone"
                                                value={formData.pointOfContactPhone}
                                                onChange={handleInputChange}
                                                disabled={!editing}
                                                placeholder="+44 20 1234 5678"
                                                className="py-3 px-4"
                                                type="tel"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Settings Tab */}
                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="font-bold text-gray-900 mb-3">Account Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Organization ID:</span>
                                                <span className="font-mono text-gray-900">{profile?.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Created:</span>
                                                <span className="text-gray-900">
                                                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Last Updated:</span>
                                                <span className="text-gray-900">
                                                    {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Card>
                                        <CardBody className="p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">Security</h3>
                                            <Button variant="outline" className="w-full justify-between">
                                                <span>Change Password</span>
                                                <span>→</span>
                                            </Button>
                                        </CardBody>
                                    </Card>

                                    <Card>
                                        <CardBody className="p-6">
                                            <h3 className="font-bold text-gray-900 mb-4">Notification Preferences</h3>
                                            <Button variant="outline" className="w-full justify-between">
                                                <span>Manage Notifications</span>
                                                <span>→</span>
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </RequireRole>
    );
}
