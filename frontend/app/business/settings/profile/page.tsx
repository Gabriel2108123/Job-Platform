'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Globe, Upload, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { getOrganizationId } from '@/lib/auth-helpers';
import { getAuthHeaders } from '@/lib/auth';

const inputCls = 'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400';
const labelCls = 'block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2';

export default function BusinessProfileSettingsPage() {
    const orgId = getOrganizationId();
    const queryClient = useQueryClient();
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ name: '', website: '', description: '', city: '', country: '' });

    useQuery({
        queryKey: ['org-profile', orgId],
        queryFn: async () => {
            const res = await fetch(`/api/organizations/${orgId}`, { headers: getAuthHeaders() });
            if (!res.ok) return null;
            const data = await res.json();
            setForm({ name: data.name || '', website: data.website || '', description: data.description || '', city: data.city || '', country: data.country || '' });
            return data;
        },
        enabled: !!orgId,
    });

    const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    const save = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/organizations/${orgId}/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
        },
        onSuccess: () => {
            setSaved(true);
            queryClient.invalidateQueries({ queryKey: ['org-profile', orgId] });
            setTimeout(() => setSaved(false), 2500);
        },
    });

    return (
        <RoleLayout
            pageTitle="Business Profile"
            pageActions={
                <Link href="/business/settings">
                    <Button variant="outline" className="flex items-center gap-2 rounded-xl font-black text-xs uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Settings
                    </Button>
                </Link>
            }
        >
            <div className="max-w-2xl space-y-8">
                {/* Logo */}
                <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardBody className="p-8 flex items-center gap-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-indigo-400 transition-colors group shrink-0">
                            <Building2 className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white mb-1">Company Logo</h3>
                            <p className="text-xs text-slate-500 mb-3">PNG or SVG recommended. Min 200×200px.</p>
                            <Button variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Upload className="w-3.5 h-3.5" /> Upload Logo
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Details */}
                <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardBody className="p-8 space-y-6">
                        <h3 className="font-black text-slate-900 dark:text-white">Company Details</h3>
                        <div>
                            <label className={labelCls}>Company Name</label>
                            <input className={inputCls} placeholder="Your restaurant or hotel name" value={form.name} onChange={e => update('name', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}><Globe className="w-3 h-3 inline mr-1" />Website</label>
                            <input className={inputCls} placeholder="https://yourcompany.com" value={form.website} onChange={e => update('website', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea rows={4} className={inputCls} placeholder="Tell candidates about your business..." value={form.description} onChange={e => update('description', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>City</label>
                                <input className={inputCls} placeholder="London" value={form.city} onChange={e => update('city', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Country</label>
                                <input className={inputCls} placeholder="United Kingdom" value={form.country} onChange={e => update('country', e.target.value)} />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        onClick={() => save.mutate()}
                        disabled={save.isPending}
                        className="rounded-2xl font-black text-xs uppercase tracking-widest px-10 flex items-center gap-2"
                    >
                        {saved ? <><Check className="w-4 h-4" /> Saved!</> : save.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </RoleLayout>
    );
}
