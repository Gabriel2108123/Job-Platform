'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, User, MessageSquare, CheckCircle2, ArrowUp, Send } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

interface TicketReply {
    id: string;
    authorName: string;
    isStaff: boolean;
    message: string;
    createdAt: string;
}

interface Ticket {
    id: string;
    subject: string;
    user: string;
    userEmail: string;
    status: 'Open' | 'InProgress' | 'Resolved';
    priority: string;
    description: string;
    createdAt: string;
    replies: TicketReply[];
}

const STATUS_BADGE: Record<string, string> = {
    Open: 'bg-rose-100 text-rose-600',
    InProgress: 'bg-amber-100 text-amber-600',
    Resolved: 'bg-emerald-100 text-emerald-600',
};

export default function TicketDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [reply, setReply] = useState('');

    const { data: ticket, isLoading } = useQuery<Ticket>({
        queryKey: ['ticket', id],
        queryFn: async () => {
            const res = await fetch(`/api/support/tickets/${id}`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error();
            return res.json();
        },
    });

    const sendReply = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/support/tickets/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ message: reply }),
            });
            if (!res.ok) throw new Error();
        },
        onSuccess: () => {
            setReply('');
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
        },
    });

    const updateStatus = useMutation({
        mutationFn: async (status: string) => {
            const res = await fetch(`/api/support/tickets/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
    });

    if (isLoading) return (
        <RoleLayout pageTitle="Loading...">
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        </RoleLayout>
    );

    if (!ticket) return (
        <RoleLayout pageTitle="Ticket Not Found">
            <div className="text-center py-20">
                <p className="font-black text-slate-500 mb-4">Ticket not found.</p>
                <Link href={ROUTES.SUPPORT.TICKETS}><Button variant="primary">Back to Tickets</Button></Link>
            </div>
        </RoleLayout>
    );

    return (
        <RoleLayout
            pageTitle={ticket.subject}
            pageActions={
                <div className="flex items-center gap-3">
                    <Link href={ROUTES.SUPPORT.TICKETS}>
                        <Button variant="outline" className="rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" /> Tickets
                        </Button>
                    </Link>
                    {ticket.status !== 'InProgress' && (
                        <Button variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest text-amber-600 border-amber-200" onClick={() => updateStatus.mutate('InProgress')}>
                            <ArrowUp className="w-3.5 h-3.5 mr-1" /> Assign to Me
                        </Button>
                    )}
                    {ticket.status !== 'Resolved' && (
                        <Button variant="primary" className="rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-600 border-none flex items-center gap-2" onClick={() => updateStatus.mutate('Resolved')}>
                            <CheckCircle2 className="w-4 h-4" /> Resolve
                        </Button>
                    )}
                </div>
            }
        >
            <div className="max-w-3xl space-y-6">
                {/* Ticket overview */}
                <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardBody className="p-8">
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${STATUS_BADGE[ticket.status]}`}>{ticket.status}</span>
                            <span className="text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-widest bg-slate-100 text-slate-500">{ticket.priority} Priority</span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white">{ticket.user}</p>
                                <p className="text-xs font-bold text-slate-500">{ticket.userEmail}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{ticket.description}</p>
                        <p className="text-xs font-bold text-slate-400 mt-4">Opened {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </CardBody>
                </Card>

                {/* Conversation */}
                <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Conversation ({ticket.replies?.length || 0})</h3>
                    <div className="space-y-4">
                        {(ticket.replies || []).map(r => (
                            <div key={r.id} className={`flex gap-3 ${r.isStaff ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${r.isStaff ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                    <User className={`w-4 h-4 ${r.isStaff ? 'text-indigo-600' : 'text-slate-400'}`} />
                                </div>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${r.isStaff ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-sm border border-slate-200 dark:border-slate-700'}`}>
                                    <p className={`text-xs font-black mb-1 ${r.isStaff ? 'text-indigo-200' : 'text-slate-500'}`}>{r.authorName}</p>
                                    <p className="leading-relaxed">{r.message}</p>
                                    <p className={`text-xs mt-2 ${r.isStaff ? 'text-indigo-300' : 'text-slate-400'}`}>{new Date(r.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply box */}
                    {ticket.status !== 'Resolved' && (
                        <Card className="mt-6 rounded-[2rem] border-slate-200 dark:border-slate-800">
                            <CardBody className="p-4">
                                <textarea
                                    rows={3}
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="w-full bg-transparent text-sm font-medium outline-none resize-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                                />
                                <div className="flex justify-end mt-2">
                                    <Button
                                        variant="primary"
                                        className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 px-6"
                                        onClick={() => sendReply.mutate()}
                                        disabled={!reply.trim() || sendReply.isPending}
                                    >
                                        <Send className="w-3.5 h-3.5" /> {sendReply.isPending ? 'Sending...' : 'Send Reply'}
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </RoleLayout>
    );
}
