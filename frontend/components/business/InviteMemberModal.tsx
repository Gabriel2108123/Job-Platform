'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, UserPlus, ChevronDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganizationId } from '@/lib/auth-helpers';
import { getAuthHeaders } from '@/lib/auth';

interface InviteMemberModalProps {
    onClose: () => void;
}

const ROLES = [
    { value: 'BusinessOwner', label: 'Business Owner', desc: 'Full admin access — billing, team, and all jobs' },
    { value: 'Staff', label: 'Staff Member', desc: 'Recruitment activity only — no billing or team management' },
];

export function InviteMemberModal({ onClose }: InviteMemberModalProps) {
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Staff');
    const [success, setSuccess] = useState(false);

    const invite = useMutation({
        mutationFn: async () => {
            const orgId = getOrganizationId();
            const res = await fetch(`/api/organizations/${orgId}/invitations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ email, role }),
            });
            if (!res.ok) throw new Error('Failed to send invitation');
        },
        onSuccess: () => {
            setSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['org-members'] });
        },
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {success ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Invitation Sent!</h3>
                        <p className="text-sm text-slate-500 mb-6">We've sent an invite to <span className="font-black text-slate-700">{email}</span>.</p>
                        <Button variant="primary" onClick={onClose} className="rounded-2xl font-black text-xs uppercase tracking-widest px-8">Done</Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Invite Team Member</h2>
                            <p className="text-sm text-slate-500">They'll receive an email to join your workspace.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Access Level</label>
                                <div className="space-y-3">
                                    {ROLES.map(r => (
                                        <div
                                            key={r.value}
                                            onClick={() => setRole(r.value)}
                                            className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${role === r.value ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-all ${role === r.value ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`} />
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white text-sm">{r.label}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {invite.isError && (
                            <p className="mt-4 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl p-3">Failed to send invitation. Please try again.</p>
                        )}

                        <div className="flex gap-3 mt-8">
                            <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</Button>
                            <Button
                                variant="primary"
                                onClick={() => invite.mutate()}
                                disabled={!email || invite.isPending}
                                className="flex-1 rounded-2xl font-black text-xs uppercase tracking-widest"
                            >
                                {invite.isPending ? 'Sending...' : 'Send Invite'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
