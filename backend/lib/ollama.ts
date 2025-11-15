import { Ollama } from 'ollama'

// Initialize Ollama client
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434',
})

/**
 * Get available models from Ollama
 */
export async function getAvailableModels() {
  try {
    const response = await ollama.list()
    return response.models || []
  } catch (error: any) {
    console.error('Error fetching models from Ollama:', error)
    throw new Error(`Failed to fetch models: ${error.message}`)
  }
}

/**
 * Generate a response from Ollama with JSON format
 */
export async function generateJSONResponse(
  model: string,
  prompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
  }
) {
  try {
    const response = await ollama.generate({
      model,
      prompt,
      format: 'json',
      stream: false,
      options: {
        temperature: options?.temperature,
        num_predict: options?.maxTokens,
      },
    })

    let jsonString = response.response || ''

    // Clean up JSON string - remove markdown code blocks if present
    jsonString = jsonString
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    // Extract JSON object if wrapped in other text
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonString = jsonMatch[0]
    }

    if (!jsonString) {
      throw new Error(
        `Ollama returned an empty response. The model "${model}" may not have generated output. Try a different model.`
      )
    }

    return JSON.parse(jsonString)
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse JSON from Ollama response:', error.message)
      throw new Error(
        `Failed to parse JSON from Ollama response: ${error.message}`
      )
    }
    console.error('Error generating response from Ollama:', error)
    throw new Error(`Failed to generate response: ${error.message}`)
  }
}

/**
 * Extract job information from page content
 */
export async function extractJobInfo(
  pageContent: string,
  url: string,
  title: string,
  model: string = 'llama3.1:latest'
) {
  const prompt = `You are a job information extraction assistant. Extract job information from the following webpage and return it as a valid JSON object.
IMPORTANT: You must respond with ONLY valid JSON. No markdown, no code blocks, no explanations, just the raw JSON object.
Required JSON structure:
{
  "title": "Job title",
  "company": "Company name",
  "location": "Job location (can be string or array of strings)",
  "description": "Brief job description summary",
  "salary_lower_bound": "Lower bound of salary range as number (e.g., 126000) or null if not available",
  "salary_upper_bound": "Upper bound of salary range as number (e.g., 255000) or null if not available",
  "salary_currency": "Currency code (e.g., 'USD', 'EUR') or null",
  "requirements": "Key requirements or qualifications (can be string or array of strings)",
  "applicationUrl": "Application URL if mentioned, otherwise null",
  "postedDate": "Posted date if available, otherwise null"
}
Webpage Title: ${title}
Webpage URL: ${url}
Page Content:
${pageContent}
Now extract the job information and return ONLY the JSON object:`

  return generateJSONResponse(model, prompt)
}

/**
 * Extract LinkedIn profile information from page content
 */
export async function extractLinkedInProfile(
  linkedinUrl: string,
  pageContent: string,
  model: string = 'llama3.1:latest'
) {
  // Limit content size for Ollama
  const contentText =
    typeof pageContent === 'string'
      ? pageContent.substring(0, 20000)
      : (pageContent as any).text
      ? (pageContent as any).text.substring(0, 20000)
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

  return generateJSONResponse(model, prompt)
}

