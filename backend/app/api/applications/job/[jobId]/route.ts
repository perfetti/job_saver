import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/applications/job/:job_id - Get application for a job
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const application = await prisma.application.findFirst({
      where: { jobId: params.jobId },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

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
    })
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

