import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/applications - Start a new application
export async function POST(request: NextRequest) {
  try {
    const { job_id, status, notes } = await request.json()

    if (!job_id) {
      return NextResponse.json(
        { success: false, error: 'job_id is required' },
        { status: 400 }
      )
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: job_id },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if application already exists
    const existing = await prisma.application.findFirst({
      where: { jobId: job_id },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application already exists for this job',
          application: {
            id: existing.id,
            job_id: existing.jobId,
            status: existing.status,
            started_at: existing.startedAt.toISOString(),
            submitted_at: existing.submittedAt?.toISOString(),
            notes: existing.notes || undefined,
          },
        },
        { status: 400 }
      )
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        jobId: job_id,
        status: status || 'started',
        notes: notes || null,
      },
    })

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        job_id: application.jobId,
        status: application.status,
        started_at: application.startedAt.toISOString(),
        submitted_at: application.submittedAt?.toISOString(),
        notes: application.notes || undefined,
        created_at: application.createdAt.toISOString(),
        updated_at: application.updatedAt.toISOString(),
      },
      message: 'Application started successfully',
    })
  } catch (error: any) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

