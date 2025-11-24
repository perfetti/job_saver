import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { prepareJobData, parseJobFromDb } from '@/lib/utils'

// GET /api/jobs/:id - Get a single job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        applications: true,
        communications: {
          orderBy: {
            receivedAt: 'desc',
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    const parsed = parseJobFromDb(job)

    return NextResponse.json({ success: true, job: parsed })
  } catch (error: any) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/jobs/:id - Update a job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobData = await request.json()

    // Validate required fields - set defaults like Express server
    if (!jobData.title || !jobData.company) {
      jobData.title = jobData.title || 'Title Not Found'
      jobData.company = jobData.company || 'Company Not Found'
    }

    const prepared = prepareJobData(jobData)

    const updated = await prisma.job.update({
      where: { id: params.id },
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
      include: {
        applications: true,
        communications: {
          orderBy: {
            receivedAt: 'desc',
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      job: parseJobFromDb(updated),
      message: 'Job updated successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    console.error('Error updating job:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/:id - Delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.job.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

