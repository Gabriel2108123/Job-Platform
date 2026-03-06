'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function MessagesSummaryWidget() {
    // Mock data
    const unreadMessages = [
        { id: '1', sender: 'Sarah (Recruiter at Yoke)', text: 'Hi! Are you still available for the Chef role?', time: '2m ago' },
        { id: '2', sender: 'James (Manager at Soho House)', text: 'Thanks for your application. We\'d like to...', time: '1h ago' },
    ];

    return (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Messages</h3>
                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase">
                        {unreadMessages.length} NEW
                    </span>
                </div>

                <div className="space-y-4">
                    {unreadMessages.map(msg => (
                        <Link key={msg.id} href={ROUTES.CANDIDATE.MESSAGES} className="flex gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{msg.sender}</p>
                                    <p className="text-[10px] text-slate-400">{msg.time}</p>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{msg.text}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
