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

export function parseJobFromDb(job: any) {
  return {
    ...job,
    location: job.location ? (job.location.startsWith('[') ? JSON.parse(job.location) : job.location) : null,
    requirements: job.requirements ? (job.requirements.startsWith('[') ? JSON.parse(job.requirements) : job.requirements) : null,
    tags: job.tags ? JSON.parse(job.tags) : [],
    excluded: job.excluded === true || job.excluded === 1,
  };
}

