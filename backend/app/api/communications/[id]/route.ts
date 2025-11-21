import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/communications/:id - Update a communication (e.g., assign to job)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const updated = await prisma.communication.update({
      where: { id: params.id },
      data: {
        jobId: data.job_id !== undefined ? data.job_id : undefined,
        subject: data.subject !== undefined ? data.subject : undefined,
        from: data.from !== undefined ? data.from : undefined,
        to: data.to !== undefined ? data.to : undefined,
        body: data.body !== undefined ? data.body : undefined,
        bodyText: data.body_text !== undefined ? data.body_text : undefined,
        receivedAt: data.received_at ? new Date(data.received_at) : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      communication: {
        id: updated.id,
        job_id: updated.jobId || undefined,
        subject: updated.subject || undefined,
        from: updated.from || undefined,
        to: updated.to || undefined,
        body: updated.body,
        body_text: updated.bodyText || undefined,
        received_at: updated.receivedAt?.toISOString(),
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Communication not found' },
        { status: 404 }
      )
    }
    console.error('Error updating communication:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/communications/:id - Delete a communication
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.communication.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Communication deleted successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Communication not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting communication:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

