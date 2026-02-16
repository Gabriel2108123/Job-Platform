import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { WorkExperienceDto } from '@/lib/api/client';

// Fix for default marker icons in Leaflet - use CDN
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WorkerMapProps {
    workExperiences: WorkExperienceDto[];
}

export default function WorkerMap({ workExperiences }: WorkerMapProps) {
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

    // Filter for map-enabled experiences with valid coords
    const mapLocations = workExperiences.filter(
        w => w.isMapEnabled && w.latApprox != null && w.lngApprox != null
    );

    if (mapLocations.length === 0) {
        return (
            <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-green-200">
                <div className="text-4xl mb-3">📍</div>
                <h4 className="font-bold text-gray-700 mb-2">No Map Locations Available</h4>
                <p className="text-sm text-gray-600 max-w-xs">
                    Enable map visibility for your work experiences to show them here.
                </p>
            </div>
        );
    }

    // Calculate center (simple average or default to first point)
    const centerLat = mapLocations.reduce((sum, w) => sum + (w.latApprox || 0), 0) / mapLocations.length;
    const centerLng = mapLocations.reduce((sum, w) => sum + (w.lngApprox || 0), 0) / mapLocations.length;

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-inner border border-gray-200 relative z-0">
            {/* Force z-index 0 to prevent overlaying dropdowns */}
            <MapContainer
                center={[centerLat, centerLng]}
                zoom={11}
                scrollWheelZoom={false}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapLocations.map((work) => (
                    <div key={work.id}>
                        {/* Approximate Circle */}
                        <Circle
                            center={[work.latApprox!, work.lngApprox!]}
                            radius={800} // ~800m approximate radius
                            pathOptions={{
                                color: '#10B981', // Green for worker map
                                fillColor: '#10B981',
                                fillOpacity: 0.2
                            }}
                        />
                        <Marker position={[work.latApprox!, work.lngApprox!]}>
                            <Popup>
                                <div className="p-1">
                                    <strong className="block text-[var(--brand-navy)]">{work.employerName}</strong>
                                    <span className="text-xs text-gray-600">{work.roleTitle}</span>
                                    <div className="mt-1 text-xs text-green-600 font-medium">
                                        Visible to businesses based on stage
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    </div>
                ))}
            </MapContainer>
        </div>
    );
}
