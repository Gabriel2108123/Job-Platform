'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getMyProfile, updateMyProfile, ProfileDto, getWorkExperiences, WorkExperienceDto } from '@/lib/api/client';
import dynamic from 'next/dynamic';
import { ROUTES } from '@/config/routes';

// Dynamically import map to avoid SSR issues
const WorkerMap = dynamic(() => import('@/components/candidate/WorkerMap'), { ssr: false });

export default function CandidateProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState<ProfileDto | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        preferredJobRoleIds: [] as string[],
        countryOfResidence: '',
        address: '',
        primaryRole: '',
        currentStatus: 'Available',
        isOver16: false,
        isVisible: true,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await getMyProfile();
            if (res.success && res.data) {
                setProfile(res.data);
                setFormData({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    bio: res.data.bio || '',
                    preferredJobRoleIds: res.data.preferredJobRoleIds || [],
                    countryOfResidence: res.data.countryOfResidence || '',
                    address: res.data.address || '',
                    primaryRole: res.data.primaryRole || '',
                    currentStatus: res.data.currentStatus || 'Available',
                    isOver16: res.data.isOver16 || false,
                    isVisible: res.data.isVisible ?? true,
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = target.checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await updateMyProfile(formData);
            if (res.success && res.data) {
                setProfile(res.data);
                setEditing(false);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <RoleLayout
            pageTitle="My Profile"
            pageActions={
                <Button
                    variant={editing ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
                </Button>
            }
        >
            <div className="max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
                            <CardBody className="pt-0 px-6 pb-6">
                                <div className="flex justify-between items-end -mt-10 mb-6">
                                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shadow-lg">
                                        <div className="w-full h-full rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl">
                                            {profile?.profilePictureUrl ? (
                                                <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                                            ) : '👤'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">First Name</label>
                                        <Input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="rounded-xl border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Name</label>
                                        <Input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="rounded-xl border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Professional Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            placeholder="Share your hospitality journey..."
                                            className="w-full h-32 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardBody className="p-6">
                                <h3 className="font-black text-slate-900 dark:text-white mb-6">Work Status & Availability</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</label>
                                        <select
                                            name="currentStatus"
                                            value={formData.currentStatus}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none disabled:opacity-50"
                                        >
                                            <option value="Available">Available to Work</option>
                                            <option value="Employed">Employed (Open to offers)</option>
                                            <option value="NotLooking">Not Looking</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Role Title</label>
                                        <Input
                                            name="primaryRole"
                                            value={formData.primaryRole}
                                            onChange={handleInputChange}
                                            disabled={!editing}
                                            placeholder="e.g. Bartender"
                                            className="rounded-xl border-slate-200 dark:border-slate-700"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm">
                            <CardBody className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                        <div className="w-5 h-5 flex items-center justify-center font-bold">👁️</div>
                                    </div>
                                    <h3 className="font-black text-indigo-900 dark:text-indigo-300">Visibility</h3>
                                </div>
                                <label className="flex items-center gap-3 group cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isVisible"
                                        checked={formData.isVisible}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        Make my profile discoverable by businesses
                                    </span>
                                </label>
                            </CardBody>
                        </Card>

                        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardBody className="p-6">
                                <h3 className="font-black text-slate-900 dark:text-white mb-4">Identity</h3>
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-start gap-3">
                                    <div className="text-xl">🛡️</div>
                                    <div>
                                        <p className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest">Verified</p>
                                        <p className="text-[10px] text-emerald-700 dark:text-emerald-500 mt-1">Confirmed Over 16</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
