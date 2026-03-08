'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { MessageSquare } from 'lucide-react';

export default function BusinessMessagesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900">Messages</h1>
            </div>

            <Card className="rounded-[2rem] border-slate-200 min-h-[400px] flex items-center justify-center">
                <CardBody className="text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Inbox</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Your professional messaging center is being configured. Direct communication with candidates will be available here shortly.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
