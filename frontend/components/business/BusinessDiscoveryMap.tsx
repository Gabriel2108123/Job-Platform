'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { NearbyCandidateDto } from '@/lib/api/client';
import { ShieldCheck, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom icons using Lucide and DivIcon
const createCustomIcon = (color: string, connectionCount?: number) => {
    const iconMarkup = renderToStaticMarkup(
        <div className="relative">
            <MapPin size={30} fill={color} color="white" strokeWidth={1} />
            {connectionCount !== undefined && connectionCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-white text-[10px] font-bold px-1 rounded-full border border-gray-200 shadow-sm text-blue-600">
                    {connectionCount}
                </div>
            )}
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: 'custom-leaflet-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};

const jobIcon = createCustomIcon('#1e3a8a'); // Navy
const candidateIcon = createCustomIcon('#ec4899'); // Pink

interface BusinessDiscoveryMapProps {
    center: { lat: number; lng: number };
    radiusKm: number;
    candidates: NearbyCandidateDto[];
    onCandidateClick: (candidate: NearbyCandidateDto) => void;
}

export default function BusinessDiscoveryMap({
    center,
    radiusKm,
    candidates,
    onCandidateClick
}: BusinessDiscoveryMapProps) {
    useEffect(() => {
        // Ensure Leaflet CSS is loaded
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

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Job Location Center */}
                <Marker position={[center.lat, center.lng]} icon={jobIcon}>
                    <Popup>
                        <div className="font-bold">Job Location</div>
                    </Popup>
                </Marker>

                {/* Discovery Radius */}
                <Circle
                    center={[center.lat, center.lng]}
                    radius={radiusKm * 1000}
                    pathOptions={{
                        fillColor: '#1e3a8a',
                        fillOpacity: 0.1,
                        color: '#1e3a8a',
                        opacity: 0.3,
                        weight: 1
                    }}
                />

                {/* Candidate Markers */}
                {candidates.map((cand) => cand.latApprox && cand.lngApprox && (
                    <Marker
                        key={cand.candidateUserId}
                        position={[cand.latApprox, cand.lngApprox]}
                        icon={createCustomIcon('#ec4899', cand.verifiedConnectionCount)}
                        eventHandlers={{
                            click: () => onCandidateClick(cand)
                        }}
                    >
                        <Popup>
                            <div className="p-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <strong className="text-[var(--brand-navy)] uppercase text-xs">{cand.name}</strong>
                                    {cand.verifiedConnectionCount > 0 && (
                                        <span className="bg-blue-100 text-blue-700 text-[10px] px-1 rounded flex items-center gap-0.5 font-bold">
                                            <ShieldCheck size={10} /> {cand.verifiedConnectionCount}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    {cand.currentRole || 'Worker'} • {cand.distanceKm} km
                                </div>
                                <button
                                    className="w-full bg-[var(--brand-primary)] text-white text-[10px] py-1 rounded font-bold uppercase tracking-wider"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCandidateClick(cand);
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
