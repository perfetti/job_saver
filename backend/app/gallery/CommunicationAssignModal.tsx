'use client'

import { useState, useEffect } from 'react'
import styles from './gallery.module.css'
import { getCommunications, updateCommunication, getJobs } from '@/lib/api'
import type { Communication, Job } from '@/lib/types'

interface CommunicationAssignModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: () => void
}

export default function CommunicationAssignModal({
  isOpen,
  onClose,
  onAssign,
}: CommunicationAssignModalProps) {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComm, setSelectedComm] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  async function loadData() {
    setLoading(true)
    try {
      // Load unassigned communications (job_id is null)
      const commResult = await getCommunications()
      const unassigned = (commResult.communications || []).filter(
        (comm) => !comm.job_id
      )

      // Load all jobs
      const jobsResult = await getJobs()

      setCommunications(unassigned)
      setJobs(jobsResult.jobs || [])
    } catch (err: any) {
      console.error('Error loading data:', err)
      alert('Error loading communications: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign() {
    if (!selectedComm || !selectedJob) {
      alert('Please select both a communication and a job')
      return
    }

    setAssigning(true)
    try {
      const result = await updateCommunication(selectedComm, {
        job_id: selectedJob,
      })

      if (result.success) {
        // Remove assigned communication from list
        setCommunications((prev) => prev.filter((c) => c.id !== selectedComm))
        setSelectedComm(null)
        setSelectedJob('')
        onAssign() // Notify parent to refresh
        if (communications.length === 1) {
          // If this was the last one, close modal
          onClose()
        }
      } else {
        alert('Error assigning communication: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error assigning communication: ' + err.message)
    } finally {
      setAssigning(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Assign Communication to Job</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : communications.length === 0 ? (
            <div>No unassigned communications found.</div>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="commSelect">Select Communication:</label>
                <select
                  id="commSelect"
                  value={selectedComm || ''}
                  onChange={(e) => setSelectedComm(e.target.value)}
                  className={styles.select}
                >
                  <option value="">-- Select a communication --</option>
                  {communications.map((comm) => (
                    <option key={comm.id} value={comm.id}>
                      {comm.subject || 'No subject'} - {comm.from || 'Unknown sender'} (
                      {comm.received_at
                        ? new Date(comm.received_at).toLocaleDateString()
                        : 'No date'}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {selectedComm && (
                <div className={styles.commPreview}>
                  <h4>Preview:</h4>
                  {communications
                    .find((c) => c.id === selectedComm)
                    ?.body_text?.substring(0, 200)}
                  ...
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="jobSelect">Select Job:</label>
                <select
                  id="jobSelect"
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className={styles.select}
                >
                  <option value="">-- Select a job --</option>
                  {jobs.sort((a, b) => a.company.localeCompare(b.company)).map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.company} - {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.btnSecondary}
                  onClick={onClose}
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleAssign}
                  disabled={!selectedComm || !selectedJob || assigning}
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

