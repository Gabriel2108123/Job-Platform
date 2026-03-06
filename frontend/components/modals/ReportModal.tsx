'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { submitReport } from '@/lib/api/client';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetType: 'Job' | 'User' | 'Message';
    targetId: string;
    targetName: string;
}

export function ReportModal({ isOpen, onClose, targetType, targetId, targetName }: ReportModalProps) {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return;

        setLoading(true);
        setError(null);

        try {
            const response = await submitReport({
                targetType,
                targetId,
                reason,
                details
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setReason('');
                    setDetails('');
                }, 2000);
            } else {
                setError(response.error || 'Failed to submit report');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const reasons = [
        'Inappropriate content',
        'Spam or misleading',
        'Harassment',
        'Fraud or scam',
        'Other'
    ];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-10 space-y-6 animate-in fade-in zoom-in duration-200">
                {success ? (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🛡️</div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Report Submitted</h2>
                        <p className="text-gray-500 font-medium">Thank you for helping keep our platform safe. Our moderation team will review this shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900">Report {targetType}</h2>
                            <p className="text-gray-500 font-medium italic mt-1">Reporting: <span className="text-[var(--brand-primary)] not-italic font-bold">{targetName}</span></p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-100 italic">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Reason for Report</label>
                            <div className="grid grid-cols-1 gap-2">
                                {reasons.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setReason(r)}
                                        className={`text-left px-5 py-3 rounded-2xl font-bold transition-all ${reason === r
                                                ? 'bg-[var(--brand-primary)] text-white shadow-lg shadow-pink-100'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Additional Details (Optional)</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Please provide any extra context..."
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[var(--brand-primary)] font-medium min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1 rounded-2xl font-black py-4 shadow-lg"
                                disabled={loading || !reason}
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 rounded-2xl font-bold py-4"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
