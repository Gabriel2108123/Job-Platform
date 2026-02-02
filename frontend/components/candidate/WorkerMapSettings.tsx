'use client';

import { useState, useEffect } from 'react';
import { CandidateMapSettingsDto, getMapSettings, updateMapSettings } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';

export default function WorkerMapSettings() {
    const [settings, setSettings] = useState<CandidateMapSettingsDto | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getMapSettings().then(setSettings).catch(console.error);
    }, []);

    const handleToggle = async (key: keyof CandidateMapSettingsDto) => {
        if (!settings) return;
        const newValue = !settings[key];
        const update = { [key]: newValue };

        // Optimistic update
        setSettings(prev => prev ? ({ ...prev, ...update }) : null);

        try {
            await updateMapSettings(update);
        } catch (error) {
            console.error('Failed to update settings:', error);
            // Revert on error
            setSettings(prev => prev ? ({ ...prev, [key]: !newValue }) : null);
        }
    };

    if (!settings) return <div className="text-gray-400">Loading settings...</div>;

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Worker Map Settings</h3>

            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="pt-1">
                        <input
                            type="checkbox"
                            id="workerMapEnabled"
                            checked={settings.workerMapEnabled}
                            onChange={() => handleToggle('workerMapEnabled')}
                            className="h-5 w-5 text-[var(--brand-primary)] rounded border-gray-300 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="workerMapEnabled" className="font-medium text-gray-900 cursor-pointer block">
                            Enable My Worker Map
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                            When enabled, approved businesses can see your work history map (based on your privacy rules per job).
                            If disabled, no map is ever shown, regardless of individual job settings.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                    <div className="pt-1">
                        <input
                            type="checkbox"
                            id="discoverableByWorkplaces"
                            checked={settings.discoverableByWorkplaces}
                            onChange={() => handleToggle('discoverableByWorkplaces')}
                            className="h-5 w-5 text-[var(--brand-primary)] rounded border-gray-300 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label htmlFor="discoverableByWorkplaces" className="font-medium text-gray-900 cursor-pointer block">
                            Discoverable by Coworkers
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                            Allow verified past coworkers (who worked at the same place around the same time) to find and connect with you.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
