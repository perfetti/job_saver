/**
 * API service for communication-related operations
 */

import type { Communication } from '@/lib/types'

// Re-export Communication type for convenience
export type { Communication }

export interface CommunicationsResponse {
  success: boolean
  communications?: Communication[]
  count?: number
  error?: string
}

export interface CommunicationResponse {
  success: boolean
  communication?: Communication
  error?: string
}

export interface UpdateCommunicationData {
  job_id?: string | null
  subject?: string | null
  from?: string | null
  to?: string | null
  body?: string | null
  body_text?: string | null
  received_at?: string | null
}

/**
 * Fetch all communications from the API
 */
export async function getCommunications(jobId?: string): Promise<CommunicationsResponse> {
  try {
    const url = jobId ? `/api/communications?jobId=${jobId}` : '/api/communications'
    const response = await fetch(url)
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
      error: error.message || 'Failed to fetch communications',
    }
  }
}

/**
 * Update a communication by ID (e.g., assign to job)
 */
export async function updateCommunication(
  communicationId: string,
  data: UpdateCommunicationData
): Promise<CommunicationResponse> {
  try {
    const response = await fetch(`/api/communications/${communicationId}`, {
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
      error: error.message || 'Failed to update communication',
    }
  }
}

/**
 * Delete a communication by ID
 */
export async function deleteCommunication(
  communicationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/communications/${communicationId}`, {
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
      error: error.message || 'Failed to delete communication',
    }
  }
}

