'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getJobPipeline, moveApplicationInPipeline, JobPipeline, PipelineApplication } from '@/lib/api/client';
import { useParams } from 'next/navigation';

const STATUS_COLORS: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-800',
  'Screening': 'bg-purple-100 text-purple-800',
  'Interviewed': 'bg-indigo-100 text-indigo-800',
  'Offered': 'bg-green-100 text-green-800',
  'PreHireChecks': 'bg-yellow-100 text-yellow-800',
  'Hired': 'bg-emerald-100 text-emerald-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Withdrawn': 'bg-gray-100 text-gray-800',
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PreHireChecks':
      return 'Pre-Hire Checks';
    default:
      return status;
  }
};

export default function PipelinePage() {
  const params = useParams();
  const jobId = params?.id as string;
  
  const [pipeline, setPipeline] = useState<JobPipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedApp, setDraggedApp] = useState<{
    applicationId: string;
    fromStatus: string;
  } | null>(null);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setError('Job ID not found');
      setLoading(false);
      return;
    }

    const fetchPipeline = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getJobPipeline(jobId);
        if (response.success && response.data) {
          setPipeline(response.data);
        } else {
          setError(response.error || 'Failed to load pipeline');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, [jobId]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    applicationId: string,
    fromStatus: string
  ) => {
    setDraggedApp({ applicationId, fromStatus });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    toStatus: string
  ) => {
    e.preventDefault();
    
    if (!draggedApp || draggedApp.fromStatus === toStatus || !jobId) {
      setDraggedApp(null);
      return;
    }

    setMoving(true);
    try {
      const response = await moveApplicationInPipeline(draggedApp.applicationId, toStatus);
      if (response.success) {
        // Update local pipeline state
        if (pipeline) {
          const newPipeline = { ...pipeline };
          // Remove from old stage
          const fromStageIdx = newPipeline.stages.findIndex(s => s.name === draggedApp.fromStatus);
          if (fromStageIdx >= 0) {
            newPipeline.stages[fromStageIdx].applicationIds = 
              newPipeline.stages[fromStageIdx].applicationIds.filter(
                id => id !== draggedApp.applicationId
              );
          }
          // Add to new stage
          const toStageIdx = newPipeline.stages.findIndex(s => s.name === toStatus);
          if (toStageIdx >= 0) {
            newPipeline.stages[toStageIdx].applicationIds.push(draggedApp.applicationId);
          }
          setPipeline(newPipeline);
        }
      } else {
        alert(response.error || 'Failed to move application');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setMoving(false);
      setDraggedApp(null);
    }
  };

  if (!jobId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-red-600">Job ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-full mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/business/jobs" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
            ← Back to Jobs
          </Link>
          <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">
            {pipeline?.jobTitle || 'Loading...'}
          </h1>
          <p className="text-gray-600">Manage your recruitment pipeline</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading pipeline...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Kanban Board */}
        {!loading && pipeline && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {pipeline.stages.map((stage) => (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  {/* Stage Header */}
                  <div className="bg-gray-200 rounded-t-lg p-4 mb-0">
                    <h2 className="font-semibold text-gray-800">
                      {getStatusLabel(stage.name)}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {stage.applicationIds.length} application{stage.applicationIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Stage Droppable Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.name)}
                    className="bg-gray-50 rounded-b-lg p-3 min-h-96 border-2 border-dashed border-gray-300 space-y-3"
                  >
                    {stage.applicationIds.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-12">
                        Drag candidates here
                      </p>
                    ) : (
                      stage.applicationIds.map((appId) => (
                        <Card
                          key={appId}
                          variant="default"
                          className="cursor-move hover:shadow-md transition-shadow"
                          draggable
                          onDragStart={(e) => handleDragStart(e, appId, stage.name)}
                        >
                          <CardBody className="p-3">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm text-gray-900">
                                Application
                              </div>
                              <Badge className={STATUS_COLORS[stage.name] || 'bg-gray-100 text-gray-800'}>
                                {getStatusLabel(stage.name)}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-2">
                                ID: {appId.slice(0, 8)}...
                              </p>
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Drag and drop candidate cards between columns to move them through your recruitment pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}
