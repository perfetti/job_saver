// Event handler orchestration - simple event name to handler function mapping
const eventHandlers = {
  extractJobInfo: handleExtractJobInfo,
  getAvailableModels: handleGetAvailableModels
};

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { event, data } = message;

  if (event && eventHandlers[event]) {
    // Handle the event asynchronously
    eventHandlers[event](data, sendResponse);
    return true; // Keep the message channel open for async response
  } else {
    sendResponse({
      success: false,
      error: `Unknown event: ${event || 'none'}`
    });
  }
});

/**
 * Handle getting available models from Ollama
 * @param {Object} data - Not used currently
 * @param {Function} sendResponse - Callback to send response
 */
async function handleGetAvailableModels(data, sendResponse) {
  try {
    const ollamaUrl = 'http://localhost:11434/api/tags';

    const response = await fetch(ollamaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const models = result.models || [];

    sendResponse({
      success: true,
      models: models
    });

  } catch (error) {
    console.error('Error fetching models:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to fetch models',
      models: []
    });
  }
}

/**
 * Handle job information extraction
 * @param {Object} data - Contains content, url, title, and model
 * @param {Function} sendResponse - Callback to send response
 */
async function handleExtractJobInfo(data, sendResponse) {
  try {
    const { content, url, title, model } = data;

    if (!content) {
      sendResponse({
        success: false,
        error: 'No content provided'
      });
      return;
    }

    // Prepare prompt for Ollama - be very explicit about JSON format
    const pageContent = content.text.substring(0, 15000); // Increased limit for better context

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

Now extract the job information and return ONLY the JSON object:`;

    // Call Ollama API
    const ollamaUrl = 'http://localhost:11434/api/generate';
    const selectedModel = model || 'llama3.1:latest'; // Default model if not specified

    // Some models may not support format: 'json', so we'll try with it first
    // and the prompt is already explicit about JSON format
    const requestBody = {
      model: selectedModel,
      prompt: prompt,
      stream: false,
      format: 'json' // Try with JSON format, but prompt is explicit as fallback
    };

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      switch (response.status) {
        case 403:
          throw new Error(`Ollama API returned 403 Forbidden. This is usually a CORS issue. Please configure Ollama to allow Chrome extensions by setting the OLLAMA_ORIGINS environment variable. See README for instructions.`);
        default:
          data = await response.json();
          throw new Error(`Ollama API error: ${response.status} ${response.statusText}, ${JSON.stringify(data)}`);
      }
    }

    const result = await response.json();

    // Debug logging
    console.log('Ollama response:', {
      hasResponse: !!result.response,
      responseLength: result.response?.length || 0,
      done: result.done,
      doneReason: result.done_reason,
      model: result.model
    });

    // Parse the response - handle different response formats
    let jobInfo;
    let jsonString = '';

    // Check if response field exists and has content
    if (result.response && result.response.trim().length > 0) {
      jsonString = result.response.trim();
    } else if (result.text && result.text.trim().length > 0) {
      jsonString = result.text.trim();
    } else {
      // If response is empty, log the full result for debugging
      console.error('Empty response from Ollama. Full result:', JSON.stringify(result, null, 2));
      throw new Error(`Ollama returned an empty response. The model "${selectedModel}" may not have generated output. Try a different model (like llama3.1:latest or llama3:latest). Response status: done=${result.done}, done_reason=${result.done_reason}`);
    }

    // Try to extract JSON if it's wrapped in markdown code blocks
    jsonString = jsonString.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    // Try to find JSON object in the string
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    try {
      jobInfo = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Response string:', jsonString.substring(0, 500));
      throw new Error(`Failed to parse JSON from Ollama response: ${parseError.message}. Response preview: ${jsonString.substring(0, 200)}`);
    }

    // Add metadata
    jobInfo.sourceUrl = url;
    jobInfo.extractedAt = new Date().toISOString();

    // Save to backend
    try {
      await saveJobToBackend(jobInfo);
    } catch (saveError) {
      console.error('Failed to save job to backend:', saveError);
      // Continue even if save fails - we still want to return the data
    }

    sendResponse({
      success: true,
      data: jobInfo
    });

  } catch (error) {
    console.error('Error extracting job info:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to extract job information'
    });
  }
}

/**
 * Save job to backend API
 * @param {Object} jobInfo - Job information to save
 */
async function saveJobToBackend(jobInfo) {
  const backendUrl = 'http://localhost:3000/api/jobs';

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobInfo)
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Job saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving job to backend:', error);
    throw error;
  }
}

// Log when background script is loaded
console.log('Job Saver Extension background script loaded');

