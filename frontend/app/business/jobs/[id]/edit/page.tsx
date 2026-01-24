'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getJob, updateJob, UpdateJobDto, EmploymentType, JobDto } from '@/lib/api/client';

interface FormData {
    title: string;
    description: string;
    location: string;
    employmentType: 'FullTime' | 'PartTime' | 'Temporary';
    shiftPattern?: string;
    salary?: string;
}

export default function EditJobPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        location: '',
        employmentType: 'FullTime',
        shiftPattern: '',
        salary: '',
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!id) return;

        const fetchJob = async () => {
            try {
                const response = await getJob(id);
                if (response.success && response.data) {
                    const job = response.data;

                    // Map EmploymentType enum to string
                    let empType: FormData['employmentType'] = 'FullTime';
                    if (job.employmentType === EmploymentType.PartTime) empType = 'PartTime';
                    if (job.employmentType === EmploymentType.Temporary) empType = 'Temporary';

                    // Format salary
                    let salaryStr = '';
                    if (job.salaryMin || job.salaryMax) {
                        salaryStr = job.salaryMin && job.salaryMax
                            ? `${job.salaryMin} - ${job.salaryMax}`
                            : (job.salaryMin || job.salaryMax || '').toString();
                    }

                    setFormData({
                        title: job.title,
                        description: job.description,
                        location: job.location,
                        employmentType: empType,
                        shiftPattern: (job as any).shiftPatternName || '', // Fallback or map from enum if needed
                        salary: salaryStr // Simplified mapping or need more logic? 
                        // Note: The UI uses a single string input but backend uses Min/Max. 
                        // ideally we should split it, but for now let's just pre-fill Min.
                    });

                    // Better salary handling: if min is present use it.
                    if (job.salaryMin) {
                        setFormData(prev => ({ ...prev, salary: job.salaryMin?.toString() }));
                    }
                } else {
                    setError('Failed to load job');
                }
            } catch (err) {
                setError('An error occurred while loading');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) {
            errors.title = 'Job title is required';
        }
        if (!formData.description.trim()) {
            errors.description = 'Job description is required';
        }
        if (!formData.location.trim()) {
            errors.location = 'Location is required';
        }
        if (formData.description.trim().length < 50) {
            errors.description = 'Description must be at least 50 characters';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const employmentTypeMap: Record<string, EmploymentType> = {
                'FullTime': EmploymentType.FullTime,
                'PartTime': EmploymentType.PartTime,
                'Temporary': EmploymentType.Temporary
            };

            const updateDto: UpdateJobDto = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                roleType: 1,
                employmentType: employmentTypeMap[formData.employmentType] || EmploymentType.FullTime,
                shiftPattern: 1,
                salaryMin: formData.salary ? parseFloat(formData.salary) : undefined,
                salaryCurrency: 'GBP',
                salaryPeriod: 3,
            };

            const response = await updateJob(id, updateDto);
            if (response.success) {
                router.push('/business/jobs');
            } else {
                setError(response.error || 'Failed to update job');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/business/jobs" className="text-[var(--brand-primary)] hover:underline mb-6 inline-block">
                    ← Back to Jobs
                </Link>

                <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Edit Job</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <Card variant="default">
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={fieldErrors.title ? 'border-red-500' : ''}
                                />
                                {fieldErrors.title && <p className="text-red-600 text-sm mt-1">{fieldErrors.title}</p>}
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={fieldErrors.location ? 'border-red-500' : ''}
                                />
                                {fieldErrors.location && <p className="text-red-600 text-sm mt-1">{fieldErrors.location}</p>}
                            </div>

                            <div>
                                <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Employment Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="employmentType"
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                                >
                                    <option value="FullTime">Full-time</option>
                                    <option value="PartTime">Part-time</option>
                                    <option value="Temporary">Temporary</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                                    Salary (Min)
                                </label>
                                <Input
                                    id="salary"
                                    name="salary"
                                    type="text"
                                    value={formData.salary || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={8}
                                    className={`w-full px-3 py-2 border ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]`}
                                />
                                {fieldErrors.description && <p className="text-red-600 text-sm mt-1">{fieldErrors.description}</p>}
                            </div>

                            <div className="flex gap-3 pt-6 border-t">
                                <Link href="/business/jobs" className="flex-1">
                                    <Button variant="outline" className="w-full">Cancel</Button>
                                </Link>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1 bg-[var(--brand-primary)]"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
