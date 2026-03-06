'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { CreditCard, Rocket, Box } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function BillingSummaryWidget() {
    return (
        <Card className="rounded-[2.5rem] border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-sm overflow-hidden border-none shadow-indigo-600/5">
            <CardBody className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                        <Rocket className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Pro Plan</h3>
                </div>

                <div className="space-y-6 mb-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-indigo-900/50 dark:text-indigo-300/50 uppercase tracking-widest">Active Jobs</span>
                            <span className="text-xs font-black text-indigo-900 dark:text-indigo-100">4 / 10</span>
                        </div>
                        <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '40%' }} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-indigo-900/50 dark:text-indigo-300/50 uppercase tracking-widest">Candidates</span>
                            <span className="text-xs font-black text-indigo-900 dark:text-indigo-100">Unlimited</span>
                        </div>
                        <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600/30 rounded-full" style={{ width: '100%' }} />
                        </div>
                    </div>
                </div>

                <Link href={ROUTES.BUSINESS.BILLING}>
                    <button className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                        Billing & Usage <CreditCard className="w-4 h-4" />
                    </button>
                </Link>
            </CardBody>
        </Card>
    );
}
