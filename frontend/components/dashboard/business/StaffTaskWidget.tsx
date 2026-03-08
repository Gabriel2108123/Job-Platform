'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { CheckSquare, Clock, ArrowRight } from 'lucide-react';

export function StaffTaskWidget() {
    const tasks = [
        { id: '1', task: 'Screen Alex Rivera', due: 'In 2h', priority: 'High' },
        { id: '2', task: 'Confirm trial for Sarah', due: 'Today', priority: 'Medium' },
        { id: '3', task: 'Update job description', due: 'Tomorrow', priority: 'Low' },
    ];

    return (
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardBody className="p-8">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">My Tasks</h3>
                <div className="space-y-6">
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-6 rounded-full ${task.priority === 'High' ? 'bg-rose-500' :
                                    task.priority === 'Medium' ? 'bg-amber-500' :
                                        'bg-indigo-500'
                                    }`} />
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{task.task}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Due {task.due}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all opacity-0 group-hover:opacity-100" />
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
