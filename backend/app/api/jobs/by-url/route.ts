import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeUrl, parseJobFromDb } from '@/lib/utils'

// GET /api/jobs/by-url?url=... - Find a job by URL and check if it has an application
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Normalize the URL for matching
    const normalizedUrl = normalizeUrl(url)

    if (!normalizedUrl) {
      return NextResponse.json({
        success: true,
        job: null,
        hasApplication: false,
      })
    }

    // Find all jobs with sourceUrl
    const allJobs = await prisma.job.findMany({
      where: {
        sourceUrl: {
          not: null,
        },
      },
      include: {
        applications: true,
      },
    })

    // Find matching job by normalized URL
    const matchingJob = allJobs.find((job) => {
      if (!job.sourceUrl) return false
      const jobNormalized = normalizeUrl(job.sourceUrl)
      if (!jobNormalized) return false

      // Check if URLs match (handle both directions for partial matches)
      return (
        jobNormalized === normalizedUrl ||
        jobNormalized.includes(normalizedUrl.replace(/\/$/, '')) ||
        normalizedUrl.includes(jobNormalized.replace(/\/$/, ''))
      )
    })

    if (!matchingJob) {
      return NextResponse.json({
        success: true,
        job: null,
        hasApplication: false,
      })
    }

    // Check if job has an application
    const hasApplication = matchingJob.applications && matchingJob.applications.length > 0

    // Get full job details with all relations
    const fullJob = await prisma.job.findUnique({
      where: { id: matchingJob.id },
      include: {
        applications: true,
        communications: {
          orderBy: {
            receivedAt: 'desc',
          },
        },
        interviewRounds: {
          orderBy: [
            { roundNumber: 'asc' },
            { scheduledAt: 'desc' },
          ],
        },
      },
    })

    return NextResponse.json({
      success: true,
      job: fullJob ? parseJobFromDb(fullJob) : null,
      hasApplication: hasApplication,
      jobId: matchingJob.id,
    })
  } catch (error: any) {
    console.error('Error finding job by URL:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}




