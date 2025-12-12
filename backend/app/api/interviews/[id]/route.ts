import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/interviews/:id - Get a single interview round
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interview = await prisma.interviewRound.findUnique({
      where: { id: params.id },
    })

    if (!interview) {
      return NextResponse.json(
        { success: false, error: 'Interview round not found' },
        { status: 404 }
      )
    }

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
    console.error('Error fetching interview:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/interviews/:id - Update an interview round
export async function PUT(
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

    const updated = await prisma.interviewRound.update({
      where: { id: params.id },
      data: {
        roundNumber: round_number !== undefined ? round_number : undefined,
        interviewerName: interviewer_name !== undefined ? interviewer_name : undefined,
        interviewerEmail: interviewer_email !== undefined ? interviewer_email : undefined,
        notes: notes !== undefined ? notes : undefined,
        recordingUrl: recording_url !== undefined ? recording_url : undefined,
        scheduledAt: scheduled_at !== undefined ? (scheduled_at ? new Date(scheduled_at) : null) : undefined,
        completedAt: completed_at !== undefined ? (completed_at ? new Date(completed_at) : null) : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      interview: {
        id: updated.id,
        job_id: updated.jobId,
        round_number: updated.roundNumber,
        interviewer_name: updated.interviewerName || undefined,
        interviewer_email: updated.interviewerEmail || undefined,
        notes: updated.notes || undefined,
        recording_url: updated.recordingUrl || undefined,
        scheduled_at: updated.scheduledAt?.toISOString(),
        completed_at: updated.completedAt?.toISOString(),
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Interview round not found' },
        { status: 404 }
      )
    }
    console.error('Error updating interview:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/interviews/:id - Delete an interview round
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.interviewRound.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Interview round deleted successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Interview round not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting interview:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


