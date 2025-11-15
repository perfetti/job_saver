import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ResumeData } from '@/lib/types'
import { extractLinkedInProfile } from '@/lib/ollama'

// GET /api/profile - Get user profile
export async function GET() {
  try {
    let profile = await prisma.userProfile.findUnique({
      where: { id: 'default' },
    })

    if (!profile) {
      return NextResponse.json({ success: true, profile: null })
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        linkedin_url: profile.linkedinUrl,
        resume_data: profile.resumeData ? JSON.parse(profile.resumeData) : null,
        created_at: profile.createdAt.toISOString(),
        updated_at: profile.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/profile/linkedin - Save LinkedIn URL and extract profile
export async function POST(request: NextRequest) {
  try {
    const { linkedin_url, page_content } = await request.json()

    if (!linkedin_url) {
      return NextResponse.json(
        { success: false, error: 'LinkedIn URL is required' },
        { status: 400 }
      )
    }

    if (!linkedin_url.includes('linkedin.com/in/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid LinkedIn profile URL' },
        { status: 400 }
      )
    }

    if (!page_content) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Page content is required. Please use the Chrome extension to extract the LinkedIn profile page.',
        },
        { status: 400 }
      )
    }

    // Extract profile data using Ollama
    const resumeData = await extractLinkedInProfile(linkedin_url, page_content)

    // Upsert profile
    const profile = await prisma.userProfile.upsert({
      where: { id: 'default' },
      update: {
        linkedinUrl: linkedin_url,
        resumeData: JSON.stringify(resumeData),
      },
      create: {
        id: 'default',
        linkedinUrl: linkedin_url,
        resumeData: JSON.stringify(resumeData),
      },
    })

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        linkedin_url: profile.linkedinUrl,
        resume_data: JSON.parse(profile.resumeData || '{}'),
        created_at: profile.createdAt.toISOString(),
        updated_at: profile.updatedAt.toISOString(),
      },
      message: 'Profile saved successfully',
    })
  } catch (error: any) {
    console.error('Error saving profile:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/profile/resume - Update resume data
export async function PUT(request: NextRequest) {
  try {
    const { resume_data } = await request.json()

    if (!resume_data) {
      return NextResponse.json(
        { success: false, error: 'Resume data is required' },
        { status: 400 }
      )
    }

    const profile = await prisma.userProfile.update({
      where: { id: 'default' },
      data: {
        resumeData: JSON.stringify(resume_data),
      },
    })

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        linkedin_url: profile.linkedinUrl,
        resume_data: JSON.parse(profile.resumeData || '{}'),
        created_at: profile.createdAt.toISOString(),
        updated_at: profile.updatedAt.toISOString(),
      },
      message: 'Resume updated successfully',
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not found. Please save LinkedIn URL first.',
        },
        { status: 404 }
      )
    }
    console.error('Error updating resume:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}


