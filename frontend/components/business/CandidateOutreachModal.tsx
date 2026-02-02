'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { sendOutreach, OutreachRequestDto, OutreachResultDto } from '@/lib/api/client';
import { ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';

interface CandidateOutreachModalProps {
    candidateId: string;
    candidateName: string;
    jobId?: string;
    creditBalance: number;
    onClose: () => void;
    onSuccess: (newBalance: number) => void;
}

export function CandidateOutreachModal({
    candidateId,
    candidateName,
    jobId,
    creditBalance,
    onClose,
    onSuccess
}: CandidateOutreachModalProps) {
    const [message, setMessage] = useState(`Hi ${candidateName.split(' ')[0]}, I saw your profile on the Worker Map and think you'd be a great fit for our role!`);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        setError(null);
        try {
            const result = await sendOutreach({
                candidateUserId: candidateId,
                jobId,
                message
            });

            if (result.success) {
                onSuccess(result.remainingBalance);
                onClose();
            } else {
                setError(result.error || 'Failed to send outreach');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                <CardBody className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--brand-navy)]">Contact {candidateName}</h2>
                            <p className="text-gray-600 text-sm">Initiate a verified outreach to this candidate</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                            ✕
                        </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-blue-800">
                            This outreach will use <strong>1 credit</strong>.
                            You have <strong>{creditBalance}</strong> credits remaining.
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Type your message here..."
                        />
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-12"
                            onClick={onClose}
                            disabled={sending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 bg-[var(--brand-primary)] h-12 rounded-xl flex items-center justify-center gap-2"
                            onClick={handleSend}
                            disabled={sending || creditBalance < 1}
                        >
                            {sending ? 'Sending...' : (
                                <>
                                    <MessageSquare size={18} />
                                    Send Outreach
                                </>
                            )}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
