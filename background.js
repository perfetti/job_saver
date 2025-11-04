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

    // Prepare prompt for Ollama
    const prompt = `Extract job information from the following webpage content. Return a JSON object with the following fields:
- title: Job title
- company: Company name
- location: Job location
- description: Job description (summary)
- salary: Salary information if available
- requirements: Key requirements or qualifications
- applicationUrl: Application URL if mentioned
- postedDate: Posted date if available

Webpage Title: ${title}
Webpage URL: ${url}

Page Content:
${content.text.substring(0, 10000)}

Return ONLY valid JSON, no additional text or markdown formatting.`;

    // Call Ollama API
    const ollamaUrl = 'http://localhost:11434/api/generate';
    const selectedModel = model || 'llama3.1:latest'; // Default model if not specified

    const response = await fetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        prompt: prompt,
        stream: false,
        format: 'json'
      })
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

    // Parse the response
    let jobInfo;
    try {
      // Ollama might return the JSON in the 'response' field
      const jsonString = result.response || result.text || JSON.stringify(result);
      jobInfo = JSON.parse(jsonString);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = result.response?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jobInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON from Ollama response');
      }
    }

    // Add metadata
    jobInfo.sourceUrl = url;
    jobInfo.extractedAt = new Date().toISOString();

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

// Log when background script is loaded
console.log('Job Saver Extension background script loaded');

