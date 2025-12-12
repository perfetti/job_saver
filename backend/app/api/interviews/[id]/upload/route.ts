import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// POST /api/interviews/:id/upload - Upload a recording file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('recording') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate interview exists
    const interview = await prisma.interviewRound.findUnique({
      where: { id: params.id },
    })

    if (!interview) {
      return NextResponse.json(
        { success: false, error: 'Interview round not found' },
        { status: 404 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'recordings')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${params.id}-${timestamp}-${sanitizedFilename}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update interview with recording URL
    const recordingUrl = `/uploads/recordings/${filename}`
    const updated = await prisma.interviewRound.update({
      where: { id: params.id },
      data: { recordingUrl },
    })

    return NextResponse.json({
      success: true,
      recording_url: recordingUrl,
      interview: {
        id: updated.id,
        recording_url: updated.recordingUrl || undefined,
      },
    })
  } catch (error: any) {
    console.error('Error uploading recording:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


