'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

export function ContactSupportForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    if (status === 'success') {
        return (
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardBody className="p-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                        Our support team has received your request and will get back to you via email shortly.
                    </p>
                    <Button
                        onClick={() => setStatus('idle')}
                        variant="outline"
                        className="rounded-xl border-slate-200 dark:border-slate-700 font-bold"
                    >
                        Send Another Message
                    </Button>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl bg-white dark:bg-slate-900 relative overflow-hidden">
            {/* Header Area */}
            <div className="bg-indigo-600 p-8 text-white relative h-32">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-1">Contact Support</h2>
                    <p className="text-indigo-200 text-sm font-medium">How can we help you today?</p>
                </div>
                <MessageSquare className="absolute right-6 -bottom-6 w-32 h-32 text-indigo-500/30 rotate-12" />
            </div>

            <CardBody className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            What do you need help with?
                        </label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                            required
                            defaultValue=""
                        >
                            <option value="" disabled>Select a topic...</option>
                            <option value="account">Account Access / Password</option>
                            <option value="billing">Billing & Subscriptions</option>
                            <option value="technical">Technical Issue / Bug</option>
                            <option value="feature">Feature Request</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Message Details
                        </label>
                        <textarea
                            rows={5}
                            placeholder="Please describe your issue in detail..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all resize-none"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full rounded-xl py-6 font-black text-sm tracking-wide gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        isLoading={status === 'submitting'}
                    >
                        {!status && <Send className="w-4 h-4" />}
                        {status === 'submitting' ? 'SENDING...' : 'SEND MESSAGE'}
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
}
