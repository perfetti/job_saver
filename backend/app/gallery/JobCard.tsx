'use client'

import Link from 'next/link'
import styles from './gallery.module.css'
import type { Job } from '@/lib/types'

interface JobCardProps {
  job: Job
  onStartApplication: (jobId: string) => void
  onEdit: (jobId: string) => void
  onReject: (jobId: string) => void
  onAccept: (jobId: string) => void
  onClearReject: (jobId: string) => void
  onClearAccept: (jobId: string) => void
}

// Helper function to format location
function formatLocation(location?: string | string[]): string {
  if (!location) return 'Location not specified'
  return Array.isArray(location) ? location.join(', ') : location
}

// Helper function to format numbers with commas
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function JobCard({
  job,
  onStartApplication,
  onEdit,
  onReject,
  onAccept,
  onClearReject,
  onClearAccept,
}: JobCardProps) {
  const location = formatLocation(job.location)
  const date = job.postedDate || job.extractedAt
    ? new Date(job.postedDate || job.extractedAt!).toLocaleDateString()
    : ''

  const rejectedDate = job.rejectedAt
    ? new Date(job.rejectedAt).toLocaleDateString()
    : null
  const acceptedDate = job.acceptedAt
    ? new Date(job.acceptedAt).toLocaleDateString()
    : null

  const Actions = () => (
    <div className={styles.jobLinks}>
      <a
        href={job?.sourceUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.jobLink}
      >
        View Original
      </a>
      <a
        href={job?.applicationUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.jobLink}
      >
        Apply
      </a>
      {!job.application && (
        <button
          className={styles.startApplicationBtn}
          onClick={() => onStartApplication(job.id)}
        >
          Start Application
        </button>
      )}
      {!job.rejectedAt && !job.acceptedAt && (
        <>
          <button
            className={styles.rejectBtn}
            onClick={() => onReject(job.id)}
            title="Mark as rejected"
          >
            Reject
          </button>
          <button
            className={styles.acceptBtn}
            onClick={() => onAccept(job.id)}
            title="Mark as accepted"
          >
            Accept
          </button>
        </>
      )}
      {job.rejectedAt && (
        <button
          className={styles.clearRejectBtn}
          onClick={() => onClearReject(job.id)}
          title="Clear rejected status"
        >
          Clear Reject
        </button>
      )}
      {job.acceptedAt && (
        <button
          className={styles.clearAcceptBtn}
          onClick={() => onClearAccept(job.id)}
          title="Clear accepted status"
        >
          Clear Accept
        </button>
      )}
      <button className={styles.editBtn} onClick={() => onEdit(job.id)}>
        Edit
      </button>
    </div>
  )

  return (
    <div className={styles.jobCard}>
      <div className={styles.jobHeader}>
        <div className={styles.jobTitle}>{job.title || 'Untitled'}</div>
        <div className={styles.jobCompany}>{job.company || 'Unknown Company'}</div>
        {job.salary_lower_bound && <div className={styles.jobSalaryCurrency}>{`Lower Bound: ${job.salary_currency}${job.salary_lower_bound}`}</div>}
        {job.salary_upper_bound && <div className={styles.jobSalaryCurrency}>{`Upper Bound: ${job.salary_currency}${job.salary_upper_bound}`}</div>}
        <div className={styles.jobLocation}>{location}</div>
      </div>

      <Actions />

      {job.description && (
        <div className={styles.jobDescription}>{job.description}</div>
      )}

      {(job.salary_lower_bound || job.salary_upper_bound) && (
        <div className={styles.jobSalary}>
          <span className={styles.salaryRange}>
            ${job.salary_lower_bound ? formatNumber(job.salary_lower_bound) : 'N/A'} - $
            {job.salary_upper_bound ? formatNumber(job.salary_upper_bound) : 'N/A'}{' '}
            {job.salary_currency || 'USD'}
          </span>
        </div>
      )}

      {job.requirements && (
        <div className={styles.jobRequirements}>
          <div className={styles.requirementsTitle}>Key Requirements:</div>
          <div className={styles.requirementsList}>
            <ul>
              {(Array.isArray(job.requirements)
                ? job.requirements
                : [job.requirements]
              )
                .slice(0, 3)
                .map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {job.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
        <div className={styles.jobTags}>
          {job.tags.map((tag, idx) => (
            <span key={idx} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {job.application && (
        <Link
          href={`/application?id=${job.application.id}`}
          className={styles.applicationStatus}
          data-status={job.application.status}
        >
          {job.application.status === 'started' && 'Application Started'}
          {job.application.status === 'submitted' && 'Application Submitted'}
          {job.application.status === 'rejected' && 'Rejected'}
          {job.application.status === 'accepted' && 'Accepted'}
          {job.application.started_at &&
            ` (${new Date(job.application.started_at).toLocaleDateString()})`}
        </Link>
      )}

      {(job.rejectedAt || job.acceptedAt) && (
        <div className={styles.jobStatusBadges}>
          {job.rejectedAt && (
            <div className={styles.rejectedBadge} title={`Rejected on ${rejectedDate}`}>
              ❌ Rejected ({rejectedDate})
            </div>
          )}
          {job.acceptedAt && (
            <div className={styles.acceptedBadge} title={`Accepted on ${acceptedDate}`}>
              ✅ Accepted ({acceptedDate})
            </div>
          )}
        </div>
      )}

      {job.communications && job.communications.length > 0 && (
        <div className={styles.communicationsSection}>
          <div className={styles.communicationsTitle}>
            Communications ({job.communications.length})
          </div>
          <div className={styles.communicationsList}>
            {job.communications.slice(0, 3).map((comm) => (
              <div key={comm.id} className={styles.communicationItem}>
                <div className={styles.commSubject}>
                  {comm.subject || 'No subject'}
                </div>
                <div className={styles.commMeta}>
                  {comm.from && <span>From: {comm.from}</span>}
                  {comm.received_at && (
                    <span>
                      {new Date(comm.received_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {job.communications.length > 3 && (
              <div className={styles.commMore}>
                +{job.communications.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.jobFooter}>
        <div className={styles.jobDate}>{date}</div>
      </div>
    </div>
  )
}

