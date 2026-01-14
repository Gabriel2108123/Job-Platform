'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { Button } from '@/components/ui/Button';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  userId?: string;
  assignedTo?: string;
}

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: '1',
    subject: 'Cannot login to account',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-01-12',
    updatedAt: '2026-01-13',
    userId: 'user-123',
    assignedTo: 'support-agent-1',
  },
  {
    id: '2',
    subject: 'Feature request: Export reports',
    status: 'open',
    priority: 'medium',
    createdAt: '2026-01-11',
    updatedAt: '2026-01-11',
    userId: 'user-456',
  },
  {
    id: '3',
    subject: 'Payment processing error',
    status: 'resolved',
    priority: 'critical',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-12',
    userId: 'user-789',
  },
];

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch tickets from backend
    setTickets(MOCK_TICKETS);
    setLoading(false);
  }, []);

  const filteredTickets =
    filter === 'all'
      ? tickets
      : tickets.filter((t) => t.status === filter);

  return (
    <RequireRole allowedRoles={['Support', 'Admin']}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
            <Button variant="primary">Create Ticket</Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {['all', 'open', 'in-progress', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <Link key={ticket.id} href={`/support/tickets/${ticket.id}`}>
                    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[ticket.status]
                              }`}
                            >
                              {ticket.status.replace('-', ' ')}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                priorityColors[ticket.priority]
                              }`}
                            >
                              {ticket.priority}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Created:</span> {ticket.createdAt}
                            </div>
                            <div>
                              <span className="font-medium">Updated:</span> {ticket.updatedAt}
                            </div>
                            <div>
                              <span className="font-medium">ID:</span> #{ticket.id}
                            </div>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 ml-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-600 text-lg">No tickets found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  );
}
