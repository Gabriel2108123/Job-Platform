import React, { useState } from 'react';

interface PreHireChecksConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (payload: { preHireConfirmation: true; preHireConfirmationText: string }) => void;
}

export function PreHireChecksConfirmModal({ open, onClose, onConfirm }: PreHireChecksConfirmModalProps) {
    const [isChecked, setIsChecked] = useState(false);
    const [details, setDetails] = useState('');

    if (!open) return null;

    const handleConfirm = () => {
        onConfirm({
            preHireConfirmation: true,
            preHireConfirmationText: details
        });
    };

    const isComplete = isChecked && details.trim().length >= 20;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Confirm Pre-Hire Checks</h3>
                </div>

                <div className="px-6 py-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Before moving a candidate to "Hired", you must confirm that you have completed all necessary pre-hire and right-to-work checks.
                        <br /><br />
                        <strong>Note:</strong> The platform does not verify documents or right-to-work status. This is to ensure compliance while keeping employment responsibility strictly with the employer.
                    </p>

                    <label className="flex items-start mb-4 cursor-pointer">
                        <div className="flex items-center h-5">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <span className="font-medium text-gray-900">Right-to-work checks completed (employer responsibility)</span>
                        </div>
                    </label>

                    <div className="mb-2">
                        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                            Details (Who did it, when, what was checked)
                        </label>
                        <textarea
                            id="details"
                            rows={4}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="e.g., Jane Doe verified the BRP on 2026-03-05..."
                            className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {details.length > 0 && details.length < 20 && (
                            <p className="mt-1 text-xs text-red-500">Please provide at least 20 characters of detail.</p>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 text-right space-x-3 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isComplete}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${isComplete ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed'}
            `}
                    >
                        Confirm & Hire
                    </button>
                </div>
            </div>
        </div>
    );
}
