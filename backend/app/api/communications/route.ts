import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/communications - Get all communications, optionally filtered by jobId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    const where = jobId ? { jobId } : {}

    const communications = await prisma.communication.findMany({
      where,
      orderBy: {
        receivedAt: 'desc',
      },
    })

    const formatted = communications.map((comm) => ({
      id: comm.id,
      job_id: comm.jobId || undefined,
      subject: comm.subject || undefined,
      from: comm.from || undefined,
      to: comm.to || undefined,
      body: comm.body,
      body_text: comm.bodyText || undefined,
      received_at: comm.receivedAt?.toISOString(),
      created_at: comm.createdAt.toISOString(),
      updated_at: comm.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      communications: formatted,
      count: formatted.length,
    })
  } catch (error: any) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/communications - Create a new communication
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const communication = await prisma.communication.create({
      data: {
        subject: data.subject || null,
        from: data.from || null,
        to: data.to || null,
        body: data.body || '',
        bodyText: data.body_text || null,
        receivedAt: data.received_at ? new Date(data.received_at) : null,
        jobId: data.job_id || null,
      },
    })

    return NextResponse.json({
      success: true,
      communication: {
        id: communication.id,
        job_id: communication.jobId || undefined,
        subject: communication.subject || undefined,
        from: communication.from || undefined,
        to: communication.to || undefined,
        body: communication.body,
        body_text: communication.bodyText || undefined,
        received_at: communication.receivedAt?.toISOString(),
        created_at: communication.createdAt.toISOString(),
        updated_at: communication.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

