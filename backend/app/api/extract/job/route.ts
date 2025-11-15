import { NextRequest, NextResponse } from 'next/server'
import { extractJobInfo } from '@/lib/ollama'
import { prisma } from '@/lib/prisma'
import { normalizeUrl, prepareJobData, parseJobFromDb } from '@/lib/utils'

/**
 * POST /api/extract/job - Extract job information from page content using Ollama
 *
 * Request body:
 * {
 *   content: string | { text: string, html?: string },
 *   url: string,
 *   title: string,
 *   model?: string (optional, defaults to 'llama3.1:latest')
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   jobInfo?: object,
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, url, title, model } = body

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    // Extract text content
    const pageContent =
      typeof content === 'string'
        ? content
        : content.text || content.html || ''

    // Limit content size for Ollama (15,000 characters)
    const limitedContent = pageContent.substring(0, 15000)

    // Extract job information using Ollama
    const selectedModel = model || 'llama3.1:latest'
    const jobInfo = await extractJobInfo(limitedContent, url, title, selectedModel)

    // Add metadata
    jobInfo.sourceUrl = url
    jobInfo.extractedAt = new Date().toISOString()

    // Save to database
    try {
      // Validate required fields
      if (!jobInfo.title || !jobInfo.company) {
        jobInfo.title = jobInfo.title || 'Title Not Found'
        jobInfo.company = jobInfo.company || 'Company Not Found'
      }

      // Add ID and timestamp if not present
      if (!jobInfo.id) {
        jobInfo.id =
          Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
      }

      const prepared = prepareJobData(jobInfo)
      const normalizedSourceUrl = normalizeUrl(jobInfo.sourceUrl)

      // Check for duplicates
      let existingJob = null
      if (normalizedSourceUrl) {
        const allJobs = await prisma.job.findMany({
          where: {
            sourceUrl: {
              not: null,
            },
          },
          select: {
            id: true,
            sourceUrl: true,
          },
        })

        const matchingJob = allJobs.find((job) => {
          if (!job.sourceUrl) return false
          const normalized = normalizeUrl(job.sourceUrl)
          return normalized && normalized.includes(normalizedSourceUrl.replace(/\/$/, ''))
        })

        if (matchingJob) {
          existingJob = await prisma.job.findUnique({
            where: { id: matchingJob.id },
          })
        }
      }

      let savedJob
      let updated = false

      if (existingJob) {
        // Update existing job
        savedJob = await prisma.job.update({
          where: { id: existingJob.id },
          data: {
            title: jobInfo.title,
            company: jobInfo.company,
            location: prepared.location,
            description: jobInfo.description,
            salaryLowerBound: jobInfo.salary_lower_bound || null,
            salaryUpperBound: jobInfo.salary_upper_bound || null,
            salaryCurrency: jobInfo.salary_currency || null,
            requirements: prepared.requirements,
            applicationUrl: jobInfo.applicationUrl || null,
            sourceUrl: jobInfo.sourceUrl || null,
            postedDate: jobInfo.postedDate || null,
            extractedAt: new Date(jobInfo.extractedAt),
            excluded: prepared.excluded,
            tags: prepared.tags,
          },
        })
        updated = true
      } else {
        // Create new job
        savedJob = await prisma.job.create({
          data: {
            id: jobInfo.id,
            title: jobInfo.title,
            company: jobInfo.company,
            location: prepared.location,
            description: jobInfo.description,
            salaryLowerBound: jobInfo.salary_lower_bound || null,
            salaryUpperBound: jobInfo.salary_upper_bound || null,
            salaryCurrency: jobInfo.salary_currency || null,
            requirements: prepared.requirements,
            applicationUrl: jobInfo.applicationUrl || null,
            sourceUrl: jobInfo.sourceUrl || null,
            postedDate: jobInfo.postedDate || null,
            extractedAt: jobInfo.extractedAt
              ? new Date(jobInfo.extractedAt)
              : new Date(),
            savedAt: new Date(),
            excluded: prepared.excluded,
            tags: prepared.tags,
          },
        })
      }

      const parsedJob = parseJobFromDb(savedJob)

      return NextResponse.json({
        success: true,
        jobInfo: parsedJob,
        saved: true,
        updated,
        jobId: savedJob.id,
      })
    } catch (saveError: any) {
      console.error('Error saving job to database:', saveError)
      // Return extracted data even if save fails
      return NextResponse.json({
        success: true,
        jobInfo,
        saved: false,
        error: `Extracted successfully but failed to save: ${saveError.message}`,
      })
    }
  } catch (error: any) {
    console.error('Error extracting job information:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to extract job information',
      },
      { status: 500 }
    )
  }
}

