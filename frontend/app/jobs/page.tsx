'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getJobs, JobDto, JobPagedResult, EmploymentType } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';

// Dynamically import JobMap to avoid SSR issues with Leaflet
const JobMap = dynamic(() => import('@/components/jobs/JobMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>,
});

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['jobs', { search, locationFilter, employmentTypeFilter, currentPage }],
    queryFn: () => getJobs({
      page: currentPage,
      pageSize: 10,
      search: search || undefined,
      location: locationFilter || undefined,
      employmentType: employmentTypeFilter || undefined,
    }),
  });

  const error = queryError instanceof Error ? queryError.message : (data?.success === false ? data.error : null);

  const jobs: JobDto[] = data?.success && data.data
    ? ('items' in data.data ? (data.data as JobPagedResult).items : (data.data as JobDto[]))
    : [];

  const totalPages = data?.success && data.data && 'totalPages' in data.data
    ? (data.data as JobPagedResult).totalPages
    : 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmploymentTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const getEmploymentTypeBadgeColor = (type: EmploymentType) => {
    switch (type) {
      case EmploymentType.FullTime:
        return 'bg-blue-100 text-blue-800';
      case EmploymentType.PartTime:
        return 'bg-green-100 text-green-800';
      case EmploymentType.Casual:
        return 'bg-purple-100 text-purple-800';
      case EmploymentType.Temporary:
        return 'bg-yellow-100 text-yellow-800';
      case EmploymentType.Contract:
        return 'bg-indigo-100 text-indigo-800';
      case EmploymentType.ZeroHours:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Jobs</h1>
          <p className="text-gray-600">Find your next hospitality opportunity</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                type="text"
                placeholder="Job title, location..."
                value={search}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                type="text"
                placeholder="Filter by location"
                value={locationFilter}
                onChange={handleLocationChange}
                className="w-full"
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={employmentTypeFilter}
                onChange={handleEmploymentTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              >
                <option value="">All Types</option>
                <option value="FullTime">Full Time</option>
                <option value="PartTime">Part Time</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'list'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'map'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No jobs found matching your criteria</p>
            <Button
              onClick={() => {
                setSearch('');
                setLocationFilter('');
                setEmploymentTypeFilter('');
              }}
              variant="primary"
            >
              Clear Filters
            </Button>
          </div>
        )}


        {/* Map View */}
        {viewMode === 'map' && !loading && jobs.length > 0 && (
          <div className="mb-8">
            <JobMap jobs={jobs} />
          </div>
        )}

        {/* Jobs Grid */}
        {viewMode === 'list' && !loading && jobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card
                    variant="default"
                    className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                  >
                    <CardBody>
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-[var(--brand-navy)] mb-2 line-clamp-2">
                        {job.title}
                      </h3>

                      {/* Location */}
                      <p className="text-gray-600 mb-3 text-sm">{job.location}</p>

                      {/* Salary */}
                      {(job.salaryMin || job.salaryMax) && (
                        <p className="text-[var(--brand-primary)] font-semibold mb-3">
                          {job.salaryMin && job.salaryMax ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}` : job.salaryMin?.toLocaleString() || job.salaryMax?.toLocaleString()} {job.salaryCurrency || 'GBP'}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getEmploymentTypeBadgeColor(job.employmentType)}>
                          {job.employmentTypeName}
                        </Badge>
                        {job.shiftPatternName && (
                          <Badge className="bg-purple-100 text-purple-800">
                            {job.shiftPatternName}
                          </Badge>
                        )}
                        {job.status === 1 && (
                          <Badge className="bg-green-100 text-green-800">Published</Badge>
                        )}
                      </div>

                      {/* Description Preview */}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {job.description}
                      </p>

                      {/* View Button */}
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        View Details
                      </Button>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mb-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
