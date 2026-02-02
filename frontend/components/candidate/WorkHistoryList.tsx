'use client';

import { useState } from 'react';
import { WorkExperienceDto, deleteWorkExperience, createWorkExperience, updateWorkExperience, CreateWorkExperienceDto, UpdateWorkExperienceDto } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import WorkHistoryForm from './WorkHistoryForm';

interface WorkHistoryListProps {
    workExperiences: WorkExperienceDto[];
    onRefresh: () => void;
}

export default function WorkHistoryList({ workExperiences, onRefresh }: WorkHistoryListProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleCreate = async (data: CreateWorkExperienceDto | UpdateWorkExperienceDto) => {
        await createWorkExperience(data as CreateWorkExperienceDto);
        setIsAdding(false);
        onRefresh();
    };

    const handleUpdate = async (id: string, data: CreateWorkExperienceDto | UpdateWorkExperienceDto) => {
        await updateWorkExperience(id, data as UpdateWorkExperienceDto);
        setEditingId(null);
        onRefresh();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this work experience?')) {
            await deleteWorkExperience(id);
            onRefresh();
        }
    };

    if (isAdding) {
        return (
            <Card>
                <CardBody className="p-6">
                    <h3 className="font-bold text-lg mb-4">Add New Work Experience</h3>
                    <WorkHistoryForm
                        onSubmit={(data) => handleCreate(data)}
                        onCancel={() => setIsAdding(false)}
                    />
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Work History</h2>
                <Button onClick={() => setIsAdding(true)}>+ Add Role</Button>
            </div>

            {workExperiences.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">No work history added yet.</p>
                    <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
                        Add your first role
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {workExperiences.map((work) => (
                        <Card key={work.id} className="overflow-hidden">
                            {editingId === work.id ? (
                                <CardBody className="p-6">
                                    <h3 className="font-bold text-lg mb-4">Edit Role</h3>
                                    <WorkHistoryForm
                                        initialData={work}
                                        onSubmit={(data) => handleUpdate(work.id, data)}
                                        onCancel={() => setEditingId(null)}
                                    />
                                </CardBody>
                            ) : (
                                <div className="p-6 flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-[var(--brand-navy)]">{work.roleTitle || 'Role'} at {work.employerName}</h3>
                                        <p className="text-gray-600 text-sm mb-1">{work.locationText}</p>
                                        <p className="text-gray-500 text-xs mb-3">
                                            {work.startDate ? new Date(work.startDate).toLocaleDateString() : 'Start'} - {work.endDate ? new Date(work.endDate).toLocaleDateString() : 'Present'}
                                        </p>

                                        <div className="flex gap-2 text-xs">
                                            <span className={`px-2 py-1 rounded-full ${work.visibilityLevel === 'private' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {work.visibilityLevel === 'private' ? '🔒 Private' : work.visibilityLevel === 'applied_only' ? '👁 When Applied' : '📋 Shortlisted Only'}
                                            </span>
                                            {work.isMapEnabled && (
                                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">🗺️ On Map</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(work.id)}>Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(work.id)}>Delete</Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
