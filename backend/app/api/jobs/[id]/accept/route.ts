import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJobFromDb } from '@/lib/utils'

// POST /api/jobs/:id/accept - Mark a job as accepted
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        acceptedAt: new Date(),
        rejectedAt: null, // Clear rejectedAt if it was set
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
      message: 'Job marked as accepted',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    console.error('Error marking job as accepted:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/:id/accept - Clear accepted status
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        acceptedAt: null,
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
      message: 'Accepted status cleared',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    console.error('Error clearing accepted status:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

