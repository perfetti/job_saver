/**
 * API service for job-related operations
 */

import type { Job } from '@/lib/types'

// Re-export Job type for convenience
export type { Job }

export interface JobsResponse {
  success: boolean
  jobs?: Job[]
  count?: number
  error?: string
}

export interface JobResponse {
  success: boolean
  job?: Job
  error?: string
}

export interface UpdateJobData {
  title: string
  company: string
  location?: string | string[] | null
  description?: string | null
  salary_lower_bound?: number | null
  salary_upper_bound?: number | null
  salary_currency?: string | null
  requirements?: string[] | null
  sourceUrl?: string | null
  applicationUrl?: string | null
  postedDate?: string | null
  excluded?: boolean
}

/**
 * Fetch all jobs from the API
 */
export async function getJobs(): Promise<JobsResponse> {
  try {
    const response = await fetch('/api/jobs')
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch jobs',
    }
  }
}

/**
 * Update a job by ID
 */
export async function updateJob(
  jobId: string,
  jobData: UpdateJobData
): Promise<JobResponse> {
  try {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update job',
    }
  }
}

/**
 * Delete a job by ID
 */
export async function deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete job',
    }
  }
}

/**
 * Mark a job as rejected
 */
export async function markJobAsRejected(jobId: string): Promise<JobResponse> {
  try {
    const response = await fetch(`/api/jobs/${jobId}/reject`, {
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mark job as rejected',
    }
  }
}

/**
 * Clear rejected status for a job
 */
export async function clearRejectedStatus(jobId: string): Promise<JobResponse> {
  try {
    const response = await fetch(`/api/jobs/${jobId}/reject`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to clear rejected status',
    }
  }
}

/**
 * Mark a job as accepted
 */
export async function markJobAsAccepted(jobId: string): Promise<JobResponse> {
  try {
    const response = await fetch(`/api/jobs/${jobId}/accept`, {
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mark job as accepted',
    }
  }
}

/**
 * Clear accepted status for a job
 */
export async function clearAcceptedStatus(jobId: string): Promise<JobResponse> {
  try {
    const response = await fetch(`/api/jobs/${jobId}/accept`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      }
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to clear accepted status',
    }
  }
}

