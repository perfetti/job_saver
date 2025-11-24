import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJobFromDb } from '@/lib/utils'

// POST /api/jobs/:id/reject - Mark a job as rejected
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        rejectedAt: new Date(),
        acceptedAt: null, // Clear acceptedAt if it was set
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
      message: 'Job marked as rejected',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    console.error('Error marking job as rejected:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/:id/reject - Clear rejected status
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        rejectedAt: null,
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
      message: 'Rejected status cleared',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    console.error('Error clearing rejected status:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

