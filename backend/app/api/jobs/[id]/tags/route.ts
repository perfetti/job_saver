import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJobFromDb } from '@/lib/utils'

// PUT /api/jobs/:id/tags - Update tags for a job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tags } = await request.json()

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        tags: JSON.stringify(tags || []),
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
      message: 'Tags updated successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }
    console.error('Error updating tags:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

