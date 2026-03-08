'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Shield, Settings, Bell, LogOut, ChevronRight, User } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
    const router = useRouter();

    const sections = [
        { title: 'System Configuration', desc: 'Core platform settings and parameters', icon: Settings, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { title: 'Security & Access', desc: 'Admin roles, permissions and audit logs', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { title: 'Platform Notifications', desc: 'System-wide alerts and maintenance notices', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    ];

    const handleLogout = () => {
        authApi.logout();
        window.location.href = '/login';
    };

    return (
        <RoleLayout pageTitle="Settings">
            <div className="max-w-3xl space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm mb-8 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 shrink-0">
                        <User className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Admin Control</h2>
                        <p className="text-sm font-bold text-slate-500">System Administration & Global Config</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {sections.map(section => (
                        <Card key={section.title} className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group">
                            <CardBody className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl ${section.bg} ${section.color}`}>
                                            <section.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white">{section.title}</h3>
                                            <p className="text-xs font-bold text-slate-500">{section.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                <Card
                    onClick={handleLogout}
                    className="rounded-[2rem] border-rose-100 dark:border-rose-900/30 shadow-sm hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all cursor-pointer group mt-12 bg-white dark:bg-slate-900"
                >
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between text-rose-600">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/30">
                                    <LogOut className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black">Sign Out</h3>
                                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">End Current Session</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </RoleLayout>
    );
}
