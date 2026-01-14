'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';

export default function AdminAuditLogsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Audit Logs"
          description="View platform activity and audit trail"
          backLink={{ href: '/admin', label: 'Back to Admin Dashboard' }}
        />
        <Card variant="default">
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-600">Audit log interface coming soon</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
