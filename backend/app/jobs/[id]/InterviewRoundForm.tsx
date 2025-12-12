'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import {
  createInterviewRound,
  updateInterviewRound,
  uploadInterviewRecording,
} from '@/lib/api'
import type { InterviewRound } from '@/lib/api'
import styles from './job.module.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface InterviewRoundFormProps {
  jobId: string
  interview?: InterviewRound
  onSuccess: () => void
  onCancel: () => void
}

interface InterviewFormData {
  round_number: number
  interviewer_name: string
  interviewer_email: string
  scheduled_at: string
  completed_at: string
  notes: string
}

export default function InterviewRoundForm({
  jobId,
  interview,
  onSuccess,
  onCancel,
}: InterviewRoundFormProps) {
  const isEditing = !!interview
  const [notes, setNotes] = useState(interview?.notes || '')
  const [uploading, setUploading] = useState(false)
  const [recordingFile, setRecordingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InterviewFormData>({
    defaultValues: {
      round_number: interview?.round_number || 1,
      interviewer_name: interview?.interviewer_name || '',
      interviewer_email: interview?.interviewer_email || '',
      scheduled_at: interview?.scheduled_at
        ? new Date(interview.scheduled_at).toISOString().slice(0, 16)
        : '',
      completed_at: interview?.completed_at
        ? new Date(interview.completed_at).toISOString().slice(0, 16)
        : '',
      notes: '',
    },
  })

  const onSubmit = async (data: InterviewFormData) => {
    try {
      const interviewData: Partial<InterviewRound> = {
        round_number: data.round_number,
        interviewer_name: data.interviewer_name || undefined,
        interviewer_email: data.interviewer_email || undefined,
        notes: notes || undefined,
        scheduled_at: data.scheduled_at || undefined,
        completed_at: data.completed_at || undefined,
      }

      let result
      if (isEditing) {
        result = await updateInterviewRound(interview.id, interviewData)
      } else {
        result = await createInterviewRound(jobId, interviewData)
      }

      if (!result.success) {
        alert('Error: ' + (result.error || 'Unknown error'))
        return
      }

      // Upload recording if provided
      if (recordingFile && result.interview) {
        setUploading(true)
        const uploadResult = await uploadInterviewRecording(
          result.interview.id,
          recordingFile
        )
        setUploading(false)

        if (!uploadResult.success) {
          alert('Interview saved but recording upload failed: ' + uploadResult.error)
        }
      }

      onSuccess()
    } catch (err: any) {
      alert('Error: ' + err.message)
      console.error('Interview form error:', err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRecordingFile(e.target.files[0])
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.interviewForm}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="round_number">Round Number *</label>
          <input
            type="number"
            id="round_number"
            min="1"
            {...register('round_number', {
              required: 'Round number is required',
              valueAsNumber: true,
            })}
          />
          {errors.round_number && (
            <span className={styles.errorText}>{errors.round_number.message}</span>
          )}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="interviewer_name">Interviewer Name</label>
          <input
            type="text"
            id="interviewer_name"
            {...register('interviewer_name')}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="interviewer_email">Interviewer Email</label>
          <input
            type="email"
            id="interviewer_email"
            {...register('interviewer_email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.interviewer_email && (
            <span className={styles.errorText}>{errors.interviewer_email.message}</span>
          )}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="scheduled_at">Scheduled At</label>
          <input
            type="datetime-local"
            id="scheduled_at"
            {...register('scheduled_at')}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="completed_at">Completed At</label>
          <input
            type="datetime-local"
            id="completed_at"
            {...register('completed_at')}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">Notes</label>
        <div className={styles.quillWrapper}>
          <ReactQuill
            theme="snow"
            value={notes}
            onChange={setNotes}
            placeholder="Add your interview notes here..."
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="recording">Recording (Optional)</label>
        <input
          ref={fileInputRef}
          type="file"
          id="recording"
          accept="audio/*,video/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {recordingFile && (
          <div className={styles.fileInfo}>
            Selected: {recordingFile.name} ({(recordingFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        {interview?.recording_url && (
          <div className={styles.existingRecording}>
            <a
              href={interview.recording_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.recordingLink}
            >
              View existing recording
            </a>
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onCancel}
          disabled={isSubmitting || uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={isSubmitting || uploading}
        >
          {uploading
            ? 'Uploading...'
            : isSubmitting
            ? 'Saving...'
            : isEditing
            ? 'Update Interview'
            : 'Create Interview'}
        </button>
      </div>
    </form>
  )
}


