'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { MessageSquare, Search, Filter, Clock, User, ChevronRight } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SupportTicketsPage() {
  const tickets = [
    { id: '1', user: 'Alex Rivera', subject: 'Billing Inquiry', category: 'Invoicing', status: 'Priority', time: '10m ago' },
    { id: '2', user: 'Gabriel Owners', subject: 'Business Verification', category: 'Verification', status: 'Pending', time: '1h ago' },
    { id: '3', user: 'Sarah Blake', subject: 'Account Access', category: 'Security', status: 'In Progress', time: '3h ago' },
    { id: '4', user: 'Michael Ross', subject: 'Integration Help', category: 'API', status: 'Low', time: '5h ago' },
  ];

  return (
    <RoleLayout pageTitle="Ticket Queue">
      <div className="max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">Active Queue</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">12 Tickets awaiting response</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs uppercase tracking-widest px-4">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {tickets.map(ticket => (
            <Card key={ticket.id} className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white dark:bg-slate-900 group cursor-pointer">
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{ticket.subject}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${ticket.status === 'Priority' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500">{ticket.user} • {ticket.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> {ticket.time}
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest gap-2">
                      Take Ticket <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </RoleLayout>
  );
}
