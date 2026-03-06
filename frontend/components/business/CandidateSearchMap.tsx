'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { CandidateSearchResult } from '@/lib/api/client';
import { ShieldCheck, MapPin, User } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for Leaflet icons in Next.js
let L: any;
if (typeof window !== 'undefined') {
    L = require('leaflet');
}

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });

interface CandidateSearchMapProps {
    center: { lat: number; lng: number };
    radiusKm: number;
    candidates: CandidateSearchResult[];
    onCandidateClick: (candidate: CandidateSearchResult) => void;
    jobLocation?: { lat: number; lng: number };
}

export default function CandidateSearchMap({
    center,
    radiusKm,
    candidates,
    onCandidateClick,
    jobLocation
}: CandidateSearchMapProps) {

    const createCustomIcon = (color: string, score?: number) => {
        if (typeof window === 'undefined' || !L) return undefined;

        const iconMarkup = renderToStaticMarkup(
            <div className="relative">
                <MapPin size={34} fill={color} color="white" strokeWidth={1.5} className="drop-shadow-md" />
                {score !== undefined && (
                    <div className={`absolute -top-2 -right-2 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm text-white ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-amber-500' : 'bg-gray-500'
                        }`}>
                        {Math.round(score)}%
                    </div>
                )}
            </div>
        );

        return L.divIcon({
            html: iconMarkup,
            className: 'custom-leaflet-icon',
            iconSize: [34, 34],
            iconAnchor: [17, 34],
            popupAnchor: [0, -34]
        });
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const existingLink = document.querySelector('link[href*="leaflet.css"]');
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
                link.crossOrigin = '';
                document.head.appendChild(link);
            }
        }
    }, []);

    if (typeof window === 'undefined' || !L) return <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 font-bold">Initializing Map...</div>;

    return (
        <div className="h-full w-full relative z-0 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                />

                {jobLocation && (
                    <Marker position={[jobLocation.lat, jobLocation.lng]} icon={createCustomIcon('#1e3a8a')}>
                        <Popup>
                            <div className="font-bold text-slate-800">Job HQ</div>
                        </Popup>
                    </Marker>
                )}

                <Circle
                    center={[center.lat, center.lng]}
                    radius={radiusKm * 1000}
                    pathOptions={{
                        fillColor: '#6366F1',
                        fillOpacity: 0.08,
                        color: '#6366F1',
                        opacity: 0.2,
                        weight: 2,
                        dashArray: '5, 10'
                    }}
                />

                {candidates.map((cand, idx) => {
                    // Placeholder coordinates if not present (realistically they would come from backend)
                    // We'll use the center with slight variations for demo if coords are missing
                    const lat = center.lat + (Math.random() - 0.5) * 0.05 * (radiusKm / 5);
                    const lng = center.lng + (Math.random() - 0.5) * 0.05 * (radiusKm / 5);

                    return (
                        <Marker
                            key={cand.userId}
                            position={[lat, lng]}
                            icon={createCustomIcon('#6366F1', cand.matchScore)}
                            eventHandlers={{
                                click: () => onCandidateClick(cand)
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="p-3 min-w-[200px]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border-2 border-indigo-100 flex items-center justify-center">
                                            {cand.profilePictureUrl ? (
                                                <img src={cand.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 leading-tight">{cand.firstName}</div>
                                            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{cand.primaryRole || 'Professional'}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {cand.skills?.slice(0, 3).map(skill => (
                                            <span key={skill} className="px-1.5 py-0.5 bg-gray-50 text-[9px] font-bold rounded text-gray-600 border border-gray-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => onCandidateClick(cand)}
                                        className="w-full py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Inspect Profile
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            <style jsx global>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 1.25rem;
                    padding: 0;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    width: auto !important;
                }
                .custom-popup .leaflet-popup-tip {
                    display: none;
                }
            `}</style>
        </div>
    );
}
