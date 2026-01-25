'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

// Geocoding approximation - in production, use a geocoding service
const getCoordinatesForLocation = (location: string): [number, number] | null => {
    const locationMap: Record<string, [number, number]> = {
        'London': [51.5074, -0.1278],
        'Manchester': [53.4808, -2.2426],
        'Birmingham': [52.4862, -1.8904],
        'Liverpool': [53.4084, -2.9916],
        'Leeds': [53.8008, -1.5491],
        'Glasgow': [55.8642, -4.2518],
        'Edinburgh': [55.9533, -3.1883],
        'Bristol': [51.4545, -2.5879],
        'Cardiff': [51.4816, -3.1791],
        'Belfast': [54.5973, -5.9301],
    };

    // Try exact match first
    if (locationMap[location]) {
        return locationMap[location];
    }

    // Try partial match
    for (const [city, coords] of Object.entries(locationMap)) {
        if (location.toLowerCase().includes(city.toLowerCase())) {
            return coords;
        }
    }

    // Default to London if no match
    return [51.5074, -0.1278];
};

export default function JobMap({ jobs }: JobMapProps) {
    useEffect(() => {
        // Ensure Leaflet CSS is loaded
        if (typeof window !== 'undefined') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
        }
    }, []);

    // Filter jobs with valid locations
    const jobsWithCoords = jobs
        .map(job => ({
            job,
            coords: getCoordinatesForLocation(job.location),
        }))
        .filter(({ coords }) => coords !== null) as Array<{
            job: JobDto;
            coords: [number, number];
        }>;

    // Calculate center - UK center
    const center: [number, number] = [54.0, -2.5];

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
                {jobsWithCoords.map(({ job, coords }) => (
                    <Marker key={job.id} position={coords}>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-[var(--brand-navy)] mb-1">{job.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{job.location}</p>
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
                ))}
            </MapContainer>
        </div>
    );
}
