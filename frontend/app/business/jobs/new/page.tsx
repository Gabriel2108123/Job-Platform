'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createJob, CreateJobDto, EmploymentType } from '@/lib/api/client';
import JobRoleSelector from '@/components/JobRoleSelector';

interface FormData {
  title: string;
  description: string;
  location: string;
  postalCode?: string;
  employmentType: 'FullTime' | 'PartTime' | 'Temporary';
  shiftPattern?: string;
  salary?: string;
  locationVisibility: 'PublicExact' | 'PrivateApprox';
  jobRoleId?: string;
}

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    postalCode: '',
    employmentType: 'FullTime',
    shiftPattern: '',
    salary: '',
    locationVisibility: 'PrivateApprox', // Default to privacy
    jobRoleId: undefined,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Job title is required';
    }
    if (!formData.jobRoleId) {
      errors.jobRoleId = 'Please select a job role';
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
    // Clear field error when user starts typing
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

    setLoading(true);
    setError(null);

    try {
      // Map form data to CreateJobDto
      const employmentTypeMap: Record<string, EmploymentType> = {
        'FullTime': EmploymentType.FullTime,
        'PartTime': EmploymentType.PartTime,
        'Temporary': EmploymentType.Temporary
      };

      const createDto: CreateJobDto = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        postalCode: formData.postalCode,
        locationVisibility: formData.locationVisibility,
        jobRoleId: formData.jobRoleId,
        employmentType: employmentTypeMap[formData.employmentType] || EmploymentType.FullTime,
        shiftPattern: 1, // Default to Day (1) - should be selectable in future
        salaryMin: formData.salary ? parseFloat(formData.salary) : undefined,
        salaryCurrency: 'GBP',
        salaryPeriod: 3, // Default to Year
      };

      const response = await createJob(createDto);
      if (response.success && response.data) {
        // Redirect to jobs list
        router.push('/business/jobs');
      } else {
        setError(response.error || 'Failed to create job');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link href="/business/jobs" className="text-[var(--brand-primary)] hover:underline mb-6 inline-block">
          ← Back to Jobs
        </Link>

        <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Create New Job</h1>
        <p className="text-gray-600 mb-8">Post a new job opening for your organization</p>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <Card variant="default">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
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
                  placeholder="e.g., Chef, Waiter, Bartender"
                  className={fieldErrors.title ? 'border-red-500' : ''}
                />
                {fieldErrors.title && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.title}</p>
                )}
              </div>

              {/* Job Role Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role <span className="text-red-500">*</span>
                </label>
                <JobRoleSelector
                  selectedRoleIds={formData.jobRoleId ? [formData.jobRoleId] : []}
                  onChange={(roleIds) => setFormData(prev => ({ ...prev, jobRoleId: roleIds[0] }))}
                  maxSelections={1}
                  placeholder="Select a job role..."
                />
                {fieldErrors.jobRoleId && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.jobRoleId}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Choose from our standardized hospitality roles
                </p>
              </div>

              {/* Location */}
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
                  placeholder="e.g., London, Manchester, Birmingham"
                  className={fieldErrors.location ? 'border-red-500' : ''}
                />
                {fieldErrors.location && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.location}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code (optional)
                </label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={handleChange}
                  placeholder="e.g., SW1A 1AA, M1 1AE"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Helps improve location accuracy on the map
                </p>
              </div>

              {/* Location Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Privacy <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="locationVisibility"
                      value="PrivateApprox"
                      checked={formData.locationVisibility === 'PrivateApprox'}
                      onChange={handleChange}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Private (Recommended)</span>
                      <p className="text-sm text-gray-600">
                        Show approximate area (~1km radius). Exact address hidden from public.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="locationVisibility"
                      value="PublicExact"
                      checked={formData.locationVisibility === 'PublicExact'}
                      onChange={handleChange}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Public (Exact location)</span>
                      <p className="text-sm text-gray-600">
                        Show exact address to all viewers on the map.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Employment Type */}
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

              {/* Shift Pattern */}
              <div>
                <label htmlFor="shiftPattern" className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Pattern
                </label>
                <Input
                  id="shiftPattern"
                  name="shiftPattern"
                  type="text"
                  value={formData.shiftPattern || ''}
                  onChange={handleChange}
                  placeholder="e.g., Days, Nights, Rotating shifts"
                />
              </div>

              {/* Salary */}
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                  Salary
                </label>
                <Input
                  id="salary"
                  name="salary"
                  type="text"
                  value={formData.salary || ''}
                  onChange={handleChange}
                  placeholder="e.g., £25,000 - £30,000 per year or hourly rate"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the job responsibilities, requirements, and benefits..."
                  rows={8}
                  className={`w-full px-3 py-2 border ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]`}
                />
                {fieldErrors.description && (
                  <p className="text-red-600 text-sm mt-1">{fieldErrors.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} / 50 characters minimum
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Link href="/business/jobs" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-[var(--brand-primary)]"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Job'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Your job will be saved as a draft. You can preview it and publish when ready.
          </p>
        </div>
      </div>
    </div>
  );
}
