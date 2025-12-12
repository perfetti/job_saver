// Utility functions

export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    urlObj.hash = '';
    let normalized = urlObj.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase();
  } catch (e) {
    return url.toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '');
  }
}

export function prepareJobData(jobData: any) {
  return {
    location: Array.isArray(jobData.location)
      ? JSON.stringify(jobData.location)
      : jobData.location,
    requirements: Array.isArray(jobData.requirements)
      ? JSON.stringify(jobData.requirements)
      : jobData.requirements,
    tags: Array.isArray(jobData.tags)
      ? JSON.stringify(jobData.tags)
      : (jobData.tags ? JSON.stringify([jobData.tags]) : null),
  };
}

/**
 * Parse a job from the database, including all relations
 * This is the single source of truth for job data transformation
 */
export function parseJobFromDb(job: any) {
  // Parse basic job fields
  const parsed = {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location
      ? job.location.startsWith('[')
        ? JSON.parse(job.location)
        : job.location
      : null,
    description: job.description || undefined,
    salary_lower_bound: job.salaryLowerBound || undefined,
    salary_upper_bound: job.salaryUpperBound || undefined,
    salary_currency: job.salaryCurrency || undefined,
    requirements: job.requirements
      ? job.requirements.startsWith('[')
        ? JSON.parse(job.requirements)
        : job.requirements
      : null,
    applicationUrl: job.applicationUrl || undefined,
    sourceUrl: job.sourceUrl || undefined,
    postedDate: job.postedDate || undefined,
    extractedAt: job.extractedAt ? job.extractedAt.toISOString() : undefined,
    savedAt: job.savedAt ? job.savedAt.toISOString() : undefined,
    excluded: job.excluded === true || job.excluded === 1,
    tags: job.tags ? JSON.parse(job.tags) : [],
    rejectedAt: job.rejectedAt ? job.rejectedAt.toISOString() : undefined,
    acceptedAt: job.acceptedAt ? job.acceptedAt.toISOString() : undefined,
    createdAt: job.createdAt ? job.createdAt.toISOString() : undefined,
    updatedAt: job.updatedAt ? job.updatedAt.toISOString() : undefined,
  }

  // Parse application if present
  if (job.applications && Array.isArray(job.applications) && job.applications.length > 0) {
    const app = job.applications[0]
    parsed.application = {
      id: app.id,
      job_id: app.jobId,
      status: app.status,
      started_at: app.startedAt.toISOString(),
      submitted_at: app.submittedAt ? app.submittedAt.toISOString() : undefined,
      notes: app.notes || undefined,
      created_at: app.createdAt.toISOString(),
      updated_at: app.updatedAt.toISOString(),
    }
  }

  // Parse communications if present
  if (job.communications && Array.isArray(job.communications)) {
    parsed.communications = job.communications.map((comm: any) => ({
      id: comm.id,
      job_id: comm.jobId || undefined,
      subject: comm.subject || undefined,
      from: comm.from || undefined,
      to: comm.to || undefined,
      body: comm.body,
      body_text: comm.bodyText || undefined,
      received_at: comm.receivedAt ? comm.receivedAt.toISOString() : undefined,
      created_at: comm.createdAt.toISOString(),
      updated_at: comm.updatedAt.toISOString(),
    }))
  }

  // Parse interview rounds if present
  if (job.interviewRounds && Array.isArray(job.interviewRounds)) {
    parsed.interviewRounds = job.interviewRounds.map((round: any) => ({
      id: round.id,
      job_id: round.jobId,
      round_number: round.roundNumber,
      interviewer_name: round.interviewerName || undefined,
      interviewer_email: round.interviewerEmail || undefined,
      notes: round.notes || undefined,
      recording_url: round.recordingUrl || undefined,
      scheduled_at: round.scheduledAt ? round.scheduledAt.toISOString() : undefined,
      completed_at: round.completedAt ? round.completedAt.toISOString() : undefined,
      created_at: round.createdAt.toISOString(),
      updated_at: round.updatedAt.toISOString(),
    }))
  }

  return parsed
}

