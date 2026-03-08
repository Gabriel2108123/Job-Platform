'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getJobs, JobDto, JobPagedResult } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { JobCard } from '@/components/candidate/JobCard';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';

// Dynamically import JobMap to avoid SSR issues with Leaflet
const JobMap = dynamic(() => import('@/components/jobs/JobMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-slate-50 rounded-2xl flex items-center justify-center">Loading map...</div>,
});

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['jobs', { search, locationFilter, employmentTypeFilter, currentPage }],
    queryFn: () => getJobs({
      page: currentPage,
      pageSize: 10,
      search: search || undefined,
      location: locationFilter || undefined,
      employmentType: employmentTypeFilter.join(',') || undefined,
    }),
  });

  const error = queryError instanceof Error ? queryError.message : (data?.success === false ? data.error : null);

  const jobs: JobDto[] = data?.success && data.data
    ? ('items' in data.data ? (data.data as JobPagedResult).items : (data.data as JobDto[]))
    : [];

  const totalCount = data?.success && data.data && 'totalCount' in data.data
    ? (data.data as JobPagedResult).totalCount
    : jobs.length;

  const totalPages = data?.success && data.data && 'totalPages' in data.data
    ? (data.data as JobPagedResult).totalPages
    : 1;

  const toggleEmploymentType = (type: string) => {
    setEmploymentTypeFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Search */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <BrandLogo width={140} height={46} />
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 bg-slate-900 border-none shadow-lg shadow-slate-900/10">Join Now</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
              </div>
              <div className="md:w-64 relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
              </div>
              <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] px-10 h-auto py-5 font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20 border-none">
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-72 space-y-10">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Job Type</h4>
              <div className="space-y-4">
                {[
                  { id: 'FullTime', label: 'Full-time' },
                  { id: 'PartTime', label: 'Part-time' },
                  { id: 'Contract', label: 'Contract' },
                  { id: 'Temporary', label: 'Seasonal' }
                ].map(type => (
                  <label key={type.id} className="flex items-center gap-4 cursor-pointer group">
                    <div
                      onClick={() => toggleEmploymentType(type.id)}
                      className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${employmentTypeFilter.includes(type.id)
                          ? 'border-indigo-500 bg-indigo-500 shadow-lg shadow-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 group-hover:border-indigo-400'
                        }`}>
                      {employmentTypeFilter.includes(type.id) && <div className="w-2 h-2 rounded-sm bg-white" />}
                    </div>
                    <span className={`text-sm font-bold transition-colors ${employmentTypeFilter.includes(type.id) ? 'text-slate-900 dark:text-white' : 'text-slate-500 group-hover:text-slate-700'
                      }`}>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Role Category</h4>
              <div className="space-y-4">
                {['Front of House', 'Back of House', 'Management', 'Events'].map(cat => (
                  <label key={cat} className="flex items-center gap-4 cursor-pointer group">
                    <div className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-800 group-hover:border-indigo-400 transition-all flex items-center justify-center">
                      <div className="w-2 h-2 rounded-sm bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <p className="text-sm font-bold text-slate-500">
                Showing <span className="text-slate-900 dark:text-white">{totalCount} jobs</span> matching your search
              </p>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Map
                  </button>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.1em] gap-2 h-auto py-2.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Sort: Newest
                </Button>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-[2rem] text-sm font-bold">
                {error}
              </div>
            )}

            {!loading && jobs.length === 0 && !error && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-slate-500 font-bold mb-6">No jobs found matching your criteria</p>
                <Button
                  onClick={() => { setSearch(''); setLocationFilter(''); setEmploymentTypeFilter([]); }}
                  variant="primary"
                  className="rounded-xl font-bold uppercase tracking-widest px-8"
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {viewMode === 'map' && !loading && jobs.length > 0 && (
              <div className="mb-12 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50">
                <JobMap jobs={jobs} />
              </div>
            )}

            {viewMode === 'list' && !loading && jobs.length > 0 && (
              <div className="space-y-6">
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={{
                      id: job.id,
                      title: job.title,
                      company: job.organizationId, // Needs organization name in DTO ideally
                      location: job.location,
                      employmentTypeName: job.employmentTypeName,
                      salaryMin: job.salaryMin,
                      salaryMax: job.salaryMax,
                      salaryCurrency: job.salaryCurrency,
                      postedAt: '2h ago' // Mock for now, use job.createdAt
                    }}
                    onView={(id) => window.location.href = `/jobs/${id}`}
                    onApply={() => window.location.href = '/login'}
                  />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12 py-8">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="rounded-xl border-slate-200 font-bold px-6"
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-bold text-slate-500">
                      Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="rounded-xl border-slate-200 font-bold px-6"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
