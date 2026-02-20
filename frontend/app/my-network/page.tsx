'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { getWorkExperiences, WorkExperienceDto } from '@/lib/api/client';
import dynamic from 'next/dynamic';
import WorkerMapSettings from '@/components/candidate/WorkerMapSettings';
import { PotentialCoworkerList } from '@/components/candidate/PotentialCoworkerList';
import { ConnectionInbox } from '@/components/candidate/ConnectionInbox';

const WorkerMap = dynamic(() => import('@/components/candidate/WorkerMap'), { ssr: false });

export default function MyNetworkPage() {
    const [workExperiences, setWorkExperiences] = useState<WorkExperienceDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getWorkExperiences();
                setWorkExperiences(data);
            } catch (error) {
                console.error("Failed to load network data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
        );
    }

    return (
        <RequireRole allowedRoles={['Candidate', 'BusinessOwner', 'Staff', 'Admin', 'Support']}>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[var(--brand-navy)]">My Network</h1>
                        <p className="text-gray-500 mt-2">
                            Connect with past colleagues and manage your professional visibility.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Column: Map and Connections */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Map Section */}
                            <Card>
                                <CardBody className="p-6">
                                    <h2 className="text-xl font-bold mb-4">Worker Map</h2>
                                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
                                        See where your verified work history places you on the map.
                                        Enable discovery to find others who worked at the same locations.
                                    </div>
                                    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200">
                                        <WorkerMap workExperiences={workExperiences} />
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Connection Requests */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold">Connection Requests</h2>
                                </div>
                                <div className="p-6">
                                    <ConnectionInbox />
                                </div>
                            </div>

                            {/* Potential Coworkers */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold">People You May Know</h2>
                                    <p className="text-gray-500 text-sm">Based on your work history overlaps.</p>
                                </div>
                                <div className="p-6">
                                    <PotentialCoworkerList />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Settings */}
                        <div className="space-y-6">
                            <WorkerMapSettings />

                            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                                <CardBody className="p-6">
                                    <h3 className="font-bold text-lg mb-2">Grow Your Network</h3>
                                    <p className="text-blue-100 text-sm mb-4">
                                        Adding more work experiences increases your chances of finding old friends.
                                    </p>
                                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                                        Update Work History
                                    </Button>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </RequireRole>
    );
}
