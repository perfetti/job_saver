/**
 * Centralized API exports
 * Import from here for cleaner imports: import { getJobs, createApplication } from '@/lib/api'
 */

export * from './jobs'
export * from './applications'
export * from './communications'
export * from './interviews'

// Re-export types for convenience
export type { Job, Application, Communication, InterviewRound } from '@/lib/types'
export type { UpdateJobData, JobResponse } from './jobs'
export type { InterviewRoundResponse } from './interviews'

