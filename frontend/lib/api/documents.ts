import { apiRequest } from './client';

export interface DocumentDto {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string; // contentType
    uploadedByUserId: string;
    uploadedAt: string; // ISO date
    lastAccessedAt?: string;
    accessRuleCount: number;
    shareGrants?: DocumentShareGrantDto[]; // Augmented in frontend often
    downloadUrl?: string; // Augmented
}

export interface DocumentShareGrantDto {
    id: string;
    sharedWithUserId: string;
    sharedWithUserName: string;
    grantedAt: string;
    expiresAt?: string;
}

export interface CreateUploadResponse {
    documentId: string;
    presignedUrl: string;
    s3Key: string;
    expirationSeconds: number;
}

export interface DownloadUrlResponse {
    url: string;
    expirationSeconds: number;
}

export const documentsApi = {
    getMyDocuments: async () => {
        return apiRequest<DocumentDto[]>('/api/documents/my-documents?pageSize=50');
    },

    createUpload: async (fileName: string, fileSize: number, contentType: string) => {
        return apiRequest<CreateUploadResponse>('/api/documents/create-upload', {
            method: 'POST',
            body: JSON.stringify({ fileName, fileSizeBytes: fileSize, contentType })
        });
    },

    completeUpload: async (documentId: string, s3Key: string, fileSize: number) => {
        return apiRequest<DocumentDto>(`/api/documents/${documentId}/complete-upload`, {
            method: 'POST',
            body: JSON.stringify({ s3Key, fileSizeBytes: fileSize })
        });
    },

    getDownloadUrl: async (documentId: string) => {
        return apiRequest<DownloadUrlResponse>(`/api/documents/${documentId}/download-url`);
    },

    deleteDocument: async (documentId: string) => {
        return apiRequest(`/api/documents/${documentId}`, {
            method: 'DELETE'
        });
    }
};
