'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { Button } from '@/components/ui/Button';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'BusinessOwner' | 'Staff';
  status: 'active' | 'inactive' | 'invited';
  joinedAt?: string;
}

const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Owner',
    email: 'john@example.com',
    role: 'BusinessOwner',
    status: 'active',
    joinedAt: '2025-01-01',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'sarah@example.com',
    role: 'Staff',
    status: 'active',
    joinedAt: '2025-06-15',
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Recruiter',
    email: 'mike@example.com',
    role: 'Staff',
    status: 'active',
    joinedAt: '2025-08-20',
  },
];

export default function BusinessTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    // TODO: Fetch team members from backend
    setTeam(MOCK_TEAM);
    setLoading(false);
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    // TODO: Send invite to backend
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      // TODO: Call backend to remove member
      setTeam(team.filter((m) => m.id !== memberId));
    }
  };

  return (
    <RequireRole allowedRoles={['BusinessOwner', 'Staff', 'Admin']}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
              <p className="text-gray-600 mt-1">Manage your hiring team</p>
            </div>
            <Button variant="primary" onClick={() => setShowInviteModal(true)}>
              + Invite Team Member
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Total Members</div>
              <div className="text-3xl font-bold text-[var(--brand-primary)]">{team.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Active</div>
              <div className="text-3xl font-bold text-green-600">
                {team.filter((m) => m.status === 'active').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Pending Invites</div>
              <div className="text-3xl font-bold text-yellow-600">
                {team.filter((m) => m.status === 'invited').length}
              </div>
            </div>
          </div>

          {/* Team List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {team.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{member.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {member.role === 'BusinessOwner' ? 'Owner' : 'Staff'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : member.status === 'invited'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {member.joinedAt || 'Pending'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {member.role !== 'BusinessOwner' && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invite Modal */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Team Member</h2>
                <p className="text-gray-600 mb-4">
                  Send an invite to add someone to your team
                </p>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent mb-4"
                />
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleInvite}
                    className="flex-1"
                  >
                    Send Invite
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  );
}
