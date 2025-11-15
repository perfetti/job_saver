/**
 * API service for application-related operations
 */

import type { Application } from '@/lib/types'

// Re-export Application type for convenience
export type { Application }

export interface ApplicationResponse {
  success: boolean
  application?: Application
  error?: string
}

export interface CreateApplicationData {
  job_id: string
  status?: string
  notes?: string
}

export interface UpdateApplicationData {
  status?: string
  submitted_at?: string | null
  notes?: string | null
}

/**
 * Create a new application
 */
export async function createApplication(
  data: CreateApplicationData
): Promise<ApplicationResponse> {
  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error! status: ${response.status}`,
      }
    }

    return result
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create application',
    }
  }
}

/**
 * Get application by job ID
 */
export async function getApplicationByJobId(
  jobId: string
): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`/api/applications/job/${jobId}`)
    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error! status: ${response.status}`,
      }
    }

    return result
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch application',
    }
  }
}

/**
 * Update an application by ID
 */
export async function updateApplication(
  applicationId: string,
  data: UpdateApplicationData
): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error! status: ${response.status}`,
      }
    }

    return result
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update application',
    }
  }
}

/**
 * Delete an application by ID
 */
export async function deleteApplication(
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error! status: ${response.status}`,
      }
    }

    return result
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete application',
    }
  }
}

