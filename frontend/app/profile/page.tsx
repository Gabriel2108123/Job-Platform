'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getMyProfile, updateMyProfile, ProfileDto, getWorkExperiences, WorkExperienceDto } from '@/lib/api/client';
import dynamic from 'next/dynamic';
import WorkHistoryList from '@/components/candidate/WorkHistoryList';
import WorkerMapSettings from '@/components/candidate/WorkerMapSettings';
import { PotentialCoworkerList } from '@/components/candidate/PotentialCoworkerList';
import { ConnectionInbox } from '@/components/candidate/ConnectionInbox';
import JobRoleSelector from '@/components/JobRoleSelector';

// Dynamically import map to avoid SSR issues
const WorkerMap = dynamic(() => import('@/components/candidate/WorkerMap'), { ssr: false });

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'work-history' | 'worker-map' | 'my-network'>('profile');
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceDto[]>([]);
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
        });
      }
      setLoading(false);
    };
    fetchProfile();
    fetchWorkHistory();
  }, []);

  const fetchWorkHistory = async () => {
    try {
      const data = await getWorkExperiences();
      setWorkExperiences(data);
    } catch (error) {
      console.error("Failed to load work history", error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  return (
    <RequireRole allowedRoles={['Candidate', 'BusinessOwner', 'Staff', 'Admin', 'Support']}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <Card className="overflow-hidden mb-8 shadow-xl border-none">
            <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-navy)] h-40 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-lg ring-4 ring-white">
                  <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-4xl border-2 border-dashed border-gray-200">
                    {profile?.profilePictureUrl ? (
                      <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                    ) : '👤'}
                  </div>
                </div>
              </div>
            </div>
            <CardBody className="pt-16 pb-8 px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--brand-navy)]">
                    {profile?.firstName} {profile?.lastName}
                  </h1>
                  <p className="text-gray-500 font-medium">{profile?.email}</p>
                </div>
                <div className="flex gap-3">
                  {editing && (
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  )}
                  <Button
                    variant={editing ? 'primary' : 'outline'}
                    className={editing ? 'bg-[var(--brand-primary)]' : ''}
                    onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </div>
              </div>



              {/* Tabs Removed - Single View */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">First Name</label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="py-3 px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Last Name</label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="py-3 px-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Country of Residence</label>
                  <Input
                    name="countryOfResidence"
                    value={formData.countryOfResidence}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="e.g. United Kingdom"
                    className="py-3 px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Address</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="e.g. 123 High Street, London"
                    className="py-3 px-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Primary Role Title</label>
                  <Input
                    name="primaryRole"
                    value={formData.primaryRole}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="e.g. Head Chef, Bartender"
                    className="py-3 px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Current Status</label>
                  <div className="relative">
                    <select
                      name="currentStatus"
                      value={formData.currentStatus}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent appearance-none disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="Available">Available to Work</option>
                      <option value="Employed">Employed (Open to offers)</option>
                      <option value="NotLooking">Not Looking</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>


              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Share your hospitality journey, passions, and career goals..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 outline-none transition-all"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Preferred Job Roles</label>
                <p className="text-sm text-gray-500 mb-3">Select the hospitality roles you're interested in (up to 5)</p>
                {editing ? (
                  <JobRoleSelector
                    selectedRoleIds={formData.preferredJobRoleIds}
                    onChange={(roleIds) => setFormData(prev => ({ ...prev, preferredJobRoleIds: roleIds }))}
                    maxSelections={5}
                    placeholder="Select your preferred roles..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredJobRoleIds.length > 0 ? (
                      formData.preferredJobRoleIds.map((roleId) => (
                        <span key={roleId} className="px-3 py-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full text-sm font-medium">
                          Role ID: {roleId.slice(0, 8)}...
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">No preferred roles selected</span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 mb-4">
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <input
                    type="checkbox"
                    name="isOver16"
                    checked={formData.isOver16}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="h-5 w-5 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] border-gray-300 rounded"
                  />
                  <span className="text-gray-700 font-medium">I confirm that I am over 16 years of age</span>
                </label>
              </div>


              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-4 mt-8">
                <div className="text-3xl">🛡️</div>
                <div>
                  <h4 className="font-bold text-blue-900 leading-tight">Identity Verified</h4>
                  <p className="text-sm text-blue-700/70">Your account is fully verified and ready for professional placement.</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Work History Redirect Section */}
          <Card className="mb-8 border-none shadow-lg bg-white overflow-hidden group">
            <CardBody className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl shadow-sm">
                    💼
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Work History & Experience</h3>
                    <p className="text-gray-500 max-w-md">Your work history is managed within the Professional CV Builder to ensure your profile stands out to employers.</p>
                  </div>
                </div>
                <Link href="/dashboard/cv-builder">
                  <Button variant="primary" className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 px-6 py-2.5 h-auto text-sm font-bold shadow-md">
                    Update Work History →
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Activity Section Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardBody className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Account Security</h3>
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
                  <span>Manage Alerts</span>
                  <span>→</span>
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </RequireRole >
  );
}
