'use client';

import { useState, useEffect } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getPendingReports, resolveReport, updateModerationStatus, ReportDto } from '@/lib/api/client';

export default function AdminModerationPage() {
    return (
        <RequireAuth>
            <RequireRole allowedRoles={['Admin']}>
                <ModerationQueueContent />
            </RequireRole>
        </RequireAuth>
    );
}

function ModerationQueueContent() {
    const [reports, setReports] = useState<ReportDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<'All' | 'Job' | 'User'>('All');

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await getPendingReports();
            if (response.success && response.data) {
                setReports(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleResolve = async (reportId: string, status: 'Resolved' | 'Dismissed') => {
        setActionLoading(reportId);
        try {
            const response = await resolveReport(reportId, status, `Manually ${status.toLowerCase()} by admin.`);
            if (response.success) {
                setReports(reports.filter(r => r.id !== reportId));
            } else {
                alert(response.error || 'Failed to resolve report');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const handleBlock = async (report: ReportDto) => {
        if (!confirm(`Are you sure you want to BLOCK this ${report.targetType}? This will hide it from all users.`)) return;

        setActionLoading(report.id + '-block');
        try {
            const type = report.targetType.toLowerCase() === 'job' ? 'jobs' :
                report.targetType.toLowerCase() === 'user' ? 'users' : 'organizations';

            const response = await updateModerationStatus(type as any, report.targetId, 3); // 3 = Blocked
            if (response.success) {
                await handleResolve(report.id, 'Resolved');
            } else {
                alert(response.error || 'Failed to block target');
            }
        } catch (error) {
            alert('An error occurred while blocking');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredReports = reports.filter(r => filter === 'All' || r.targetType === filter);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Moderation Queue"
                    description="Review and resolve user reports"
                />

                <div className="mb-8 flex gap-2">
                    {['All', 'Job', 'User'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${filter === f
                                    ? 'bg-[var(--brand-primary)] text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {f}s
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <Card className="text-center py-20">
                        <div className="text-6xl mb-4">✨</div>
                        <h3 className="text-2xl font-black text-gray-900">All Clear!</h3>
                        <p className="text-gray-500 font-medium">No pending reports in the queue.</p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {filteredReports.map((report) => (
                            <Card key={report.id} className="overflow-hidden border-l-4 border-pink-500">
                                <CardBody className="p-8">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`${report.targetType === 'Job' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                    } px-3 py-1 rounded-lg font-black uppercase text-xs tracking-widest`}>
                                                    {report.targetType}
                                                </Badge>
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                    Reported on {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="text-2xl font-black text-gray-900 mb-1">{report.reason}</h4>
                                                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl italic border border-gray-100">
                                                    "{report.details || 'No additional details provided.'}"
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-tighter block mb-0.5">Target ID</span>
                                                    <code className="text-[var(--brand-primary)] font-black">{report.targetId}</code>
                                                </div>
                                                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-tighter block mb-0.5">Reporter</span>
                                                    <span className="font-bold text-gray-700">{report.reporterUserId}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 shrink-0 justify-center min-w-[200px]">
                                            <Button
                                                onClick={() => handleBlock(report)}
                                                className="bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg shadow-red-100"
                                                disabled={!!actionLoading}
                                            >
                                                {actionLoading === report.id + '-block' ? 'Blocking...' : `Block ${report.targetType}`}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleResolve(report.id, 'Dismissed')}
                                                className="font-bold py-3 rounded-xl border-2"
                                                disabled={!!actionLoading}
                                            >
                                                Dismiss Report
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
