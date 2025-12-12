import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/jobs/:id/interviews - Get all interview rounds for a job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviews = await prisma.interviewRound.findMany({
      where: { jobId: params.id },
      orderBy: [
        { roundNumber: 'asc' },
        { scheduledAt: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      interviews: interviews.map((interview) => ({
        id: interview.id,
        job_id: interview.jobId,
        round_number: interview.roundNumber,
        interviewer_name: interview.interviewerName || undefined,
        interviewer_email: interview.interviewerEmail || undefined,
        notes: interview.notes || undefined,
        recording_url: interview.recordingUrl || undefined,
        scheduled_at: interview.scheduledAt?.toISOString(),
        completed_at: interview.completedAt?.toISOString(),
        created_at: interview.createdAt.toISOString(),
        updated_at: interview.updatedAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/jobs/:id/interviews - Create a new interview round
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      round_number,
      interviewer_name,
      interviewer_email,
      notes,
      recording_url,
      scheduled_at,
      completed_at,
    } = body

    // Validate job exists
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    // If round_number not provided, get the next number
    let roundNumber = round_number
    if (!roundNumber) {
      const maxRound = await prisma.interviewRound.findFirst({
        where: { jobId: params.id },
        orderBy: { roundNumber: 'desc' },
        select: { roundNumber: true },
      })
      roundNumber = maxRound ? maxRound.roundNumber + 1 : 1
    }

    const interview = await prisma.interviewRound.create({
      data: {
        jobId: params.id,
        roundNumber: roundNumber,
        interviewerName: interviewer_name || null,
        interviewerEmail: interviewer_email || null,
        notes: notes || null,
        recordingUrl: recording_url || null,
        scheduledAt: scheduled_at ? new Date(scheduled_at) : null,
        completedAt: completed_at ? new Date(completed_at) : null,
      },
    })

    return NextResponse.json({
      success: true,
      interview: {
        id: interview.id,
        job_id: interview.jobId,
        round_number: interview.roundNumber,
        interviewer_name: interview.interviewerName || undefined,
        interviewer_email: interview.interviewerEmail || undefined,
        notes: interview.notes || undefined,
        recording_url: interview.recordingUrl || undefined,
        scheduled_at: interview.scheduledAt?.toISOString(),
        completed_at: interview.completedAt?.toISOString(),
        created_at: interview.createdAt.toISOString(),
        updated_at: interview.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error creating interview:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


