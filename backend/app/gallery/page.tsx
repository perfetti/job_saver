'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import styles from './gallery.module.css'
import {
  getJobs,
  updateJob,
  createJob,
  createApplication,
  markJobAsRejected,
  markJobAsAccepted,
  clearRejectedStatus,
  clearAcceptedStatus,
} from '@/lib/api'
import type { Job, UpdateJobData } from '@/lib/api'
import JobCard from './JobCard'
import CommunicationAssignModal from './CommunicationAssignModal'
import JobFormModal from './JobFormModal'

type ViewMode = 'list' | 'hierarchy'

// Form data type - location and requirements are strings in the form for easier editing
interface JobFormData {
  title: string
  company: string
  location: string | null
  description: string | null
  salary_lower_bound: number | null
  salary_upper_bound: number | null
  salary_currency: string | null
  requirements: string | null
  sourceUrl: string | null
  applicationUrl: string | null
  postedDate: string | null
  excluded: boolean
}

// Storing display components here for easier reuse and to see if we want them elsewhere first.
const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className={styles.stat}>
    <div className={styles.statLabel}>{label}</div>
    <div className={styles.statValue}>{value}</div>
  </div>
)

const ExclusionStat = ({ label, value }: { label: string; value: number }) => (
  <div className={`${styles.exclusionStat} ${styles.nonExcluded}`}>
    <div className={styles.statLabel}>{label}</div>
    <div className={styles.statValue}>{value}</div>
  </div>
)

