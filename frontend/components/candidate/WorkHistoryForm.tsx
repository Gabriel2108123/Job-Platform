'use client';

import { useState, useEffect } from 'react';
import { CreateWorkExperienceDto, UpdateWorkExperienceDto, WorkExperienceDto } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface WorkHistoryFormProps {
    initialData?: WorkExperienceDto;
    onSubmit: (data: CreateWorkExperienceDto | UpdateWorkExperienceDto) => Promise<void>;
    onCancel: () => void;
}

export default function WorkHistoryForm({ initialData, onSubmit, onCancel }: WorkHistoryFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateWorkExperienceDto>({
        employerName: initialData?.employerName || '',
        locationText: initialData?.locationText || '',
        city: initialData?.city || '',
        postalCode: initialData?.postalCode || '',
        roleTitle: initialData?.roleTitle || '',
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        visibilityLevel: initialData?.visibilityLevel || 'private',
        isMapEnabled: initialData?.isMapEnabled || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Failed to save work experience:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Employer Name *</label>
                    <Input
                        name="employerName"
                        value={formData.employerName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. The Grand Hotel"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Role Title</label>
                    <Input
                        name="roleTitle"
                        value={formData.roleTitle}
                        onChange={handleChange}
                        placeholder="e.g. Head Chef"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Location (City/Area) *</label>
                    <Input
                        name="locationText"
                        value={formData.locationText}
                        onChange={handleChange}
                        required
                        placeholder="e.g. London"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="e.g. SW1A 1AA (Optional, for map accuracy)"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        placeholder="Leave blank if current"
                    />
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-semibold text-gray-900">Privacy & Visibility</h3>

                <div>
                    <label className="block text-sm font-medium mb-1">Who can see this?</label>
                    <select
                        name="visibilityLevel"
                        value={formData.visibilityLevel}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="private">Private (Only me)</option>
                        <option value="applied_only">When I apply (Recruiters I apply to)</option>
                        <option value="shortlisted_only">When shortlisted (Only if shortlisted)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        "Private" entries are never shown to businesses. "When I apply" makes it visible after you submit an application.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isMapEnabled"
                        name="isMapEnabled"
                        checked={formData.isMapEnabled}
                        onChange={handleChange}
                        className="h-4 w-4 text-[var(--brand-primary)] rounded border-gray-300"
                    />
                    <label htmlFor="isMapEnabled" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Show on my Worker Map
                    </label>
                </div>
                <p className="text-xs text-gray-500 ml-7">
                    If enabled, this location (approximate) will appear on your "Worker Map" profile tab. Only visible to you unless you update your map settings.
                </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : initialData ? 'Update Experience' : 'Add Experience'}
                </Button>
            </div>
        </form>
    );
}
