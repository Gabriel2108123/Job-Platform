'use client';

import { useState, useEffect } from 'react';
import { getApplicationWorkHistory, getApplicationConnectionCount, WorkExperienceDto } from '@/lib/api/client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Users, ShieldCheck, X, Sparkles } from 'lucide-react';

// Dynamically import map to avoid SSR issues
const WorkerMap = dynamic(() => import('@/components/candidate/WorkerMap'), { ssr: false });

interface CandidateApplicationViewProps {
    applicationId: string;
    candidateName: string;
    jobId?: string;
    onClose: () => void;
}

export default function CandidateApplicationView({ applicationId, candidateName, jobId, onClose }: CandidateApplicationViewProps) {
    const [workExperiences, setWorkExperiences] = useState<WorkExperienceDto[]>([]);
    const [connectionCount, setConnectionCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!applicationId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [history, count] = await Promise.all([
                    getApplicationWorkHistory(applicationId),
                    getApplicationConnectionCount(applicationId)
                ]);
                setWorkExperiences(history || []);
                setConnectionCount(count || 0);
            } catch (err) {
                console.error("Failed to load candidate data:", err);
                setError("Unable to load profile details. Full visibility may require moving the candidate to a later stage.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [applicationId]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--brand-navy)]">Candidate Profile</h2>
                        <p className="text-gray-600 font-medium">{candidateName}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand-primary)]"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                            {error}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Work History List */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Work Experience</h3>
                                    {workExperiences.length === 0 ? (
                                        <p className="text-gray-500 italic">No work history visible at this stage.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {workExperiences.map((work) => (
                                                <div key={work.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                    <h4 className="font-bold text-[var(--brand-navy)]">{work.roleTitle || 'Role'} at {work.employerName}</h4>
                                                    <div className="text-sm text-gray-600 mt-1 flex flex-col gap-1">
                                                        <span>{work.locationText}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {work.startDate ? new Date(work.startDate).toLocaleDateString() : 'Start'} - {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Present'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Network Verification Section */}
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-blue-600" />
                                        Network Verification
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-lg shadow-sm">
                                            <div className="text-2xl font-bold text-blue-900">{connectionCount ?? 0}</div>
                                            <div className="text-xs text-blue-600 uppercase font-bold tracking-wider">Connections</div>
                                        </div>
                                        <div className="text-sm text-blue-800">
                                            This candidate has <strong>{connectionCount ?? 0} verified coworker connections</strong> on the platform.
                                            These are people who worked at the same location during the same period and have mutually
                                            confirmed their professional relationship.
                                        </div>
                                    </div>
                                </div>

                                {jobId && (
                                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-6">
                                        <h3 className="font-bold text-pink-900 mb-3 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-pink-600" />
                                            Talent Discovery
                                        </h3>
                                        <p className="text-sm text-pink-800 mb-4">
                                            Want to find more workers like {candidateName} in this area?
                                            Use our discovery tool to find and invite more verified talent.
                                        </p>
                                        <Link href={`/business/jobs/${jobId}/discovery`}>
                                            <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white border-none rounded-xl">
                                                Find More Workers Nearby
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Worker Map */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Worker Map</h3>
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 h-[400px]">
                                    <WorkerMap workExperiences={workExperiences} />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Map locations are approximate and only shown if enabled by the candidate and permitted by the current application stage.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
}
