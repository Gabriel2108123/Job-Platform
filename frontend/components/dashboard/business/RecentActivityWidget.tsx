'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Clock, UserPlus, MessageSquare, Briefcase } from 'lucide-react';

export function RecentActivityWidget() {
    const activities = [
        { id: '1', type: 'application', user: 'Alex Rivera', action: 'applied for', target: 'Senior Bartender', time: '12m ago', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: '2', type: 'message', user: 'Sarah Blake', action: 'sent a message to', target: 'John Doe', time: '1h ago', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: '3', type: 'job', user: 'James Wilson', action: 'published', target: 'Chef de Partie', time: '3h ago', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardBody className="p-8">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Recent Activity</h3>
                <div className="space-y-6">
                    {activities.map(activity => (
                        <div key={activity.id} className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl ${activity.bg} ${activity.color} flex items-center justify-center shrink-0`}>
                                <activity.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    <span className="font-black text-slate-900 dark:text-white">{activity.user}</span> {activity.action} <span className="font-black text-slate-900 dark:text-white">{activity.target}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
