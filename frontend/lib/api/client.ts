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

export enum EmploymentType {
  FullTime = 1,
  PartTime = 2,
  Casual = 3,
  Temporary = 4,
  Contract = 5,
  ZeroHours = 6
}

export enum JobStatus {
  Draft = 0,
  Published = 1,
  Closed = 2,
  Filled = 3,
  Cancelled = 4
}

export interface JobDto {
  id: string;
  organizationId: string;
  createdByUserId: string;
  title: string;
  description: string;
  location: string;
  roleType: number;
  roleTypeName: string;
  employmentType: EmploymentType;
  employmentTypeName: string;
  shiftPattern?: number;
  shiftPatternName?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: number;
  salaryPeriodName?: string;
  postalCode?: string;
  requiredExperienceYears?: number;
  requiredQualifications?: string;
  benefits?: string;
  status: JobStatus;
  statusName: string;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPagedResult {
  items: JobDto[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export enum ApplicationStatus {
  Applied = 1,
  Screening = 2,
  Interview = 3,
  PreHireChecks = 4,
  Hired = 5,
  Rejected = 6,
  Withdrawn = 7
}

export interface ApplicationDto {
  id: string;
  jobId: string;
  candidateUserId: string;
  candidateName: string;
  currentStatus: ApplicationStatus;
  currentStatusName: string;
  coverLetter?: string;
  cvFileUrl?: string;
  appliedAt: string;
  updatedAt: string;
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
    if (params.page) queryParams.set('pageNumber', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.search) queryParams.set('keyword', params.search);
    if (params.location) queryParams.set('location', params.location);
    if (params.employmentType) queryParams.set('employmentType', params.employmentType);
  }

  const path = `/api/jobs${queryParams.toString() ? `?${queryParams}` : ''}`;
  return apiRequest<JobPagedResult | JobDto[]>(path);
}

/**
 * Fetch single job by ID
 */
export async function getJob(id: string): Promise<ApiResponse<JobDto>> {
  return apiRequest<JobDto>(`/api/jobs/${id}`);
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

// ============================================================================
// Application History DTOs
// ============================================================================

export interface ApplicationHistoryEntry {
  id: string;
  applicationId: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedAt: string;
  changedBy?: string;
  reason?: string;
}

// ============================================================================
// Application API Functions
// ============================================================================

/**
 * Fetch user's applications list
 */
export async function getMyApplications(): Promise<ApiResponse<ApplicationDto[]>> {
  return apiRequest<ApplicationDto[]>('/api/applications/my');
}

/**
 * Fetch application history
 */
export async function getApplicationHistory(
  applicationId: string
): Promise<ApiResponse<ApplicationHistoryEntry[]>> {
  return apiRequest<ApplicationHistoryEntry[]>(`/api/applications/${applicationId}/history`);
}

/**
 * Withdraw an application
 */
export async function withdrawApplication(
  applicationId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(
    `/api/applications/${applicationId}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================================================
// Business Jobs DTOs
// ============================================================================

export interface CreateJobDto {
  title: string;
  description: string;
  roleType: number;
  employmentType: EmploymentType;
  shiftPattern: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: number;
  location: string;
  postalCode?: string;
  requiredExperienceYears?: number;
  requiredQualifications?: string;
  benefits?: string;
  expiresAt?: string;
}

export interface JobDetailDto extends JobDto {
  applicationsCount?: number;
}

// ============================================================================
// Business Jobs API Functions
// ============================================================================

/**
 * Fetch organization's jobs
 */
export async function getOrganizationJobs(
  organizationId: string
): Promise<ApiResponse<JobDto[]>> {
  return apiRequest<JobDto[]>(`/api/jobs/organization/${organizationId}`);
}

/**
 * Create a new job posting
 */
export async function createJob(
  job: CreateJobDto
): Promise<ApiResponse<JobDto>> {
  return apiRequest<JobDto>(
    '/api/jobs',
    {
      method: 'POST',
      body: JSON.stringify(job),
    }
  );
}

/**
 * Update job (publish/close)
 */
export async function updateJob(
  jobId: string,
  updates: Partial<JobDto>
): Promise<ApiResponse<JobDto>> {
  return apiRequest<JobDto>(
    `/api/jobs/${jobId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    }
  );
}

// ============================================================================
// Pipeline DTOs
// ============================================================================

export interface PipelineStage {
  id: string;
  name: string;
  applicationIds: string[];
}

export interface PipelineApplication {
  id: string;
  applicationId: string;
  jobId: string;
  userId: string;
  status: string;
  appliedAt: string;
  candidateName?: string;
  candidateEmail?: string;
}

export interface JobPipeline {
  jobId: string;
  jobTitle: string;
  stages: PipelineStage[];
}

// ============================================================================
// Pipeline API Functions
// ============================================================================

/**
 * Fetch job pipeline with kanban stages
 */
export async function getJobPipeline(
  jobId: string
): Promise<ApiResponse<JobPipeline>> {
  return apiRequest<JobPipeline>(`/api/pipeline/jobs/${jobId}`);
}

/**
 * Move application to different stage
 */
export async function moveApplicationInPipeline(
  applicationId: string,
  newStatus: string
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(
    `/api/pipeline/applications/${applicationId}/move`,
    {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    }
  );
}
