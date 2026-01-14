'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="User Management"
          description="View and manage platform users"
          backLink={{ href: '/admin', label: 'Back to Admin Dashboard' }}
        />
        <Card variant="default">
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-600">User management interface coming soon</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
