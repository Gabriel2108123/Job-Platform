'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Plus, Trash2, Edit2, Save, X, FileText } from 'lucide-react';

interface MessageTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
}

export default function MessageTemplateManager() {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await apiRequest<MessageTemplate[]>('/api/messagetemplates');
            if (res.success && res.data) {
                setTemplates(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const payload = { name, subject, content };
        let res;

        if (editingId) {
            res = await apiRequest(`/api/messagetemplates/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            res = await apiRequest('/api/messagetemplates', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        if (res.success) {
            resetForm();
            fetchTemplates();
        } else {
            alert('Failed to save template');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            const res = await apiRequest(`/api/messagetemplates/${id}`, {
                method: 'DELETE'
            });
            if (res.success) {
                fetchTemplates();
            }
        }
    };

    const startEdit = (template: MessageTemplate) => {
        setEditingId(template.id);
        setName(template.name);
        setSubject(template.subject);
        setContent(template.content);
        setIsCreating(false);
    };

    const resetForm = () => {
        setEditingId(null);
        setIsCreating(false);
        setName('');
        setSubject('');
        setContent('');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <PageHeader
                    title="Message Templates"
                    description="Create and manage reusable messages for recruitment"
                    backLink={{ href: '/business', label: 'Back to Dashboard' }}
                />

                <div className="mb-8">
                    {!isCreating && !editingId ? (
                        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Create New Template
                        </Button>
                    ) : (
                        <Card className="border-2 border-[var(--brand-primary)] animate-in slide-in-from-top duration-300">
                            <CardBody className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-[var(--brand-navy)]">
                                        {editingId ? 'Edit Template' : 'New Template'}
                                    </h3>
                                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Internal Name</label>
                                        <Input
                                            placeholder="e.g. Reject after Screening"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Subject</label>
                                        <Input
                                            placeholder="Update on your application"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Message Content</label>
                                        <textarea
                                            className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none min-h-[200px]"
                                            placeholder="Hello {name}, thank you for your application..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={resetForm}>Cancel</Button>
                                        <Button variant="primary" className="flex-1" onClick={handleSave}>
                                            <Save className="h-4 w-4 mr-2" /> Save Template
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center py-12 text-gray-500">Loading templates...</p>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No templates created yet.</p>
                        </div>
                    ) : (
                        templates.map(template => (
                            <Card key={template.id} className="hover:shadow-md transition-shadow">
                                <CardBody className="p-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-[var(--brand-navy)]">{template.name}</h4>
                                        <p className="text-sm text-gray-500">{template.subject}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => startEdit(template)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(template.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
