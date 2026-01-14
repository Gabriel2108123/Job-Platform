'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireVerifiedEmail } from '@/components/auth/RequireVerifiedEmail';
import { apiRequest } from '@/lib/api/client';

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  downloadUrl?: string;
  shareGrants: ShareGrant[];
}

interface ShareGrant {
  id: string;
  sharedWithUserId: string;
  sharedWithUserName: string;
  grantedAt: string;
  expiresAt?: string;
}

export default function DocumentsPage() {
  return (
    <RequireAuth>
      <RequireVerifiedEmail>
        <DocumentsContent />
      </RequireVerifiedEmail>
    </RequireAuth>
  );
}

function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<Document[]>('/api/documents/my-documents');
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Step 1: Create upload
      const createResponse = await apiRequest<{ uploadUrl: string; documentId: string }>(
        '/api/documents/create-upload',
        {
          method: 'POST',
          body: JSON.stringify({
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
          }),
        }
      );

      if (!createResponse.success || !createResponse.data) {
        throw new Error('Failed to create upload');
      }

      const { uploadUrl, documentId } = createResponse.data;

      // Step 2: Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      // Step 3: Complete upload
      await apiRequest(`/api/documents/${documentId}/complete-upload`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Refresh documents list
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await apiRequest<{ downloadUrl: string }>(
        `/api/documents/${documentId}/download-url`
      );
      
      if (response.success && response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to get download URL:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleRevokeShare = async (documentId: string, grantId: string) => {
    try {
      await apiRequest(`/api/documents/${documentId}/access/${grantId}`, {
        method: 'DELETE',
      });
      fetchDocuments();
    } catch (error) {
      console.error('Failed to revoke access:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader title="Documents" description="Manage your documents securely" />
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Documents"
          description="Upload, share, and manage documents securely"
        />

        {/* Upload Section */}
        <Card variant="default" className="mb-6">
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[var(--brand-primary)] file:text-white
                    hover:file:bg-[var(--brand-accent)]
                    file:cursor-pointer"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                variant="primary"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Note: We don't store passports or visas. Share documents safely with employers when needed.
            </p>
          </CardBody>
        </Card>

        {/* Documents List */}
        {documents.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No documents yet"
            description="Upload documents like CVs, certificates, or references to share with employers."
          />
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} variant="default">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{doc.fileName}</h4>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {doc.shareGrants.length > 0 && (
                        <div className="mt-3 pl-13">
                          <p className="text-sm font-medium text-gray-700 mb-2">Shared with:</p>
                          <div className="space-y-2">
                            {doc.shareGrants.map((grant) => (
                              <div key={grant.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-100 text-green-800">Shared</Badge>
                                  <span className="text-sm text-gray-900">{grant.sharedWithUserName}</span>
                                </div>
                                <Button
                                  onClick={() => handleRevokeShare(doc.id, grant.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Revoke
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleDownload(doc.id)}
                      variant="outline"
                      size="sm"
                    >
                      Download
                    </Button>
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
