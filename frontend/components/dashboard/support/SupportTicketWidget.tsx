'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { MessageSquare, Clock, User, AlertCircle } from 'lucide-react';

export function SupportTicketWidget() {
    const tickets = [
        { id: '1', user: 'Alex Rivera', subject: 'Billing Inquiry', status: 'Priority', time: '10m ago' },
        { id: '2', user: 'Gabriel Owners', subject: 'Business Verification', status: 'Pending', time: '1h ago' },
        { id: '3', user: 'Sarah Blake', subject: 'Account Access', status: 'Low', time: '3h ago' },
    ];

    return (
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 border-none shadow-slate-200/50">
            <CardBody className="p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Recent Tickets</h3>
                <div className="space-y-6">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${ticket.status === 'Priority' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                                    }`}>
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{ticket.subject}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        <User className="w-3 h-3" /> {ticket.user} • {ticket.time}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${ticket.status === 'Priority' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {ticket.status}
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
