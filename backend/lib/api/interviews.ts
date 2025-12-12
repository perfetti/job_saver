import type { InterviewRound } from '@/lib/types'

export interface InterviewRoundResponse {
  success: boolean
  interview?: InterviewRound
  interviews?: InterviewRound[]
  error?: string
  message?: string
}

/**
 * Get all interview rounds for a job
 */
export async function getInterviewRounds(jobId: string): Promise<InterviewRoundResponse> {
  try {
    const response = await fetch(`/api/jobs/${jobId}/interviews`)
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
      error: error.message || 'Failed to fetch interview rounds',
    }
  }
}

/**
 * Create a new interview round
 */
export async function createInterviewRound(
  jobId: string,
  interviewData: Partial<InterviewRound>
): Promise<InterviewRoundResponse> {
  try {
    const response = await fetch(`/api/jobs/${jobId}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interviewData),
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
      error: error.message || 'Failed to create interview round',
    }
  }
}

/**
 * Update an interview round
 */
export async function updateInterviewRound(
  interviewId: string,
  interviewData: Partial<InterviewRound>
): Promise<InterviewRoundResponse> {
  try {
    const response = await fetch(`/api/interviews/${interviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interviewData),
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
      error: error.message || 'Failed to update interview round',
    }
  }
}

/**
 * Delete an interview round
 */
export async function deleteInterviewRound(
  interviewId: string
): Promise<InterviewRoundResponse> {
  try {
    const response = await fetch(`/api/interviews/${interviewId}`, {
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
      error: error.message || 'Failed to delete interview round',
    }
  }
}

/**
 * Upload a recording file for an interview round
 */
export async function uploadInterviewRecording(
  interviewId: string,
  file: File
): Promise<InterviewRoundResponse> {
  try {
    const formData = new FormData()
    formData.append('recording', file)

    const response = await fetch(`/api/interviews/${interviewId}/upload`, {
      method: 'POST',
      body: formData,
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
      error: error.message || 'Failed to upload recording',
    }
  }
}


