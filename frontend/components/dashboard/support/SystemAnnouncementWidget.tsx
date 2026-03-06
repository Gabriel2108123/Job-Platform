'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Megaphone, X } from 'lucide-react';

export function SystemAnnouncementWidget() {
    return (
        <Card className="rounded-[2.5rem] bg-indigo-600 text-white p-8 border-none overflow-hidden relative shadow-xl shadow-indigo-600/20">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Internal Update</span>
                </div>
                <h4 className="text-xl font-black mb-2 leading-tight">Scheduled DB Maintenance</h4>
                <p className="text-sm text-indigo-100 mb-8 max-w-[240px]">
                    Expect brief read-only modes tomorrow between 04:00 - 06:00 UTC.
                </p>
                <button className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Dismiss
                </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        </Card>
    );
}
