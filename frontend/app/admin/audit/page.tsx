'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { ShieldAlert, FileText } from 'lucide-react';

export default function AdminAuditPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900">Audit Logs</h1>
            </div>

            <Card className="rounded-[2rem] border-slate-200">
                <CardBody className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">System Activity</h2>
                            <p className="text-sm text-slate-500">Review all administrative and system events.</p>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Timestamp</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">User</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Action</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-600">2026-03-08 20:25:01</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">System</td>
                                    <td className="px-6 py-4 text-slate-600">Configuration update: Background Sync</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">SUCCESS</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-600">2026-03-08 20:12:45</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">Admin_Gaby</td>
                                    <td className="px-6 py-4 text-slate-600">User Role Change: JobSeeker_102</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">SUCCESS</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
