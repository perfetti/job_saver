import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/applications/:id - Get application by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
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

// PUT /api/applications/:id - Update an application
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, submitted_at, notes } = await request.json()

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: {
        status: status,
        submittedAt: submitted_at ? new Date(submitted_at) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json({
      success: true,
      application: {
        id: updated.id,
        job_id: updated.jobId,
        status: updated.status,
        started_at: updated.startedAt.toISOString(),
        submitted_at: updated.submittedAt?.toISOString(),
        notes: updated.notes || undefined,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      },
      message: 'Application updated successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }
    console.error('Error updating application:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/:id - Delete an application
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.application.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

