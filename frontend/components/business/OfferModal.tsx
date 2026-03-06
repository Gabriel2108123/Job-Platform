'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Banknote, Calendar, FileText } from 'lucide-react';

interface OfferModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: {
        salaryAmount: number;
        salaryCurrency: string;
        proposedStartDate: string;
        notes?: string;
    }) => void;
    candidateName: string;
}

export function OfferModal({ open, onClose, onConfirm, candidateName }: OfferModalProps) {
    const [salaryAmount, setSalaryAmount] = useState<string>('');
    const [salaryCurrency, setSalaryCurrency] = useState('GBP');
    const [proposedStartDate, setProposedStartDate] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm({
                salaryAmount: parseFloat(salaryAmount),
                salaryCurrency,
                proposedStartDate,
                notes
            });
            onClose();
        } catch (error) {
            console.error('Failed to create offer:', error);
        } finally {
            setLoading(false);
        }
    };

    const currencies = ['GBP', 'EUR', 'USD'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-green-900">Make Official Offer</h3>
                        <p className="text-sm text-green-700 font-medium">Candidate: {candidateName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-green-600" />
                                Annual Salary
                            </label>
                            <Input
                                type="number"
                                required
                                placeholder="45000"
                                value={salaryAmount}
                                onChange={(e) => setSalaryAmount(e.target.value)}
                                className="w-full rounded-xl border-gray-200 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency</label>
                            <select
                                value={salaryCurrency}
                                onChange={(e) => setSalaryCurrency(e.target.value)}
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            >
                                {currencies.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            Proposed Start Date
                        </label>
                        <Input
                            type="date"
                            required
                            value={proposedStartDate}
                            onChange={(e) => setProposedStartDate(e.target.value)}
                            className="w-full rounded-xl border-gray-200 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            Offer Message / Notes
                        </label>
                        <textarea
                            placeholder="e.g. We were very impressed with your interview and would like to invite you to join our team..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
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
                            className="flex-1 rounded-xl py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold"
                            loading={loading}
                        >
                            Send Offer
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
