export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
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
  Draft = 1,
  Published = 2,
  Closed = 3,
  Filled = 4,
  Cancelled = 5
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
  locationVisibility?: 'PublicExact' | 'PrivateApprox';
  latApprox?: number;
  lngApprox?: number;
  approxRadiusMeters?: number;
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
  jobRoleId?: string;
  employmentType: EmploymentType;
  shiftPattern: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: number;
  location: string;
  postalCode?: string;
  locationVisibility?: 'PublicExact' | 'PrivateApprox';
  latApprox?: number;
  lngApprox?: number;
  approxRadiusMeters?: number;
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
  newStatus: string,
  notes?: string,
  preHireCheckConfirmation?: boolean,
  preHireCheckConfirmationText?: string
): Promise<ApiResponse<{ message: string }>> {
  const payload: Record<string, unknown> = { ToStatus: newStatus };
  if (notes) payload.Notes = notes;
  if (preHireCheckConfirmation !== undefined) payload.PreHireCheckConfirmation = preHireCheckConfirmation;
  if (preHireCheckConfirmationText) payload.PreHireCheckConfirmationText = preHireCheckConfirmationText;

  return apiRequest<{ message: string }>(
    `/api/pipeline/applications/${applicationId}/move`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

// ============================================================================
// Profile DTOs & API Functions
// ============================================================================

export interface ProfileDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  bio?: string;
  resumeJson?: string;
  role?: string;
  preferredJobRoleIds?: string[];
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  bio?: string;
  resumeJson?: string;
  preferredJobRoleIds?: string[];
}

/**
 * Get current user profile
 */
export async function getMyProfile(): Promise<ApiResponse<ProfileDto>> {
  return apiRequest<ProfileDto>('/api/profiles/me');
}

/**
 * Update current user profile
 */
export async function updateMyProfile(
  profile: UpdateProfileDto
): Promise<ApiResponse<ProfileDto>> {
  return apiRequest<ProfileDto>(
    '/api/profiles/me',
    {
      method: 'PUT',
      body: JSON.stringify(profile),
    }
  );
}

// ============================================================================
// Analytics & Reporting Functions
// ============================================================================

export interface OrganizationAnalyticsDto {
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  totalViews: number;
  totalApplications: number;
  avgConversionRate: number;
  topPerformingJobs: JobPerformanceDto[];
}

export interface JobPerformanceDto {
  jobId: string;
  title: string;
  views: number;
  applications: number;
  conversionRate: number;
}

/**
 * Get analytics for current organization
 */
export async function getOrganizationAnalytics(): Promise<ApiResponse<OrganizationAnalyticsDto>> {
  return apiRequest<OrganizationAnalyticsDto>('/api/jobs/analytics');
}

/**
 * Increment job view count
 */
export async function incrementJobView(jobId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/jobs/${jobId}/view`, { method: 'POST' });
}


// --- Work Experience DTOs ---

export interface CandidateMapSettingsDto {
  workerMapEnabled: boolean;
  discoverableByWorkplaces: boolean;
  allowConnectionRequests: boolean;
  updatedAt: string;
}

export interface UpdateCandidateMapSettingsDto {
  workerMapEnabled?: boolean;
  discoverableByWorkplaces?: boolean;
  allowConnectionRequests?: boolean;
}

export interface WorkExperienceDto {
  id: string;
  candidateUserId: string;
  employerName: string;
  locationText: string;
  city?: string;
  postalCode?: string;
  roleTitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  visibilityLevel: 'private' | 'applied_only' | 'shortlisted_only';
  isMapEnabled: boolean;
  latApprox?: number;
  lngApprox?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkExperienceDto {
  employerName: string;
  locationText: string;
  city?: string;
  postalCode?: string;
  roleTitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  visibilityLevel: 'private' | 'applied_only' | 'shortlisted_only';
  isMapEnabled: boolean;
}

export interface UpdateWorkExperienceDto {
  employerName?: string;
  locationText?: string;
  city?: string;
  postalCode?: string;
  roleTitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  visibilityLevel?: 'private' | 'applied_only' | 'shortlisted_only';
  isMapEnabled?: boolean;
}

// --- Candidate API Functions ---

export async function getWorkExperiences(): Promise<WorkExperienceDto[]> {
  const response = await apiRequest<WorkExperienceDto[]>('/api/candidate/work-experiences');
  if (response.error) throw new Error(response.error);
  return response.data || [];
}

export async function createWorkExperience(dto: CreateWorkExperienceDto): Promise<WorkExperienceDto> {
  const response = await apiRequest<WorkExperienceDto>('/api/candidate/work-experiences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error('No data returned');
  return response.data;
}

export async function updateWorkExperience(id: string, dto: UpdateWorkExperienceDto): Promise<WorkExperienceDto> {
  const response = await apiRequest<WorkExperienceDto>(`/api/candidate/work-experiences/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error('No data returned');
  return response.data;
}

export async function deleteWorkExperience(id: string): Promise<void> {
  const response = await apiRequest<void>(`/api/candidate/work-experiences/${id}`, {
    method: 'DELETE',
  });
  if (response.error) throw new Error(response.error);
}

export async function getMapSettings(): Promise<CandidateMapSettingsDto> {
  const response = await apiRequest<CandidateMapSettingsDto>('/api/candidate/map-settings');
  if (response.error) throw new Error(response.error);
  return response.data || {
    workerMapEnabled: false,
    discoverableByWorkplaces: false,
    allowConnectionRequests: false,
    updatedAt: new Date().toISOString(),
  };
}

export async function updateMapSettings(dto: UpdateCandidateMapSettingsDto): Promise<CandidateMapSettingsDto> {
  const response = await apiRequest<CandidateMapSettingsDto>('/api/candidate/map-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error('No data returned');
  return response.data;
}

export async function getApplicationWorkHistory(applicationId: string): Promise<WorkExperienceDto[]> {
  const response = await apiRequest<WorkExperienceDto[]>(`/api/applications/${applicationId}/work-history`);
  if (response.error) throw new Error(response.error);
  return response.data || [];
}

export async function getApplicationConnectionCount(applicationId: string): Promise<number> {
  const response = await apiRequest<number>(`/api/applications/${applicationId}/connection-count`);
  if (response.error) throw new Error(response.error);
  return response.data || 0;
}

export interface PotentialCoworkerDto {
  candidateUserId: string;
  firstName: string;
  lastNameInitial: string;
  sharedWorkplace: string;
  placeKey: string;
  overlapStart: string;
  overlapEnd: string;
  overlapDays: number;
}

export async function getPotentialCoworkers(): Promise<PotentialCoworkerDto[]> {
  const response = await apiRequest<PotentialCoworkerDto[]>(`/api/candidate/coworkers/potential`);
  if (response.error) throw new Error(response.error);
  return response.data || [];
}

export async function getPotentialCoworkerCount(): Promise<number> {
  const response = await apiRequest<number>(`/api/candidate/coworkers/count`);
  if (response.error) throw new Error(response.error);
  return response.data || 0;
}

export interface SendConnectionRequestDto {
  receiverId: string;
  placeKey: string;
  workplaceName: string;
}

export interface ConnectionDto {
  id: string;
  otherUserId: string;
  otherUserName: string;
  workplaceName: string;
  status: string;
  requestedAt: string;
}

export interface ConnectionResultDto {
  success: boolean;
  message: string;
}

export async function sendConnectionRequest(dto: SendConnectionRequestDto): Promise<ConnectionResultDto> {
  const response = await apiRequest<ConnectionResultDto>(`/api/candidate/connections/requests`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (response.error) throw new Error(response.error);
  return response.data || { success: false, message: 'Unknown error' };
}

export async function getPendingConnections(): Promise<ConnectionDto[]> {
  const response = await apiRequest<ConnectionDto[]>(`/api/candidate/connections/pending`);
  if (response.error) throw new Error(response.error);
  return response.data || [];
}

export async function getAcceptedConnections(): Promise<ConnectionDto[]> {
  const response = await apiRequest<ConnectionDto[]>(`/api/candidate/connections`);
  if (response.error) throw new Error(response.error);
  return response.data || [];
}

export async function acceptConnection(id: string): Promise<void> {
  const response = await apiRequest<void>(`/api/candidate/connections/${id}/accept`, {
    method: 'POST',
  });
  if (response.error) throw new Error(response.error);
}

export async function declineConnection(id: string): Promise<void> {
  const response = await apiRequest<void>(`/api/candidate/connections/${id}/decline`, {
    method: 'POST',
  });
  if (response.error) throw new Error(response.error);
}

// ============================================================================
// Business Discovery DTOs & Functions
// ============================================================================

export interface NearbyCandidateDto {
  candidateUserId: string;
  name: string;
  distanceKm: number;
  verifiedConnectionCount: number;
  currentRole?: string;
  currentEmployer?: string;
  latApprox?: number;
  lngApprox?: number;
}

export interface OutreachRequestDto {
  candidateUserId: string;
  jobId?: string;
  message: string;
}

export interface OutreachResultDto {
  success: boolean;
  error?: string;
  remainingBalance: number;
}

/**
 * Find candidates near a job
 */
export async function getNearbyCandidates(jobId: string, radiusKm: number = 10): Promise<NearbyCandidateDto[]> {
  const response = await apiRequest<NearbyCandidateDto[]>(`/api/business/discovery/nearby/${jobId}?radiusKm=${radiusKm}`);
  if (response.error) throw new Error(response.error);
  return response.data || [];
}

/**
 * Get outreach credit balance
 */
export async function getOutreachCreditBalance(): Promise<number> {
  const response = await apiRequest<number>(`/api/business/discovery/credits`);
  if (response.error) throw new Error(response.error);
  return response.data || 0;
}

/**
 * Send outreach to a candidate
 */
export async function sendOutreach(dto: OutreachRequestDto): Promise<OutreachResultDto> {
  const response = await apiRequest<OutreachResultDto>(`/api/business/discovery/outreach`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (response.error) throw new Error(response.error);
  return response.data || { success: false, remainingBalance: 0 };
}
