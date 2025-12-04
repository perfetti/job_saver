'use client'

import { useForm } from 'react-hook-form'
import styles from './gallery.module.css'
import { createJob } from '@/lib/api'
import type { UpdateJobData } from '@/lib/api'

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

interface JobFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function JobFormModal({
  isOpen,
  onClose,
  onSuccess,
}: JobFormModalProps) {
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

  const onSubmit = async (data: JobFormData) => {
    // Transform form data to match API expectations
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
      const result = await createJob(jobData)

      if (result.success && result.job) {
        reset()
        onSuccess()
        onClose()
      } else {
        alert('Error creating job: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error creating job: ' + err.message)
      console.error('Create job error:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add New Job</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px' }}>
          <div className={styles.formGroup}>
            <label htmlFor="newTitle">Title *</label>
            <input
              type="text"
              id="newTitle"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <span style={{ color: '#d32f2f', fontSize: '12px' }}>
                {errors.title.message}
              </span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newCompany">Company *</label>
            <input
              type="text"
              id="newCompany"
              {...register('company', { required: 'Company is required' })}
            />
            {errors.company && (
              <span style={{ color: '#d32f2f', fontSize: '12px' }}>
                {errors.company.message}
              </span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newLocation">Location</label>
            <input
              type="text"
              id="newLocation"
              placeholder="e.g., New York, NY or Remote"
              {...register('location')}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newDescription">Description</label>
            <textarea id="newDescription" {...register('description')} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="newSalaryLower">Salary Lower Bound</label>
              <input
                type="number"
                id="newSalaryLower"
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
              <label htmlFor="newSalaryUpper">Salary Upper Bound</label>
              <input
                type="number"
                id="newSalaryUpper"
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
            <label htmlFor="newSalaryCurrency">Currency</label>
            <select id="newSalaryCurrency" {...register('salary_currency')}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newRequirements">Requirements (one per line)</label>
            <textarea
              id="newRequirements"
              placeholder="Enter requirements, one per line"
              {...register('requirements')}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newSourceUrl">Source URL</label>
            <input
              type="url"
              id="newSourceUrl"
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
            <label htmlFor="newApplicationUrl">Application URL</label>
            <input
              type="url"
              id="newApplicationUrl"
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
            <label htmlFor="newPostedDate">Posted Date</label>
            <input type="date" id="newPostedDate" {...register('postedDate')} />
          </div>
          <div className={styles.checkboxGroup}>
            <input type="checkbox" id="newExcluded" {...register('excluded')} />
            <label htmlFor="newExcluded" style={{ margin: 0 }}>
              Excluded
            </label>
          </div>
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

