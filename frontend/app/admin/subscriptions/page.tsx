'use client';

import { RoleLayout } from '@/components/layout/RoleLayout';
import { Card, CardBody } from '@/components/ui/Card';

export default function AdminSubscriptionsPage() {
  return (
    <RoleLayout pageTitle="Subscription Management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Card variant="default">
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-600">Subscription management interface coming soon</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </RoleLayout>
  );
}
