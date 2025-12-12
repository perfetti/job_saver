'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getJobById, getInterviewRounds, deleteInterviewRound } from '@/lib/api'
import type { Job, InterviewRound } from '@/lib/api'
import styles from './job.module.css'
import InterviewRoundForm from './InterviewRoundForm'

type Tab = 'details' | 'communications' | 'interviews'

export default function JobShowPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [interviews, setInterviews] = useState<InterviewRound[]>([])
  const [editingInterview, setEditingInterview] = useState<InterviewRound | null>(null)
  const [showInterviewForm, setShowInterviewForm] = useState(false)

  useEffect(() => {
    if (jobId) {
      loadJob()
    }
  }, [jobId])

  useEffect(() => {
    if (activeTab === 'interviews' && jobId) {
      loadInterviews()
    }
  }, [activeTab, jobId])

  async function loadJob() {
    setLoading(true)
    setError(null)
    try {
      const result = await getJobById(jobId)
      if (result.success && result.job) {
        setJob(result.job)
        if (result.job.interviewRounds) {
          setInterviews(result.job.interviewRounds)
        }
      } else {
        setError(result.error || 'Failed to load job')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  async function loadInterviews() {
    try {
      const result = await getInterviewRounds(jobId)
      if (result.success && result.interviews) {
        setInterviews(result.interviews)
      }
    } catch (err: any) {
      console.error('Error loading interviews:', err)
    }
  }

  async function handleDeleteInterview(interviewId: string) {
    if (!confirm('Are you sure you want to delete this interview round?')) {
      return
    }

    try {
      const result = await deleteInterviewRound(interviewId)
      if (result.success) {
        await loadInterviews()
        await loadJob() // Reload job to update counts
      } else {
        alert('Error deleting interview: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error deleting interview: ' + err.message)
    }
  }

  function handleEditInterview(interview: InterviewRound) {
    setEditingInterview(interview)
    setShowInterviewForm(true)
  }

  function handleNewInterview() {
    setEditingInterview(null)
    setShowInterviewForm(true)
  }

  async function handleInterviewFormSuccess() {
    setShowInterviewForm(false)
    setEditingInterview(null)
    await loadInterviews()
    await loadJob()
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading job...</div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error || 'Job not found'}
          <div style={{ marginTop: '20px' }}>
            <Link href="/gallery" className={styles.backLink}>
              ← Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const formatLocation = (location?: string | string[]): string => {
    if (!location) return 'Location not specified'
    return Array.isArray(location) ? location.join(', ') : location
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/gallery" className={styles.backLink}>
          ← Back to Gallery
        </Link>
        <h1 className={styles.jobTitle}>{job.title || 'Untitled'}</h1>
        <p className={styles.jobCompany}>{job.company || 'Unknown Company'}</p>
      </div>

      <div className={styles.dashboard}>
        {/* Vertical Tabs */}
        <div className={styles.sidebar}>
          <button
            className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'communications' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('communications')}
          >
            Communications
            {job.communications && job.communications.length > 0 && (
              <span className={styles.tabBadge}>{job.communications.length}</span>
            )}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'interviews' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            Interviews
            {interviews.length > 0 && (
              <span className={styles.tabBadge}>{interviews.length}</span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {activeTab === 'details' && (
            <div className={styles.detailsTab}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Job Information</h2>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Company</label>
                    <div>{job.company || 'N/A'}</div>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Location</label>
                    <div>{formatLocation(job.location)}</div>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Posted Date</label>
                    <div>
                      {job.postedDate
                        ? new Date(job.postedDate).toLocaleDateString()
                        : job.extractedAt
                        ? new Date(job.extractedAt).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  {(job.salary_lower_bound || job.salary_upper_bound) && (
                    <div className={styles.infoItem}>
                      <label>Salary Range</label>
                      <div>
                        {job.salary_lower_bound
                          ? formatNumber(job.salary_lower_bound)
                          : 'N/A'}{' '}
                        -{' '}
                        {job.salary_upper_bound
                          ? formatNumber(job.salary_upper_bound)
                          : 'N/A'}{' '}
                        {job.salary_currency || 'USD'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {job.description && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Description</h2>
                  <div className={styles.description}>{job.description}</div>
                </div>
              )}

              {job.requirements && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Requirements</h2>
                  <ul className={styles.requirementsList}>
                    {(Array.isArray(job.requirements)
                      ? job.requirements
                      : [job.requirements]
                    ).map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Tags</h2>
                  <div className={styles.tags}>
                    {job.tags.map((tag, idx) => (
                      <span key={idx} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Links</h2>
                <div className={styles.links}>
                  {job.sourceUrl && (
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      View Original Posting
                    </a>
                  )}
                  {job.applicationUrl && (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              </div>

              {(job.rejectedAt || job.acceptedAt) && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Status</h2>
                  <div className={styles.statusBadges}>
                    {job.rejectedAt && (
                      <div className={styles.rejectedBadge}>
                        ❌ Rejected on {new Date(job.rejectedAt).toLocaleDateString()}
                      </div>
                    )}
                    {job.acceptedAt && (
                      <div className={styles.acceptedBadge}>
                        ✅ Accepted on {new Date(job.acceptedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {job.application && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Application</h2>
                  <Link
                    href={`/application?id=${job.application.id}`}
                    className={styles.applicationLink}
                  >
                    View Application ({job.application.status})
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className={styles.communicationsTab}>
              <h2 className={styles.sectionTitle}>Communications</h2>
              {!job.communications || job.communications.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No communications yet.</p>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                    Use the Chrome extension to extract emails from Gmail and assign them to this job.
                  </p>
                </div>
              ) : (
                <div className={styles.communicationsList}>
                  {job.communications.map((comm) => (
                    <div key={comm.id} className={styles.communicationCard}>
                      <div className={styles.commHeader}>
                        <h3 className={styles.commSubject}>
                          {comm.subject || 'No subject'}
                        </h3>
                        {comm.received_at && (
                          <div className={styles.commDate}>
                            {new Date(comm.received_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className={styles.commMeta}>
                        {comm.from && (
                          <div className={styles.commMetaItem}>
                            <strong>From:</strong> {comm.from}
                          </div>
                        )}
                        {comm.to && (
                          <div className={styles.commMetaItem}>
                            <strong>To:</strong>{' '}
                            {Array.isArray(comm.to) ? comm.to.join(', ') : comm.to}
                          </div>
                        )}
                      </div>
                      {comm.body_text && (
                        <div className={styles.commBody}>
                          <div className={styles.commBodyText}>{comm.body_text}</div>
                        </div>
                      )}
                      {comm.body && comm.body !== comm.body_text && (
                        <details className={styles.commDetails}>
                          <summary className={styles.commDetailsSummary}>
                            View full email body
                          </summary>
                          <div
                            className={styles.commBodyHtml}
                            dangerouslySetInnerHTML={{ __html: comm.body }}
                          />
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className={styles.interviewsTab}>
              <div className={styles.tabHeader}>
                <h2 className={styles.sectionTitle}>Interview Rounds</h2>
                <button
                  className={styles.btnPrimary}
                  onClick={handleNewInterview}
                >
                  + Add Interview Round
                </button>
              </div>

              {showInterviewForm && (
                <div className={styles.interviewFormContainer}>
                  <InterviewRoundForm
                    jobId={jobId}
                    interview={editingInterview || undefined}
                    onSuccess={handleInterviewFormSuccess}
                    onCancel={() => {
                      setShowInterviewForm(false)
                      setEditingInterview(null)
                    }}
                  />
                </div>
              )}

              {!showInterviewForm && (
                <>
                  {interviews.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No interview rounds yet.</p>
                      <button
                        className={styles.btnPrimary}
                        onClick={handleNewInterview}
                        style={{ marginTop: '20px' }}
                      >
                        Add First Interview Round
                      </button>
                    </div>
                  ) : (
                    <div className={styles.interviewsList}>
                      {interviews.map((interview) => (
                        <div key={interview.id} className={styles.interviewCard}>
                          <div className={styles.interviewHeader}>
                            <div>
                              <h3 className={styles.interviewTitle}>
                                Round {interview.round_number}
                              </h3>
                              {interview.interviewer_name && (
                                <div className={styles.interviewerInfo}>
                                  <strong>{interview.interviewer_name}</strong>
                                  {interview.interviewer_email && (
                                    <span> ({interview.interviewer_email})</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className={styles.interviewActions}>
                              <button
                                className={styles.btnSecondary}
                                onClick={() => handleEditInterview(interview)}
                              >
                                Edit
                              </button>
                              <button
                                className={styles.btnDanger}
                                onClick={() => handleDeleteInterview(interview.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className={styles.interviewMeta}>
                            {interview.scheduled_at && (
                              <div className={styles.interviewMetaItem}>
                                <strong>Scheduled:</strong>{' '}
                                {new Date(interview.scheduled_at).toLocaleString()}
                              </div>
                            )}
                            {interview.completed_at && (
                              <div className={styles.interviewMetaItem}>
                                <strong>Completed:</strong>{' '}
                                {new Date(interview.completed_at).toLocaleString()}
                              </div>
                            )}
                          </div>

                          {interview.notes && (
                            <div className={styles.interviewNotes}>
                              <div
                                className={styles.notesContent}
                                dangerouslySetInnerHTML={{ __html: interview.notes }}
                              />
                            </div>
                          )}

                          {interview.recording_url && (
                            <div className={styles.interviewRecording}>
                              <a
                                href={interview.recording_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.recordingLink}
                              >
                                🎙️ Listen to Recording
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

