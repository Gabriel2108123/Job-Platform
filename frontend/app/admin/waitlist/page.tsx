'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { Card, CardBody } from '@/components/ui';
import { apiRequest } from '@/lib/api/client';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  accountType: number;
  businessOrProfession: string;
  location: string;
  sequenceNumber: number;
  incentiveAwarded: string;
  createdAt: string;
}

interface WaitlistPagedResult {
  entries: WaitlistEntry[];
  totalCount: number;
}

export default function AdminWaitlist() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(50);
  const [accountTypeFilter, setAccountTypeFilter] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchEntries = async (page: number, filter: number | null) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString(),
        ...(filter !== null && { accountType: filter.toString() }),
      });

      const response = await apiRequest<WaitlistPagedResult>(`/api/waitlist/admin?${queryParams}`);

      if (!response.success) {
        setError(response.error || 'Failed to fetch waitlist entries.');
        return;
      }

      const data = response.data;
      setEntries(data?.entries || []);
      setTotalCount(data?.totalCount || 0);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(pageNumber, accountTypeFilter);
  }, [pageNumber, accountTypeFilter]);

  const handleFilterChange = (filter: number | null) => {
    setAccountTypeFilter(filter);
    setPageNumber(1);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiRequest(`/api/waitlist/admin/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        setError(response.error || 'Failed to delete entry.');
        return;
      }

      setEntries((prev) => prev.filter((e) => e.id !== id));
      setTotalCount((prev) => prev - 1);
      setDeleteConfirm(null);
    } catch {
      setError('Network error during deletion.');
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const queryParams = new URLSearchParams({
        ...(accountTypeFilter !== null && { accountType: accountTypeFilter.toString() }),
      });

      const response = await apiRequest<Blob>(`/api/waitlist/admin/export?${queryParams}`);

      if (!response.success || !response.data) {
        setError(response.error || 'Failed to export CSV.');
        return;
      }

      // Hack to fix TS error, apiRequest doesn't return a Response object with .blob()
      const blob = response.data as any as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitlist_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Network error during export.');
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-[var(--brand-off-white)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--brand-navy)] font-montserrat mb-2">Waitlist Management</h1>
          <p className="text-[var(--brand-charcoal)]/70 font-inter">Total entries: {totalCount}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--error)]/10 text-[var(--error)] rounded-lg border border-[var(--error)]/20 font-poppins">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => handleFilterChange(null)}
              variant={accountTypeFilter === null ? 'primary' : 'outline'}
              size="md"
              className="font-poppins"
            >
              All
            </Button>
            <Button
              onClick={() => handleFilterChange(1)}
              variant={accountTypeFilter === 1 ? 'primary' : 'outline'}
              size="md"
              className="font-poppins"
            >
              Employers
            </Button>
            <Button
              onClick={() => handleFilterChange(2)}
              variant={accountTypeFilter === 2 ? 'primary' : 'outline'}
              size="md"
              className="font-poppins"
            >
              Employees
            </Button>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting || loading}
            variant="secondary"
            size="md"
            className="font-poppins"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[var(--brand-charcoal)]/70 font-inter">Loading...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card variant="outline">
            <CardBody>
              <p className="text-center text-[var(--brand-charcoal)]/70 font-inter">No waitlist entries found.</p>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--brand-navy)]/20">
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">Name</th>
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">Email</th>
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">Type</th>
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">Profession</th>
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">Location</th>
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">#</th>
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">Incentive</th>
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">Joined</th>
                    <th className="text-left py-3 px-4 text-[var(--brand-navy)] font-semibold font-montserrat">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-[var(--brand-navy)]/10 hover:bg-[var(--gray-100)] transition font-inter">
                      <td className="py-3 px-4 text-[var(--brand-charcoal)]">{entry.name}</td>
                      <td className="py-3 px-4 text-[var(--brand-charcoal)] text-sm">{entry.email}</td>
                      <td className="py-3 px-4 text-[var(--brand-navy)] font-semibold">
                        {entry.accountType === 1 ? 'Employer' : 'Employee'}
                      </td>
                      <td className="py-3 px-4 text-[var(--brand-charcoal)]/70">{entry.businessOrProfession}</td>
                      <td className="py-3 px-4 text-[var(--brand-charcoal)]/70">{entry.location}</td>
                      <td className="py-3 px-4 text-[var(--brand-gold)] font-semibold">#{entry.sequenceNumber}</td>
                      <td className="py-3 px-4">
                        {entry.incentiveAwarded === 'TwelveMonthsFree' ? (
                          <span className="bg-[var(--success)]/10 text-[var(--success)] px-3 py-1 rounded text-sm font-poppins font-medium border border-[var(--success)]/20">
                            12 months free
                          </span>
                        ) : (
                          <span className="text-[var(--brand-charcoal)]/50 text-sm font-inter">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--brand-charcoal)]/70 text-sm">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {deleteConfirm === entry.id ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDelete(entry.id)}
                              variant="primary"
                              size="sm"
                              className="font-poppins"
                              style={{ backgroundColor: 'var(--error)' }}
                            >
                              Confirm
                            </Button>
                            <Button
                              onClick={() => setDeleteConfirm(null)}
                              variant="outline"
                              size="sm"
                              className="font-poppins"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setDeleteConfirm(entry.id)}
                            variant="ghost"
                            size="sm"
                            className="font-poppins text-[var(--error)] hover:bg-[var(--error)]/10"
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {entries.map((entry) => (
                <Card key={entry.id} variant="default">
                  <CardBody>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-[var(--brand-navy)] font-montserrat">{entry.name}</p>
                        <p className="text-sm text-[var(--brand-charcoal)]/70 font-inter">{entry.email}</p>
                      </div>
                      <span className="text-[var(--brand-navy)] font-semibold text-sm font-poppins">
                        {entry.accountType === 1 ? 'Employer' : 'Employee'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm mb-3 font-inter">
                      <p className="text-[var(--brand-charcoal)]/70">
                        <span className="text-[var(--brand-gold)] font-poppins font-medium">Role:</span> {entry.businessOrProfession}
                      </p>
                      <p className="text-[var(--brand-charcoal)]/70">
                        <span className="text-[var(--brand-gold)] font-poppins font-medium">Location:</span> {entry.location}
                      </p>
                      <p className="text-[var(--brand-charcoal)]/70">
                        <span className="text-[var(--brand-gold)] font-poppins font-medium">Sequence:</span> #{entry.sequenceNumber}
                      </p>
                      <p className="text-[var(--brand-charcoal)]/70">
                        <span className="text-[var(--brand-gold)] font-poppins font-medium">Joined:</span> {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {entry.incentiveAwarded === 'TwelveMonthsFree' ? (
                        <span className="bg-[var(--success)]/10 text-[var(--success)] px-3 py-1 rounded text-sm font-poppins font-medium border border-[var(--success)]/20">
                          12 months free
                        </span>
                      ) : (
                        <span className="text-[var(--brand-charcoal)]/50 text-sm font-inter">No incentive</span>
                      )}

                      {deleteConfirm === entry.id ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDelete(entry.id)}
                            variant="primary"
                            size="sm"
                            className="font-poppins"
                            style={{ backgroundColor: 'var(--error)' }}
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirm(null)}
                            variant="outline"
                            size="sm"
                            className="font-poppins"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setDeleteConfirm(entry.id)}
                          variant="ghost"
                          size="sm"
                          className="font-poppins text-[var(--error)] hover:bg-[var(--error)]/10"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex gap-2 justify-center items-center flex-wrap">
            <Button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber === 1}
              variant="outline"
              size="md"
              className="font-poppins"
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setPageNumber(page)}
                variant={pageNumber === page ? 'primary' : 'outline'}
                size="md"
                className="font-poppins"
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
              disabled={pageNumber === totalPages}
              variant="outline"
              size="md"
              className="font-poppins"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
