'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Network, MapPin, User, Briefcase } from 'lucide-react';
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

export interface CoworkerMarker {
    id: string;
    name: string;
    role: string;
    lat: number;
    lng: number;
    distance?: string;
    commonPlaces?: string[];
}

interface NetworkMapProps {
    center: { lat: number; lng: number };
    coworkers: CoworkerMarker[];
}

export function NetworkMap({ center, coworkers }: NetworkMapProps) {

    const createCustomIcon = (color: string) => {
        if (typeof window === 'undefined' || !L) return undefined;

        const iconMarkup = renderToStaticMarkup(
            <div className="relative group">
                <MapPin size={34} fill={color} color="white" strokeWidth={1.5} className="drop-shadow-md" />
                <div className="absolute top-1 left-1.5 text-white/90">
                    <User size={14} />
                </div>
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

    if (typeof window === 'undefined' || !L) {
        return (
            <div className="h-full w-full bg-slate-900 animate-pulse flex flex-col items-center justify-center text-indigo-400 font-bold rounded-[2.5rem]">
                <Network className="w-10 h-10 mb-4 opacity-50" />
                <span>Loading Network Map...</span>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative z-0 rounded-[2.5rem] overflow-hidden border-4 border-indigo-600 shadow-2xl">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
            >
                {/* Darker base map tailored for the hero section aesthetics */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
                />

                {coworkers.map((worker) => (
                    <Marker
                        key={worker.id}
                        position={[worker.lat, worker.lng]}
                        icon={createCustomIcon('#4f46e5')} // Indigo-600
                    >
                        <Popup className="custom-popup">
                            <div className="p-3 min-w-[180px]">
                                <div className="font-black text-slate-800 leading-tight mb-1">{worker.name}</div>
                                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Briefcase size={12} />
                                    {worker.role}
                                </div>
                                {worker.commonPlaces && worker.commonPlaces.length > 0 && (
                                    <div className="text-xs text-slate-500 mb-2">
                                        <span className="font-semibold text-slate-700">Seen at:</span> {worker.commonPlaces.join(', ')}
                                    </div>
                                )}
                                <div className="text-xs text-slate-400 text-right">
                                    {worker.distance ? worker.distance : 'Nearby'}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <style jsx global>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 1rem;
                    padding: 0;
                    overflow: hidden;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
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
