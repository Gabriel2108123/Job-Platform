'use client';

import React from 'react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { BusinessOwnerDashboard } from '@/components/dashboard/business/BusinessOwnerDashboard';
import BusinessStaffDashboard from '@/components/dashboard/business/BusinessStaffDashboard';

export default function BusinessDashboardPage() {
  const { isBusinessOwner, isStaff, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isBusinessOwner) {
    return <BusinessOwnerDashboard />;
  }

  return <BusinessStaffDashboard />;
}
