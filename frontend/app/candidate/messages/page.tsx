'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { MessageSquare, Search, Filter, User } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

export default function CandidateMessagesPage() {
    const conversations = [
        { id: '1', name: 'Sarah (Recruiter)', company: 'The Alchemist', lastMsg: 'Are you available for a trial tomorrow?', time: '10:45 AM', unread: true },
        { id: '2', name: 'James (Manager)', company: 'Dishoom', lastMsg: 'Thank you for the application.', time: 'Yesterday', unread: false },
        { id: '3', name: 'System', company: 'Job Platform', lastMsg: 'Your profile was viewed 5 times today!', time: '2 days ago', unread: false },
    ];

    return (
        <RoleLayout pageTitle="Messages">
            <div className="max-w-6xl h-[calc(100vh-12rem)] min-h-[600px] flex gap-6">
                {/* Sidebar */}
                <div className="w-80 flex flex-col gap-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>

                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">All Chats</h3>
                            <Filter className="w-4 h-4 text-slate-400 cursor-pointer" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {conversations.map(conv => (
                                <div key={conv.id} className={`p-4 rounded-2xl cursor-pointer transition-all ${conv.unread ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-xs font-black ${conv.unread ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>{conv.name}</p>
                                        <p className="text-[10px] text-slate-400">{conv.time}</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 mb-1">{conv.company}</p>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{conv.lastMsg}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area placeholder */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-12 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Select a conversation</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            Choose a recruiter or business to start the conversation about your next role.
                        </p>
                    </div>

                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                        <div className="grid grid-cols-6 gap-8 p-12">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <MessageSquare key={i} className="w-12 h-12 rotate-12" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
