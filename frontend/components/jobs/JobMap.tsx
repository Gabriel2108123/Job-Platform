'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import type { JobDto } from '@/lib/api/client';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface JobMapProps {
    jobs: JobDto[];
}

export default function JobMap({ jobs }: JobMapProps) {
    useEffect(() => {
        // Ensure Leaflet CSS is loaded
        if (typeof window !== 'undefined') {
            // Check if CSS is already loaded
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

    // Filter jobs with valid coordinates from database
    const jobsWithCoords = jobs
        .filter(job => job.latApprox !== null && job.latApprox !== undefined &&
            job.lngApprox !== null && job.lngApprox !== undefined)
        .map(job => ({
            job,
            coords: [job.latApprox!, job.lngApprox!] as [number, number],
            isApprox: job.locationVisibility === 'PrivateApprox',
            radius: job.approxRadiusMeters || 1200,
        }));

    // Calculate center - UK center if no jobs, otherwise average of job locations
    const center: [number, number] = jobsWithCoords.length > 0
        ? [
            jobsWithCoords.reduce((sum, { coords }) => sum + coords[0], 0) / jobsWithCoords.length,
            jobsWithCoords.reduce((sum, { coords }) => sum + coords[1], 0) / jobsWithCoords.length,
        ]
        : [54.0, -2.5]; // UK center

    if (jobsWithCoords.length === 0) {
        return (
            <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-200">
                <div className="text-center max-w-md">
                    <div className="mb-4 text-6xl">🗺️</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Map Locations Available</h3>
                    <p className="text-gray-600 mb-4">
                        Jobs need location coordinates to appear on the map. Jobs with locations will be displayed here.
                    </p>
                    <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg inline-block">
                        Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''} total • 0 with map coordinates
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {jobsWithCoords.map(({ job, coords, isApprox, radius }) => (
                    <div key={job.id}>
                        {isApprox && (
                            <Circle
                                center={coords}
                                radius={radius}
                                pathOptions={{
                                    color: 'rgba(59, 130, 246, 0.5)',
                                    fillColor: 'rgba(59, 130, 246, 0.2)',
                                    fillOpacity: 0.3,
                                }}
                            />
                        )}
                        <Marker position={coords}>
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold text-[var(--brand-navy)] mb-1">{job.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {job.location}
                                        {isApprox && <span className="text-xs italic"> (approximate area)</span>}
                                    </p>
                                    {(job.salaryMin || job.salaryMax) && (
                                        <p className="text-sm font-semibold text-[var(--brand-primary)] mb-2">
                                            {job.salaryMin && job.salaryMax
                                                ? `£${job.salaryMin.toLocaleString()} - £${job.salaryMax.toLocaleString()}`
                                                : `£${(job.salaryMin || job.salaryMax)?.toLocaleString()}`}
                                        </p>
                                    )}
                                    <Link
                                        href={`/jobs/${job.id}`}
                                        className="inline-block px-3 py-1 bg-[var(--brand-primary)] text-white text-sm rounded hover:bg-[var(--brand-primary-hover)] transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    </div>
                ))}
            </MapContainer>
        </div>
    );
}
