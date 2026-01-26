'use client';

import { CVBuilder } from '@/components/dashboard/CVBuilder';
import { RequireAuth } from '@/components/auth/RequireAuth';
import Link from 'next/link';

export default function CVBuilderPage() {
    return (
        <RequireAuth>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b py-4">
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="font-bold text-gray-900">Hospitality Profile Builder</h1>
                        <div className="w-20"></div>
                    </div>
                </div>
                <CVBuilder />
            </div>
        </RequireAuth>
    );
}
