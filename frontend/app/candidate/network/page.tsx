'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { NetworkCoworkerCard } from '@/components/candidate/NetworkCoworkerCard';
import { NetworkMap } from '@/components/candidate/NetworkMap';
import { Network, MapPin, Users, Globe } from 'lucide-react';

export default function CandidateNetworkPage() {
    const coworkers = [
        { id: '1', name: 'Alex Rivera', role: 'Bartender', distance: '0.4 miles away', commonPlaces: ['The Alchemist', 'Soho'], lat: 51.5136, lng: -0.1365 },
        { id: '2', name: 'James Chen', role: 'Head Chef', distance: '1.2 miles away', commonPlaces: ['Dishoom'], lat: 51.5284, lng: -0.1246 },
        { id: '3', name: 'Sarah Miller', role: 'Wait Staff', distance: '0.8 miles away', commonPlaces: ['Breakfast Club'], lat: 51.5098, lng: -0.1180 },
        { id: '4', name: 'Elena Petrova', role: 'Events Manager', distance: '2.5 miles away', commonPlaces: ['The Savoy'], lat: 51.5106, lng: -0.1203 },
    ];

    return (
        <RoleLayout pageTitle="Network">
            <div className="max-w-6xl">
                {/* Network Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                    <div className="lg:col-span-3 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden h-[240px] flex items-center">
                        <div className="relative z-10 max-w-lg">
                            <h2 className="text-3xl font-black mb-2 tracking-tight">Your Local Network</h2>
                            <p className="text-slate-400 text-sm font-medium mb-6">
                                Connect with coworkers in your area, share knowledge, and see where people are working.
                            </p>
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-2xl font-black">128</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Near You</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black">42</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connections</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
                        <Network className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 text-white/5" />
                    </div>

                    <div className="h-[240px]">
                        <NetworkMap
                            center={{ lat: 51.5100, lng: -0.1250 }}
                            coworkers={coworkers}
                        />
                    </div>
                </div>

                {/* Coworker Discovery */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Discover Coworkers</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-500">Filter by distance: <span className="text-indigo-600 cursor-pointer">5 miles</span></span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coworkers.map(coworker => (
                            <NetworkCoworkerCard key={coworker.id} coworker={coworker} />
                        ))}
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
