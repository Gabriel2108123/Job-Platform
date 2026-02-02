'use client';

import { useState, useEffect } from 'react';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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


              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                <button
                  className={`px-4 py-2 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'profile' ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Personal Info
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'work-history' ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('work-history')}
                >
                  Work History
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'worker-map' ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('worker-map')}
                >
                  Worker Map
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'my-network' ? 'text-[var(--brand-primary)] border-b-2 border-[var(--brand-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('my-network')}
                >
                  My Network
                </button>
              </div>

              {activeTab === 'profile' && (
                <>
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
                </>
              )}

              {activeTab === 'work-history' && (
                <div className="mb-8">
                  <WorkHistoryList workExperiences={workExperiences} onRefresh={fetchWorkHistory} />
                </div>
              )}

              {activeTab === 'worker-map' && (
                <div className="space-y-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
                    Enable the map to show your verified work locations to potential employers.
                    You can also enable "Discoverable by Coworkers" in settings below to find past colleagues.
                  </div>
                  <WorkerMapSettings />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">My Map Preview</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      This is how your map appears to approved businesses. Only locations you enabled and are visible based on your privacy settings are shown.
                    </p>
                    <WorkerMap workExperiences={workExperiences} />
                  </div>
                </div>
              )}

              {activeTab === 'my-network' && (
                <div className="space-y-8 mb-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">My Network</h2>
                    <p className="text-gray-500">
                      Find and connect with people you worked with in the past. To see potential coworkers, you must both have
                      "Discoverable by Coworkers" enabled in settings.
                    </p>
                  </div>

                  <WorkerMapSettings />

                  <ConnectionInbox />

                  <div className="pt-8 border-t border-gray-200">
                    <PotentialCoworkerList />
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-4 mt-8">
                <div className="text-3xl">🛡️</div>
                <div>
                  <h4 className="font-bold text-blue-900 leading-tight">Identity Verified</h4>
                  <p className="text-sm text-blue-700/70">Your account is fully verified and ready for professional placement.</p>
                </div>
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
