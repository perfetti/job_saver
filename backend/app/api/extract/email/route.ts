import { NextRequest, NextResponse } from 'next/server'
import { extractEmailInfo } from '@/lib/ollama'
import { prisma } from '@/lib/prisma'

// POST /api/extract/email - Extract and parse email content
export async function POST(request: NextRequest) {
  try {
    const { emailContent, model } = await request.json()

    if (!emailContent) {
      return NextResponse.json(
        { success: false, error: 'Email content is required' },
        { status: 400 }
      )
    }

    // Extract email information using Ollama
    const emailInfo = await extractEmailInfo(emailContent, model || 'llama3.1:latest')

    // Create communication record
    const communication = await prisma.communication.create({
      data: {
        subject: emailInfo.subject || null,
        from: emailInfo.from || null,
        to: emailInfo.to || null,
        body: emailInfo.body || emailContent,
        bodyText: emailInfo.body_text || null,
        receivedAt: emailInfo.received_at ? new Date(emailInfo.received_at) : null,
        jobId: null, // Will be assigned later
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
      extracted: emailInfo,
    })
  } catch (error: any) {
    console.error('Error extracting email:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

