'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Calendar, MapPin, Link as LinkIcon, FileText } from 'lucide-react';

interface InterviewModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: {
        scheduledAt: string;
        type: string;
        location?: string;
        meetingLink?: string;
        notes?: string;
    }) => void;
    candidateName: string;
}

export function InterviewModal({ open, onClose, onConfirm, candidateName }: InterviewModalProps) {
    const [scheduledAt, setScheduledAt] = useState('');
    const [type, setType] = useState('Video');
    const [location, setLocation] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm({
                scheduledAt,
                type,
                location,
                meetingLink,
                notes
            });
            onClose();
        } catch (error) {
            console.error('Failed to schedule interview:', error);
        } finally {
            setLoading(false);
        }
    };

    const interviewTypes = ['Phone', 'Video', 'Onsite', 'Technical', 'Cultural'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-[var(--brand-navy)]">Schedule Interview</h3>
                        <p className="text-sm text-gray-500 font-medium">Candidate: {candidateName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[var(--brand-primary)]" />
                            Date & Time
                        </label>
                        <Input
                            type="datetime-local"
                            required
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full rounded-xl border-gray-200 focus:ring-[var(--brand-primary)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Interview Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none"
                        >
                            {interviewTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {type === 'Onsite' ? (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[var(--brand-primary)]" />
                                Office Location
                            </label>
                            <Input
                                placeholder="Enter office address..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full rounded-xl border-gray-200"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-[var(--brand-primary)]" />
                                Meeting Link
                            </label>
                            <Input
                                placeholder="https://zoom.us/j/..."
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                className="w-full rounded-xl border-gray-200"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[var(--brand-primary)]" />
                            Notes for Candidate
                        </label>
                        <textarea
                            placeholder="e.g. Please bring your ID and a copy of your CV..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none text-sm"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl py-2.5 font-bold"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-xl py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] text-white font-bold"
                            loading={loading}
                        >
                            Schedule
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
