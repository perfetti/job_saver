import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ResumeData } from '@/lib/types'

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

// Helper function to extract LinkedIn profile using Ollama
async function extractLinkedInProfile(
  linkedinUrl: string,
  pageContent: any
): Promise<ResumeData> {
  const contentText =
    typeof pageContent === 'string'
      ? pageContent.substring(0, 20000)
      : pageContent.text
      ? pageContent.text.substring(0, 20000)
      : ''

  const prompt = `You are a resume extraction assistant. Extract all relevant information from a LinkedIn profile page and structure it as a comprehensive resume object.

IMPORTANT: You must respond with ONLY valid JSON. No markdown, no code blocks, no explanations, just the raw JSON object.

Required JSON structure:
{
  "personal_info": {
    "name": "Full name",
    "headline": "Professional headline",
    "location": "Location",
    "email": "Email if available, otherwise null",
    "phone": "Phone if available, otherwise null",
    "linkedin_url": "LinkedIn profile URL",
    "website": "Personal website if available, otherwise null"
  },
  "summary": "Professional summary/about section",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "Location",
      "start_date": "Start date (YYYY-MM or YYYY-MM-DD format)",
      "end_date": "End date (YYYY-MM or YYYY-MM-DD format) or 'present' if current",
      "description": "Job description",
      "achievements": ["Achievement 1", "Achievement 2"],
      "skills_used": ["Skill 1", "Skill 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "field": "Field of study",
      "school": "School name",
      "location": "Location",
      "start_date": "Start date (YYYY-MM or YYYY format)",
      "end_date": "End date (YYYY-MM or YYYY format)",
      "description": "Additional details if available, otherwise null",
      "gpa": "GPA if available, otherwise null"
    }
  ],
  "skills": [
    {
      "name": "Skill name",
      "category": "Technical, Soft, Language, etc.",
      "proficiency": "Beginner, Intermediate, Advanced, Expert, or null if unknown"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "issue_date": "Issue date (YYYY-MM or YYYY format)",
      "expiry_date": "Expiry date if applicable, otherwise null",
      "credential_id": "Credential ID if available, otherwise null",
      "credential_url": "URL to verify credential if available, otherwise null"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "start_date": "Start date if available, otherwise null",
      "end_date": "End date if available, otherwise null",
      "url": "Project URL if available, otherwise null",
      "technologies": ["Tech 1", "Tech 2"]
    }
  ],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Native, Fluent, Conversational, Basic, or null if unknown"
    }
  ],
  "volunteer_experience": [
    {
      "role": "Volunteer role",
      "organization": "Organization name",
      "start_date": "Start date if available, otherwise null",
      "end_date": "End date if available, otherwise null",
      "description": "Description of volunteer work"
    }
  ],
  "publications": [
    {
      "title": "Publication title",
      "publisher": "Publisher name",
      "date": "Publication date",
      "url": "URL if available, otherwise null"
    }
  ],
  "awards": [
    {
      "title": "Award title",
      "issuer": "Issuing organization",
      "date": "Award date",
      "description": "Description if available, otherwise null"
    }
  ]
}

LinkedIn Profile URL: ${linkedinUrl}

Page Content:
${contentText}

Extract all available information from this LinkedIn profile page and return ONLY the JSON object. If a section is not available, use an empty array [].`

  try {
    const ollamaUrl = 'http://localhost:11434/api/generate'
    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:latest',
        prompt: prompt,
        stream: false,
        format: 'json',
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    let jsonString = result.response || result.text || ''

    // Clean up JSON string
    jsonString = jsonString
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonString = jsonMatch[0]
    }

    const resumeData = JSON.parse(jsonString) as ResumeData
    return resumeData
  } catch (error: any) {
    console.error('Error extracting LinkedIn profile:', error)
    throw new Error(`Failed to extract LinkedIn profile: ${error.message}`)
  }
}

