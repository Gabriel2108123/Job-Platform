'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { Button } from '@/components/ui/Button';

export default function SupportDashboardPage() {
  const [stats, setStats] = useState({
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    // TODO: Fetch support stats from backend
    setStats({
      openTickets: 12,
      resolvedTickets: 45,
      avgResponseTime: 2, // hours
      satisfaction: 4.5, // out of 5
    });
  }, []);

  return (
    <RequireRole allowedRoles={['Support', 'Admin']}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
            <Link href="/support/tickets">
              <Button variant="primary">View All Tickets</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Open Tickets</div>
              <div className="text-3xl font-bold text-[var(--brand-primary)]">{stats.openTickets}</div>
              <div className="text-xs text-gray-500 mt-2">Awaiting response</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Resolved</div>
              <div className="text-3xl font-bold text-green-600">{stats.resolvedTickets}</div>
              <div className="text-xs text-gray-500 mt-2">This month</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Avg Response Time</div>
              <div className="text-3xl font-bold text-blue-600">{stats.avgResponseTime}h</div>
              <div className="text-xs text-gray-500 mt-2">Time to first response</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-600 mb-2">Satisfaction</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.satisfaction}/5</div>
              <div className="text-xs text-gray-500 mt-2">Customer rating</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/support/tickets">
                  <Button variant="outline" className="w-full justify-start">
                    📋 Manage Tickets
                  </Button>
                </Link>
                <Link href="/support/users">
                  <Button variant="outline" className="w-full justify-start">
                    👥 User Support
                  </Button>
                </Link>
                <Link href="/support/reports">
                  <Button variant="outline" className="w-full justify-start">
                    📊 View Reports
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Tickets</h2>
              <div className="space-y-3">
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">Login Issue</p>
                  <p className="text-sm text-gray-600">Opened 2 hours ago</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">Feature Question</p>
                  <p className="text-sm text-gray-600">Opened 5 hours ago</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-medium text-gray-900">Bug Report</p>
                  <p className="text-sm text-gray-600">Opened 1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Knowledge Base</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Getting Started</h3>
                <p className="text-sm text-gray-600">Learn the basics of the platform</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Common Issues</h3>
                <p className="text-sm text-gray-600">Find solutions to frequently asked problems</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">API Documentation</h3>
                <p className="text-sm text-gray-600">Integrate with YokeConnect</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
