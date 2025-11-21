import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeUrl, prepareJobData, parseJobFromDb } from '@/lib/utils'

// GET /api/jobs - Get all jobs
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        applications: true,
        communications: {
          orderBy: {
            receivedAt: 'desc',
          },
        },
      },
      orderBy: {
        savedAt: 'desc',
      },
    })

    const formattedJobs = jobs.map((job) => {
      const parsed = parseJobFromDb(job)
      if (job.applications && job.applications.length > 0) {
        parsed.application = {
          id: job.applications[0].id,
          job_id: job.applications[0].jobId,
          status: job.applications[0].status as any,
          started_at: job.applications[0].startedAt.toISOString(),
          submitted_at: job.applications[0].submittedAt?.toISOString(),
          notes: job.applications[0].notes || undefined,
          created_at: job.applications[0].createdAt.toISOString(),
          updated_at: job.applications[0].updatedAt.toISOString(),
        }
      }
      if (job.communications && job.communications.length > 0) {
        parsed.communications = job.communications.map((comm) => ({
          id: comm.id,
          job_id: comm.jobId || undefined,
          subject: comm.subject || undefined,
          from: comm.from || undefined,
          to: comm.to || undefined,
          body: comm.body,
          body_text: comm.bodyText || undefined,
          received_at: comm.receivedAt?.toISOString(),
          created_at: comm.createdAt.toISOString(),
          updated_at: comm.updatedAt.toISOString(),
        }))
      }
      return parsed
    })

    return NextResponse.json({
      success: true,
      jobs: formattedJobs,
      count: formattedJobs.length,
    })
  } catch (error: any) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Save a new job
export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json()

    // Validate required fields - set defaults like Express server
    if (!jobData.title || !jobData.company) {
      console.error('Missing required fields: title and company are required')
      jobData.title = jobData.title || 'Title Not Found'
      jobData.company = jobData.company || 'Company Not Found'
    }

    // Add ID and timestamp if not present
    if (!jobData.id) {
      jobData.id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
    }

    const prepared = prepareJobData(jobData)
    const normalizedSourceUrl = normalizeUrl(jobData.sourceUrl)

    // Check for duplicates
    let existingJob = null
    if (normalizedSourceUrl) {
      const allJobs = await prisma.job.findMany({
        where: {
          sourceUrl: {
            not: null,
          },
        },
      })

      existingJob = allJobs.find((job) => {
        const existingNormalized = normalizeUrl(job.sourceUrl)
        return existingNormalized === normalizedSourceUrl
      })
    }

    if (existingJob) {
      // Update existing job
      const updated = await prisma.job.update({
        where: { id: existingJob.id },
        data: {
          title: jobData.title,
          company: jobData.company,
          location: prepared.location,
          description: jobData.description,
          salaryLowerBound: jobData.salary_lower_bound || null,
          salaryUpperBound: jobData.salary_upper_bound || null,
          salaryCurrency: jobData.salary_currency || null,
          requirements: prepared.requirements,
          applicationUrl: jobData.applicationUrl || null,
          sourceUrl: jobData.sourceUrl || null,
          postedDate: jobData.postedDate || null,
          extractedAt: new Date(),
          excluded: jobData.excluded === true,
          tags: prepared.tags,
        },
      })

      return NextResponse.json({
        success: true,
        job: parseJobFromDb(updated),
        message: 'Job updated (duplicate prevented)',
        updated: true,
      })
    } else {
      // Create new job
      const newJob = await prisma.job.create({
        data: {
          id: jobData.id,
          title: jobData.title,
          company: jobData.company,
          location: prepared.location,
          description: jobData.description,
          salaryLowerBound: jobData.salary_lower_bound || null,
          salaryUpperBound: jobData.salary_upper_bound || null,
          salaryCurrency: jobData.salary_currency || null,
          requirements: prepared.requirements,
          applicationUrl: jobData.applicationUrl || null,
          sourceUrl: jobData.sourceUrl || null,
          postedDate: jobData.postedDate || null,
          extractedAt: jobData.extractedAt ? new Date(jobData.extractedAt) : new Date(),
          savedAt: jobData.savedAt ? new Date(jobData.savedAt) : new Date(),
          excluded: jobData.excluded === true,
          tags: prepared.tags,
        },
      })

      return NextResponse.json({
        success: true,
        job: parseJobFromDb(newJob),
        message: 'Job saved successfully',
      })
    }
  } catch (error: any) {
    console.error('Error saving job:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

