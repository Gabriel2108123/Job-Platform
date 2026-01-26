'use client';

import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface CandidatePreviewProps {
    name: string;
    role: string;
    status: string;
    appliedAt: string;
    imageUrl?: string;
}

export function CandidatePreviewCard({ name, role, status, appliedAt, imageUrl }: CandidatePreviewProps) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100 cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-lg font-bold text-indigo-600 border border-indigo-50">
                    {imageUrl ? <img src={imageUrl} alt={name} className="w-full h-full rounded-full object-cover" /> : name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors">{name}</h4>
                    <p className="text-sm text-gray-500">{role} • {appliedAt}</p>
                </div>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
                {status}
            </Badge>
        </div>
    );
}
