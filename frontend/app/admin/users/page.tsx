'use client';

import { useState, useEffect } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { apiRequest, updateModerationStatus } from '@/lib/api/client';

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  emailVerified: boolean;
  moderationStatus: number;
  moderationStatusName: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={['Admin']}>
        <AdminUsersContent />
      </RequireRole>
    </RequireAuth>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ items: AdminUser[] }>('/api/admin/users?pageSize=100');
      if (response.success && response.data) {
        setUsers(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (userId: string, status: number) => {
    setActionLoading(userId);
    try {
      const response = await updateModerationStatus('users', userId, status);
      if (response.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, moderationStatus: status, moderationStatusName: getStatusName(status) } : u));
      } else {
        alert(response.error || 'Failed to update status');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusName = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Flagged';
      case 3: return 'Blocked';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="User Management"
          description="View and manage platform users"
          backLink={{ href: '/admin', label: 'Back to Admin Dashboard' }}
        />

        <div className="mb-6">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md bg-white"
          />
        </div>

        <Card variant="default" className="overflow-hidden">
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Moderation</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500 font-medium">{user.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {!user.isActive && (
                              <Badge className="bg-red-100 text-red-700 w-fit">Suspended</Badge>
                            )}
                            {user.emailVerified ? (
                              <Badge className="bg-blue-100 text-blue-700 w-fit">Verified</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-500 w-fit">Unverified</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getStatusColor(user.moderationStatus)} font-black uppercase text-[10px] tracking-widest px-2.5 py-1`}>
                            {user.moderationStatusName}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {user.moderationStatus !== 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 rounded-xl font-bold"
                                onClick={() => handleStatusUpdate(user.id, 1)}
                                disabled={actionLoading === user.id}
                              >
                                Approve
                              </Button>
                            )}
                            {user.moderationStatus !== 2 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 rounded-xl font-bold"
                                onClick={() => handleStatusUpdate(user.id, 2)}
                                disabled={actionLoading === user.id}
                              >
                                Flag
                              </Button>
                            )}
                            {user.moderationStatus !== 3 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl font-bold"
                                onClick={() => handleStatusUpdate(user.id, 3)}
                                disabled={actionLoading === user.id}
                              >
                                Block
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
