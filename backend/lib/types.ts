// Type definitions for the application

export interface Job {
  id: string
  title: string
  company: string
  location?: string | string[]
  description?: string
  salary_lower_bound?: number
  salary_upper_bound?: number
  salary_currency?: string
  requirements?: string | string[]
  applicationUrl?: string
  sourceUrl?: string
  postedDate?: string
  extractedAt?: string
  savedAt: string
  excluded?: boolean
  tags?: string[]
  rejectedAt?: string
  acceptedAt?: string
  application?: Application
}

export interface Application {
  id: string
  job_id: string
  status: 'started' | 'submitted' | 'rejected' | 'accepted'
  started_at: string
  submitted_at?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ResumeData {
  personal_info: {
    name?: string
    headline?: string
    location?: string
    email?: string
    phone?: string
    linkedin_url?: string
    website?: string
  }
  summary?: string
  experience: Array<{
    title: string
    company: string
    location?: string
    start_date: string
    end_date: string | 'present'
    description?: string
    achievements?: string[]
    skills_used?: string[]
  }>
  education: Array<{
    degree: string
    field?: string
    school: string
    location?: string
    start_date?: string
    end_date?: string
    description?: string
    gpa?: string
  }>
  skills: Array<{
    name: string
    category?: string
    proficiency?: string
  }>
  certifications?: Array<{
    name: string
    issuer: string
    issue_date?: string
    expiry_date?: string
    credential_id?: string
    credential_url?: string
  }>
  projects?: Array<{
    name: string
    description?: string
    start_date?: string
    end_date?: string
    url?: string
    technologies?: string[]
  }>
  languages?: Array<{
    language: string
    proficiency?: string
  }>
  volunteer_experience?: Array<{
    role: string
    organization: string
    start_date?: string
    end_date?: string
    description?: string
  }>
  publications?: Array<{
    title: string
    publisher?: string
    date?: string
    url?: string
  }>
  awards?: Array<{
    title: string
    issuer?: string
    date?: string
    description?: string
  }>
}

export interface UserProfile {
  id: string
  linkedin_url?: string
  resume_data?: ResumeData
  created_at?: string
  updated_at?: string
}

