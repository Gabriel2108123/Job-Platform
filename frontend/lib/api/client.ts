/**
 * API configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5205',
  timeout: 30000,
};

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_CONFIG.timeout
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * API request helper
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.message || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// ============================================================================
// Job DTOs (match backend)
// ============================================================================

export interface JobDto {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: 'FullTime' | 'PartTime' | 'Temporary';
  shiftPattern?: string;
  salary?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface JobPagedResult {
  items: JobDto[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface ApplicationDto {
  id: string;
  jobId: string;
  userId: string;
  status: 'Applied' | 'Reviewing' | 'Accepted' | 'Rejected' | 'Withdrawn';
  appliedAt: string;
}

export interface GetJobsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  location?: string;
  employmentType?: string;
}

// ============================================================================
// Job API Functions
// ============================================================================

/**
 * Fetch jobs list with optional pagination and filters
 */
export async function getJobs(
  params?: GetJobsParams
): Promise<ApiResponse<JobPagedResult | JobDto[]>> {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.location) queryParams.set('location', params.location);
    if (params.employmentType) queryParams.set('employmentType', params.employmentType);
  }

  const path = `/api/Jobs${queryParams.toString() ? `?${queryParams}` : ''}`;
  return apiRequest<JobPagedResult | JobDto[]>(path);
}

/**
 * Fetch single job by ID
 */
export async function getJob(id: string): Promise<ApiResponse<JobDto>> {
  return apiRequest<JobDto>(`/api/Jobs/${id}`);
}

/**
 * Apply to a job
 */
export async function applyToJob(jobId: string): Promise<ApiResponse<ApplicationDto>> {
  return apiRequest<ApplicationDto>(
    `/api/applications/jobs/${jobId}/apply`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );
}

/**
 * Send email verification token
 */
export async function sendEmailVerification(): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(
    '/api/auth/send-verification',
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );
}
