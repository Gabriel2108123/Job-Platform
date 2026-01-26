'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api/client';
import { getUser, isLoggedIn } from '@/lib/auth';
import { useUserRole } from '@/lib/hooks/useUserRole';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  position?: string;
  status: string;
  createdAt: string;
}

export default function BusinessTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    position: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const { role, isBusinessOwner: isOwner } = useUserRole();
  const currUser = getUser();

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<TeamMember[]>('/api/organizations/members');
      if (res.success && res.data) {
        setTeam(res.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await apiRequest<TeamMember>('/api/organizations/members', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setShowAddModal(false);
        setFormData({ firstName: '', lastName: '', email: '', password: '', position: '' });
        fetchTeam();
      } else {
        alert(res.error || 'Failed to add member');
      }
    } catch (err) {
      alert('Internal error adding member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member? they will lose access to the company account.')) return;

    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/organizations/members/${memberId}`, {
        method: 'DELETE'
      });
      if (res.success) {
        fetchTeam();
      } else {
        alert(res.error || 'Failed to remove member');
      }
    } catch (err) {
      alert('Internal error removing member');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <RequireRole allowedRoles={['BusinessOwner', 'Staff', 'Admin']}>
      <div className="min-h-screen bg-[#fcfcfd] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-black text-[var(--brand-navy)] tracking-tight">Your Recruitment Team</h1>
              <p className="text-gray-500 mt-2 text-lg italic">Built for {currUser?.organizationId ? 'Your Organization' : 'The Riverside'}</p>
            </div>
            {isOwner && (
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 rounded-2xl px-8 shadow-xl shadow-indigo-100 font-bold"
              >
                + Add New Member
              </Button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Seat</p>
              <p className="text-3xl font-black text-indigo-600">{team.length}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Access Level</p>
              <p className="text-3xl font-black text-teal-600 capitalize">{currUser?.role === 'BusinessOwner' ? 'Admin' : 'Recruitment'}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Isolation</p>
              <p className="text-xl font-black text-amber-600">Company Restricted ✓</p>
            </div>
          </div>

          {/* Member Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Team Member</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Position</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Access</th>
                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                    <th className="px-8 py-5 text-right font-bold text-gray-400 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Loading your crew...</td></tr>
                  ) : team.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No team members yet. Add your first recruiter!</td></tr>
                  ) : team.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-gray-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-bold text-gray-600 italic">{member.position || 'N/A'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.role === 'BusinessOwner' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                          }`}>
                          {member.role === 'BusinessOwner' ? 'Owner' : 'Recruitment'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {isOwner && member.id !== currUser?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-400 hover:text-red-600 font-bold text-xs transition-colors"
                          >
                            Terminate Access
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <form onSubmit={handleAddMember} className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-10 space-y-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Add Recruiter</h2>
                <p className="text-gray-500 font-medium italic mt-1">Grant team access to your company account</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">First Name</label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Position / Job Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. HR Manager, Senior Recruiter"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold italic"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Company Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Initial Password</label>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-indigo-600 rounded-2xl font-black py-4 shadow-lg shadow-indigo-100"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Creating User...' : 'Establish Team Seat'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl font-bold py-4"
                >
                  Discard
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </RequireRole>
  );
}

