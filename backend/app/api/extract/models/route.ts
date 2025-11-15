import { NextResponse } from 'next/server'
import { getAvailableModels } from '@/lib/ollama'

/**
 * GET /api/extract/models - Get available Ollama models
 *
 * Response:
 * {
 *   success: boolean,
 *   models?: array,
 *   error?: string
 * }
 */
export async function GET() {
  try {
    const models = await getAvailableModels()
    return NextResponse.json({
      success: true,
      models,
    })
  } catch (error: any) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch models',
        models: [],
      },
      { status: 500 }
    )
  }
}

