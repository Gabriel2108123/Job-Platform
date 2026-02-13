'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireVerifiedEmail } from '@/components/auth/RequireVerifiedEmail';
import { documentsApi, DocumentDto } from '@/lib/api/documents';

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
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentsApi.getMyDocuments();
      if (response.success && response.data) {
        // Backend returns PagedResult<T>
        // @ts-ignore - Handle PagedResult vs Array check if needed, but assuming PagedResult based on backend code
        const docs = response.data.items || response.data;
        setDocuments(Array.isArray(docs) ? docs : []);
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
      // Step 1: Create upload intent
      const createRes = await documentsApi.createUpload(
        selectedFile.name,
        selectedFile.size,
        selectedFile.type || 'application/octet-stream' // Fallback content type
      );

      if (!createRes.success || !createRes.data) {
        throw new Error(createRes.error || 'Failed to create upload');
      }

      const { presignedUrl, documentId, s3Key } = createRes.data;

      // Step 2: Upload to S3 (Direct fetch)
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file content');
      }

      // Step 3: Complete upload
      await documentsApi.completeUpload(documentId, s3Key, selectedFile.size);

      // Reset and refresh
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
      const response = await documentsApi.getDownloadUrl(documentId);
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to get download URL:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentsApi.deleteDocument(documentId);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '🔴';
    if (['doc', 'docx'].includes(ext || '')) return '🔵';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '🖼️';
    return '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="Documents"
          description="Manage your CVs, certificates, and ID documents."
        />

        {/* Upload Card */}
        <Card className="border border-dashed border-gray-300 bg-white">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl mx-auto md:mx-0 mb-3">
                  📤
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Upload New Document</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PDF, DOCX, JPG, PNG. Max 5MB.
                </p>
              </div>

              <div className="flex-1 w-full max-w-sm">
                <div className="flex gap-2">
                  <label className="flex-1 block">
                    <span className="sr-only">Choose file</span>
                    <input
                      type="file"
                      className="block w-full text-sm text-slate-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-50 file:text-blue-700
                                      hover:file:bg-blue-100
                                      cursor-pointer"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    variant="primary"
                    className="whitespace-nowrap"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
                {selectedFile && (
                  <p className="mt-2 text-xs text-green-600 font-medium text-center md:text-left">
                    Ready to upload: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Documents List */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Files</h3>
          {documents.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description="Upload your CV or other documents to get started."
              icon={<span className="text-4xl text-gray-300">📁</span>}
            />
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardBody className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {getFileIcon(doc.fileName)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{doc.fileName}</h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.fileSize)} • Added {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.id)}
                        className="text-gray-600 hover:text-[var(--brand-primary)]"
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
