'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TeamMemberCardProps {
    member: {
        id: string;
        name: string;
        email: string;
        role: string;
        access: 'Admin' | 'Staff';
        status: 'Active' | 'Invited';
        permissions?: string[];
    };
    onRemove?: () => void;
    onEditPermissions?: (memberId: string) => void;
}

export function TeamMemberCard({ member, onRemove, onEditPermissions }: TeamMemberCardProps) {
    return (
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                            <User className="w-7 h-7 text-slate-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-slate-900 dark:text-white">{member.name}</h3>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-widest ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {member.status}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mb-1">{member.email}</p>
                            <div className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">{member.role} • {member.access} Access</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline" size="sm"
                            className="rounded-xl border-slate-200 dark:border-slate-700 font-black text-xs uppercase tracking-widest px-4"
                            onClick={() => onEditPermissions?.(member.id)}
                        >
                            Edit Permissions
                        </Button>
                        {onRemove && (
                            <Button
                                variant="outline" size="sm"
                                className="rounded-xl border-rose-200 text-rose-600 font-black text-xs uppercase tracking-widest px-3"
                                onClick={onRemove}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
