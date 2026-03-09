'use client';

import { useState, useEffect } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { apiRequest, updateModerationStatus } from '@/lib/api/client';

interface AdminOrganization {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  userCount: number;
  jobCount: number;
  subscriptionStatus?: string;
  moderationStatus: number;
  moderationStatusName: string;
  createdAt: string;
}

export default function AdminOrganizationsPage() {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={['Admin']}>
        <AdminOrganizationsContent />
      </RequireRole>
    </RequireAuth>
  );
}

function AdminOrganizationsContent() {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ items: AdminOrganization[] }>('/api/admin/organizations?pageSize=100');
      if (response.success && response.data) {
        setOrganizations(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleStatusUpdate = async (orgId: string, status: number) => {
    setActionLoading(orgId);
    try {
      const response = await updateModerationStatus('organizations', orgId, status);
      if (response.success) {
        setOrganizations(organizations.map(o => o.id === orgId ? { ...o, moderationStatus: status, moderationStatusName: getStatusName(status) } : o));
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

  const filteredOrgs = organizations.filter(o =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleLayout pageTitle="Organization Management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <Input
            placeholder="Search by organization name..."
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
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Organization</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Stats</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Moderation</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Created</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{org.name}</div>
                          <div className="text-sm text-gray-500 font-medium truncate max-w-xs">{org.description || 'No description'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-sm">
                            <span className="font-bold text-gray-700">{org.userCount} Users</span>
                            <span className="font-medium text-gray-500">{org.jobCount} Jobs</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${getStatusColor(org.moderationStatus)} font-black uppercase text-[10px] tracking-widest px-2.5 py-1`}>
                            {org.moderationStatusName}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {org.moderationStatus !== 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 rounded-xl font-bold"
                                onClick={() => handleStatusUpdate(org.id, 1)}
                                disabled={actionLoading === org.id}
                              >
                                Approve
                              </Button>
                            )}
                            {org.moderationStatus !== 2 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 rounded-xl font-bold"
                                onClick={() => handleStatusUpdate(org.id, 2)}
                                disabled={actionLoading === org.id}
                              >
                                Flag
                              </Button>
                            )}
                            {org.moderationStatus !== 3 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl font-bold"
                                onClick={() => handleStatusUpdate(org.id, 3)}
                                disabled={actionLoading === org.id}
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
    </RoleLayout>
  );
}
