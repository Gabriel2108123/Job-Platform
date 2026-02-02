'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    getJob,
    JobDto,
    getNearbyCandidates,
    NearbyCandidateDto,
    getOutreachCreditBalance
} from '@/lib/api/client';
import BusinessDiscoveryMap from '@/components/business/BusinessDiscoveryMap';
import { NearbyCandidateList } from '@/components/business/NearbyCandidateList';
import { CandidateOutreachModal } from '@/components/business/CandidateOutreachModal';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Filter, Navigation, CreditCard, Sparkles, Map as MapIcon, List as ListIcon } from 'lucide-react';

export default function JobDiscoveryPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params?.id as string;

    const [job, setJob] = useState<JobDto | null>(null);
    const [candidates, setCandidates] = useState<NearbyCandidateDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [radiusKm, setRadiusKm] = useState(10);
    const [credits, setCredits] = useState(0);
    const [selectedCandidate, setSelectedCandidate] = useState<NearbyCandidateDto | null>(null);
    const [showOutreach, setShowOutreach] = useState<NearbyCandidateDto | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    useEffect(() => {
        if (!jobId) return;

        async function fetchData() {
            setLoading(true);
            try {
                const [jobRes, creditRes] = await Promise.all([
                    getJob(jobId),
                    getOutreachCreditBalance()
                ]);

                if (jobRes.success && jobRes.data) {
                    setJob(jobRes.data);
                    const candRes = await getNearbyCandidates(jobId, radiusKm);
                    setCandidates(candRes);
                }
                setCredits(creditRes);
            } catch (err) {
                console.error('Failed to fetch discovery data', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [jobId, radiusKm]);

    if (!job && !loading) {
        return (
            <div className="p-12 text-center">
                <h1 className="text-2xl font-bold">Job not found</h1>
                <Link href="/business/jobs" className="text-blue-600 hover:underline mt-4 inline-block">
                    Back to Jobs
                </Link>
            </div>
        );
    }

    const jobCenter = job?.latApprox && job?.lngApprox
        ? { lat: job.latApprox, lng: job.lngApprox }
        : { lat: 51.5074, lng: -0.1278 }; // Default to London

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Top Navigation Bar */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-white z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-[var(--brand-navy)] flex items-center gap-2">
                            <Sparkles className="text-pink-500" size={18} />
                            Worker Discovery
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">FOR: {job?.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-[var(--brand-navy)]' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <MapIcon size={16} /> Map
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[var(--brand-navy)]' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <ListIcon size={16} /> List
                        </button>
                    </div>

                    <div className="h-10 px-4 flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-xl">
                        <CreditCard className="text-pink-600" size={18} />
                        <span className="text-sm font-bold text-pink-700">{credits} Credits</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                {/* Left Panel: Search & Radius */}
                <aside className="w-96 border-r flex flex-col bg-gray-50/50 z-10 shrink-0">
                    <div className="p-6 border-b bg-white">
                        <h2 className="font-bold text-[var(--brand-navy)] mb-4 flex items-center gap-2">
                            <Navigation size={18} /> Discovery Range
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Radius</span>
                                    <span className="text-sm font-bold text-[var(--brand-primary)]">{radiusKm} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={radiusKm}
                                    onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
                                />
                            </div>
                            <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 rounded-xl border border-gray-100 italic text-xs text-gray-500">
                                <Sparkles size={14} className="text-[var(--brand-primary)] shrink-0" />
                                Showing workers who have opted-in to discoverability.
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <NearbyCandidateList
                            candidates={candidates}
                            loading={loading}
                            selectedCandidateId={selectedCandidate?.candidateUserId || null}
                            onCandidateClick={(c) => setSelectedCandidate(c)}
                            onContactClick={(c) => setShowOutreach(c)}
                        />
                    </div>
                </aside>

                {/* Right Panel: Map or Full List */}
                <section className="flex-1 relative bg-gray-100">
                    {viewMode === 'map' ? (
                        <div className="w-full h-full">
                            <BusinessDiscoveryMap
                                center={jobCenter}
                                radiusKm={radiusKm}
                                candidates={candidates}
                                onCandidateClick={(c) => {
                                    setSelectedCandidate(c);
                                    // Also focus list scroll if needed, or show marker popup
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full p-8 overflow-y-auto bg-white">
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-2xl font-bold text-[var(--brand-navy)] mb-6">Nearby Candidates List</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {candidates.map(c => (
                                        <div key={c.candidateUserId} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg uppercase tracking-tight">{c.name}</h4>
                                                    <p className="text-sm text-gray-500">{c.currentRole}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-[var(--brand-primary)]">{c.distanceKm} km</p>
                                                    <p className="text-xs text-gray-400">Away</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mb-6">
                                                <div className="flex-1 bg-blue-50 p-3 rounded-xl text-center">
                                                    <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-widest">Network Score</p>
                                                    <p className="text-xl font-bold text-blue-800">{c.verifiedConnectionCount}</p>
                                                </div>
                                                <div className="flex-1 bg-gray-50 p-3 rounded-xl text-center">
                                                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-widest">Employer</p>
                                                    <p className="text-sm font-bold text-gray-700 truncate">{c.currentEmployer || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="primary"
                                                className="w-full bg-[var(--brand-primary)] rounded-xl"
                                                onClick={() => setShowOutreach(c)}
                                            >
                                                Invite to Apply
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Outreach Modal */}
            {showOutreach && (
                <CandidateOutreachModal
                    candidateId={showOutreach.candidateUserId}
                    candidateName={showOutreach.name}
                    jobId={jobId}
                    creditBalance={credits}
                    onClose={() => setShowOutreach(null)}
                    onSuccess={(newBalance) => {
                        setCredits(newBalance);
                        alert(`Successfully contacted ${showOutreach.name}!`);
                    }}
                />
            )}
        </div>
    );
}
