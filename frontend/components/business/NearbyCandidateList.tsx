'use client';

import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NearbyCandidateDto } from '@/lib/api/client';
import { ShieldCheck, MapPin, Briefcase, ChevronRight } from 'lucide-react';

interface NearbyCandidateListProps {
    candidates: NearbyCandidateDto[];
    selectedCandidateId: string | null;
    onCandidateClick: (candidate: NearbyCandidateDto) => void;
    onContactClick: (candidate: NearbyCandidateDto) => void;
    loading: boolean;
}

export function NearbyCandidateList({
    candidates,
    selectedCandidateId,
    onCandidateClick,
    onContactClick,
    loading
}: NearbyCandidateListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-white rounded-xl h-32 border border-gray-100" />
                ))}
            </div>
        );
    }

    if (candidates.length === 0) {
        return (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--brand-navy)]">No workers found nearby</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">
                    Try increasing the search radius or check back later as more workers join the map.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {candidates.map((cand) => (
                <Card
                    key={cand.candidateUserId}
                    className={`cursor-pointer transition-all duration-200 border-2 ${selectedCandidateId === cand.candidateUserId
                            ? 'border-[var(--brand-primary)] shadow-md bg-blue-50/30'
                            : 'border-transparent hover:border-gray-200 hover:shadow-sm'
                        }`}
                    onClick={() => onCandidateClick(cand)}
                >
                    <CardBody className="p-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-[var(--brand-navy)] truncate uppercase tracking-tight">
                                        {cand.name}
                                    </h4>
                                    {cand.verifiedConnectionCount > 0 && (
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 px-1.5 py-0.5">
                                            <ShieldCheck size={12} />
                                            {cand.verifiedConnectionCount}
                                        </Badge>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Briefcase size={14} />
                                        <span className="truncate">{cand.currentRole || 'Hospitality Professional'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <MapPin size={14} />
                                        <span>{cand.distanceKm} km away</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-[var(--brand-primary)] shrink-0 h-9 px-4 rounded-lg text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onContactClick(cand);
                                }}
                            >
                                Contact
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