export default function Gallery() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCommModal, setShowCommModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    defaultValues: {
      title: '',
      company: '',
      location: null,
      description: null,
      salary_lower_bound: null,
      salary_upper_bound: null,
      salary_currency: 'USD',
      requirements: null,
      sourceUrl: null,
      applicationUrl: null,
      postedDate: null,
      excluded: false,
    },
  })

  // Load jobs from API
  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    setLoading(true)
    setError(null)
    try {
      const result = await getJobs()
      if (result.success && result.jobs) {
        setJobs(result.jobs)
      } else {
        setError(result.error || 'Failed to load jobs')
      }
    } catch (err: any) {
      setError(err.message || 'Error loading jobs')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const companies = new Set(jobs.map((job) => job.company).filter(Boolean))
    const excludedCount = jobs.filter((job) => job.excluded === true).length
    const nonExcludedCount = jobs.length - excludedCount
    const applicationsCount = jobs.filter((job) => job.application).length

    // Calculate application status counts
    // In Progress: applications with status 'started' or 'submitted'
    const applicationsInProgress = jobs.filter(
      (job) =>
        job.application &&
        (job.application.status === 'started' || job.application.status === 'submitted')
    ).length
    // Accepted: jobs with acceptedAt set (job-level acceptance)
    const applicationsAccepted = jobs.filter(
      (job) => job.acceptedAt !== null && job.acceptedAt !== undefined
    ).length
    // Rejected: jobs with rejectedAt set (job-level rejection)
    const applicationsRejected = jobs.filter(
      (job) => job.rejectedAt !== null && job.rejectedAt !== undefined
    ).length

    return {
      totalJobs: jobs.length,
      totalCompanies: companies.size,
      applicationsCount,
      applicationsInProgress,
      applicationsAccepted,
      applicationsRejected,
      excludedCount,
      nonExcludedCount,
    }
  }, [jobs])

  // Get unique companies and tags for filters
  const companies = useMemo(() => {
    return [...new Set(jobs.map((job) => job.company).filter(Boolean))].sort()
  }, [jobs])

  const tags = useMemo(() => {
    const allTags: string[] = []
    jobs.forEach((job) => {
      if (job.tags && Array.isArray(job.tags)) {
        allTags.push(...job.tags)
      }
    })
    return [...new Set(allTags)].sort()
  }, [jobs])

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.location &&
          (Array.isArray(job.location)
            ? job.location.some((loc) => loc.toLowerCase().includes(searchTerm.toLowerCase()))
            : job.location.toLowerCase().includes(searchTerm.toLowerCase())))

      const matchesCompany = !companyFilter || job.company === companyFilter

      const matchesTag =
        !tagFilter || (job.tags && Array.isArray(job.tags) && job.tags.includes(tagFilter))

      return matchesSearch && matchesCompany && matchesTag
    })
  }, [jobs, searchTerm, companyFilter, tagFilter])

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const excludedCount = filteredJobs.filter((job) => job.excluded === true).length
    const nonExcludedCount = filteredJobs.length - excludedCount
    return { excludedCount, nonExcludedCount }
  }, [filteredJobs])

  // Open edit modal
  const openEditModal = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if (job) {
      setEditingJob(job)
      // Reset form with job data
      // Convert arrays to strings for form editing
      reset({
        title: job.title || '',
        company: job.company || '',
        location: Array.isArray(job.location)
          ? job.location.join(', ')
          : job.location || null,
        description: job.description || null,
        salary_lower_bound: job.salary_lower_bound || null,
        salary_upper_bound: job.salary_upper_bound || null,
        salary_currency: job.salary_currency || 'USD',
        requirements: Array.isArray(job.requirements)
          ? job.requirements.join('\n')
          : job.requirements || null,
        sourceUrl: job.sourceUrl || null,
        applicationUrl: job.applicationUrl || null,
        postedDate: job.postedDate
          ? new Date(job.postedDate).toISOString().split('T')[0]
          : null,
        excluded: job.excluded === true,
      })
      setShowEditModal(true)
    }
  }

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingJob(null)
    reset()
  }

  // Save edited job
  const saveEditedJob = async (data: JobFormData) => {
    if (!editingJob) return

    // Transform form data to match API expectations
    // Form stores location and requirements as strings, but API expects string | string[] | null
    const locationValue = data.location?.trim() || ''
    const requirementsValue = data.requirements?.trim() || ''

    const jobData: UpdateJobData = {
      title: data.title.trim(),
      company: data.company.trim(),
      location: locationValue
        ? locationValue.includes(',')
          ? locationValue.split(',').map((s: string) => s.trim())
          : locationValue
        : null,
      description: data.description?.trim() || null,
      salary_lower_bound: data.salary_lower_bound || null,
      salary_upper_bound: data.salary_upper_bound || null,
      salary_currency: data.salary_currency || null,
      requirements: requirementsValue
        ? requirementsValue.split('\n').filter((r: string) => r.trim())
        : [],
      sourceUrl: data.sourceUrl?.trim() || null,
      applicationUrl: data.applicationUrl?.trim() || null,
      postedDate: data.postedDate || null,
      excluded: data.excluded || false,
    }

    try {
      const result = await updateJob(editingJob.id, jobData)

      if (result.success && result.job) {
        // Update the job in the jobs array
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === editingJob.id ? result.job! : job))
        )
        closeEditModal()
      } else {
        alert('Error updating job: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error updating job: ' + err.message)
      console.error('Edit error:', err)
    }
  }

  // Start application
  const startApplication = async (jobId: string) => {
    if (!confirm('Start an application for this job?')) {
      return
    }

    try {
      const result = await createApplication({
        job_id: jobId,
        status: 'started',
      })

      if (result.success) {
        // Reload jobs to show updated application status
        loadJobs()
      } else {
        if (result.error && result.error.includes('already exists')) {
          alert('Application already exists for this job')
        } else {
          alert('Error starting application: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (err: any) {
      alert('Error starting application: ' + err.message)
      console.error('Start application error:', err)
    }
  }

  // Mark job as rejected
  const handleReject = async (jobId: string) => {
    if (!confirm('Mark this job as rejected?')) {
      return
    }

    try {
      const result = await markJobAsRejected(jobId)
      if (result.success && result.job) {
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? result.job! : job))
        )
      } else {
        alert('Error marking job as rejected: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error marking job as rejected: ' + err.message)
      console.error('Reject error:', err)
    }
  }

  // Mark job as accepted
  const handleAccept = async (jobId: string) => {
    if (!confirm('Mark this job as accepted?')) {
      return
    }

    try {
      const result = await markJobAsAccepted(jobId)
      if (result.success && result.job) {
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? result.job! : job))
        )
      } else {
        alert('Error marking job as accepted: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error marking job as accepted: ' + err.message)
      console.error('Accept error:', err)
    }
  }

  // Clear rejected status
  const handleClearReject = async (jobId: string) => {
    try {
      const result = await clearRejectedStatus(jobId)
      if (result.success && result.job) {
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? result.job! : job))
        )
      } else {
        alert('Error clearing rejected status: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error clearing rejected status: ' + err.message)
      console.error('Clear reject error:', err)
    }
  }

  // Clear accepted status
  const handleClearAccept = async (jobId: string) => {
    try {
      const result = await clearAcceptedStatus(jobId)
      if (result.success && result.job) {
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? result.job! : job))
        )
      } else {
        alert('Error clearing accepted status: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error clearing accepted status: ' + err.message)
      console.error('Clear accept error:', err)
    }
  }

  // Group jobs by company for hierarchy view
  const jobsByCompany = useMemo(() => {
    const grouped: Record<string, Job[]> = {}
    filteredJobs.forEach((job) => {
      const company = job.company || 'Unknown Company'
      if (!grouped[company]) {
        grouped[company] = []
      }
      grouped[company].push(job)
    })
    return grouped
  }, [filteredJobs])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading jobs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    )
  }
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Job Gallery</h1>
        <p>All your saved job postings</p>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <Link href="/applications" className={styles.applicationsLink}>
            View All Applications →
          </Link>
          <button
            className={styles.btnPrimary}
            onClick={() => setShowCommModal(true)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Assign Communications
          </button>
        </div>
        <div className={styles.stats}>
          <Stat label="Total Jobs" value={stats.totalJobs} />
          <Stat label="Companies" value={stats.totalCompanies} />
          <Stat label="Applications" value={stats.applicationsCount} />
        </div>
        <div className={styles.applicationStats}>
          <div className={`${styles.applicationStat} ${styles.inProgress}`}>
            <div className={styles.statLabel}>In Progress</div>
            <div className={styles.statValue}>{stats.applicationsInProgress}</div>
          </div>
          <div className={`${styles.applicationStat} ${styles.accepted}`}>
            <div className={styles.statLabel}>Accepted</div>
            <div className={styles.statValue}>{stats.applicationsAccepted}</div>
          </div>
          <div className={`${styles.applicationStat} ${styles.rejected}`}>
            <div className={styles.statLabel}>Rejected</div>
            <div className={styles.statValue}>{stats.applicationsRejected}</div>
          </div>
        </div>
        <div className={styles.exclusionStats}>
          <ExclusionStat label="Non-Excluded" value={stats.nonExcludedCount} />
          <ExclusionStat label="Excluded" value={stats.excludedCount} />
        </div>
      </header>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search jobs by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'hierarchy' ? styles.active : ''}`}
            onClick={() => setViewMode('hierarchy')}
          >
            Hierarchy View
          </button>
        </div>
        <button className={styles.refreshBtn} onClick={loadJobs}>
          Refresh
        </button>
        <button
          className={styles.addJobBtnMobile}
          onClick={() => setShowCreateModal(true)}
          title="Add New Job"
        >
          +
        </button>
      </div>

      <div className={styles.jobsContainer}>
        {filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No jobs found</h2>
            <p>Start saving jobs using the Chrome extension!</p>
          </div>
        ) : viewMode === 'list' ? (
          <>
            <div className={styles.viewInfo}>
              <strong>List View:</strong> Showing {filteredJobs.length} job(s) -
              <span style={{ color: '#2e7d32' }}> {filteredStats.nonExcludedCount} non-excluded</span>,
              <span style={{ color: '#d32f2f' }}> {filteredStats.excludedCount} excluded</span>
            </div>
            <div className={styles.jobsList}>
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onStartApplication={startApplication}
                  onEdit={openEditModal}
                  onReject={handleReject}
                  onAccept={handleAccept}
                  onClearReject={handleClearReject}
                  onClearAccept={handleClearAccept}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles.viewInfo}>
              <strong>Hierarchy View:</strong> Showing {filteredJobs.length} job(s) -
              <span style={{ color: '#2e7d32' }}> {filteredStats.nonExcludedCount} non-excluded</span>,
              <span style={{ color: '#d32f2f' }}> {filteredStats.excludedCount} excluded</span>
            </div>
            <div className={styles.hierarchyView}>
              {Object.keys(jobsByCompany)
                .sort()
                .map((company) => {
                  const companyJobs = jobsByCompany[company]
                  const companyExcluded = companyJobs.filter((job) => job.excluded === true).length
                  const companyNonExcluded = companyJobs.length - companyExcluded

                  return (
                    <div key={company} className={styles.companyGroup}>
                      <div className={styles.companyHeader}>
                        {company}
                        <span className={styles.companyStats}>
                          ({companyJobs.length} job{companyJobs.length !== 1 ? 's' : ''} -
                          <span style={{ color: '#2e7d32' }}> {companyNonExcluded} non-excluded</span>,
                          <span style={{ color: '#d32f2f' }}> {companyExcluded} excluded</span>)
                        </span>
                      </div>
                      <div className={styles.companyJobs}>
                        {companyJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            onStartApplication={startApplication}
                            onEdit={openEditModal}
                            onReject={handleReject}
                            onAccept={handleAccept}
                            onClearReject={handleClearReject}
                            onClearAccept={handleClearAccept}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingJob && (
        <div className={styles.modal} onClick={closeEditModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Job</h2>
              <button className={styles.closeBtn} onClick={closeEditModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit(saveEditedJob)} style={{ padding: '20px' }}>
              <div className={styles.formGroup}>
                <label htmlFor="editTitle">Title *</label>
                <input
                  type="text"
                  id="editTitle"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <span style={{ color: '#d32f2f', fontSize: '12px' }}>{errors.title.message}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editCompany">Company *</label>
                <input
                  type="text"
                  id="editCompany"
                  {...register('company', { required: 'Company is required' })}
                />
                {errors.company && (
                  <span style={{ color: '#d32f2f', fontSize: '12px' }}>
                    {errors.company.message}
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editLocation">Location</label>
                <input
                  type="text"
                  id="editLocation"
                  placeholder="e.g., New York, NY or Remote"
                  {...register('location')}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editDescription">Description</label>
                <textarea id="editDescription" {...register('description')} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="editSalaryLower">Salary Lower Bound</label>
                  <input
                    type="number"
                    id="editSalaryLower"
                    {...register('salary_lower_bound', {
                      valueAsNumber: true,
                      validate: (value) =>
                        !value || value >= 0 || 'Salary must be a positive number',
                    })}
                  />
                  {errors.salary_lower_bound && (
                    <span style={{ color: '#d32f2f', fontSize: '12px' }}>
                      {errors.salary_lower_bound.message}
                    </span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="editSalaryUpper">Salary Upper Bound</label>
                  <input
                    type="number"
                    id="editSalaryUpper"
                    {...register('salary_upper_bound', {
                      valueAsNumber: true,
                      validate: (value) =>
                        !value || value >= 0 || 'Salary must be a positive number',
                    })}
                  />
                  {errors.salary_upper_bound && (
                    <span style={{ color: '#d32f2f', fontSize: '12px' }}>
                      {errors.salary_upper_bound.message}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editSalaryCurrency">Currency</label>
                <select id="editSalaryCurrency" {...register('salary_currency')}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editRequirements">Requirements (one per line)</label>
                <textarea
                  id="editRequirements"
                  placeholder="Enter requirements, one per line"
                  {...register('requirements')}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editSourceUrl">Source URL</label>
                <input
                  type="url"
                  id="editSourceUrl"
                  {...register('sourceUrl', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL',
                    },
                  })}
                />
                {errors.sourceUrl && (
                  <span style={{ color: '#d32f2f', fontSize: '12px' }}>
                    {errors.sourceUrl.message}
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editApplicationUrl">Application URL</label>
                <input
                  type="url"
                  id="editApplicationUrl"
                  {...register('applicationUrl', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL',
                    },
                  })}
                />
                {errors.applicationUrl && (
                  <span style={{ color: '#d32f2f', fontSize: '12px' }}>
                    {errors.applicationUrl.message}
                  </span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editPostedDate">Posted Date</label>
                <input type="date" id="editPostedDate" {...register('postedDate')} />
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="editExcluded" {...register('excluded')} />
                <label htmlFor="editExcluded" style={{ margin: 0 }}>
                  Excluded
                </label>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communication Assign Modal */}
      <CommunicationAssignModal
        isOpen={showCommModal}
        onClose={() => setShowCommModal(false)}
        onAssign={() => {
          loadJobs() // Reload jobs to show updated communications
        }}
      />

      {/* Create Job Modal */}
      <JobFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadJobs() // Reload jobs to show the new job
        }}
      />

      {/* Add Job Button - Desktop (Fixed Bottom Right) */}
      <button
        className={styles.addJobBtnDesktop}
        onClick={() => setShowCreateModal(true)}
        title="Add New Job"
      >
        <span className={styles.plusIcon}>+</span>
      </button>
    </div>
  )
}

