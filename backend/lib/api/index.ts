/**
 * Centralized API exports
 * Import from here for cleaner imports: import { getJobs, createApplication } from '@/lib/api'
 */

export * from './jobs'
export * from './applications'
export * from './communications'

// Re-export types for convenience
export type { Job, Application, Communication } from '@/lib/types'

