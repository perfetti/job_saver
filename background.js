// Event handler orchestration - simple event name to handler function mapping
const eventHandlers = {
  extractJobInfo: handleExtractJobInfo,
  getAvailableModels: handleGetAvailableModels,
  extractLinkedInProfile: handleExtractLinkedInProfile,
  extractEmail: handleExtractEmail,
  checkApplicationStatus: handleCheckApplicationStatus
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
 * Handle getting available models from backend API
 * @param {Object} data - Not used currently
 * @param {Function} sendResponse - Callback to send response
 */
async function handleGetAvailableModels(data, sendResponse) {
  try {
    const backendUrl = 'http://localhost:3000/api/extract/models';

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch models');
    }

    sendResponse({
      success: true,
      models: result.models || []
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
 * Handle job information extraction - now calls backend API
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

    // Call backend API to extract and save job
    const backendUrl = 'http://localhost:3000/api/extract/job';
    const selectedModel = model || 'llama3.1:latest';

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        url: url,
        title: title,
        model: selectedModel
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to extract job information');
    }

    sendResponse({
      success: true,
      data: result.jobInfo,
      saved: result.saved || false,
      updated: result.updated || false,
      jobId: result.jobId || result.jobInfo?.id || null
    });

  } catch (error) {
    console.error('Error extracting job info:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to extract job information'
    });
  }
}

// Note: saveJobToBackend function removed - job saving is now handled by /api/extract/job endpoint

// Create context menu item on extension install/startup
function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'extract-job',
      title: 'Extract Job Information',
      contexts: ['page', 'selection']
    });
  });
}

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

// Also create on startup (for when browser restarts)
chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

// Create immediately when script loads (in case it wasn't created yet)
createContextMenu();

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extract-job') {
    handleKeyboardShortcut();
  }
});

// Listen for keyboard shortcut command (keeping for compatibility)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'extract-job') {
    handleKeyboardShortcut();
  }
});

/**
 * Handle keyboard shortcut extraction
 */
async function handleKeyboardShortcut() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      showNotification('Error', 'No active tab found', 'error');
      return;
    }

    // Check if we can access the tab
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
      showNotification('Error', 'Cannot extract content from this type of page', 'error');
      return;
    }

    showNotification('Extracting...', 'Getting page content', 'info');

    // Extract page content
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          text: document.body.innerText || document.body.textContent || '',
          html: document.documentElement.outerHTML,
          title: document.title,
          url: window.location.href
        };
      }
    });

    if (!results || !results[0] || !results[0].result) {
      showNotification('Error', 'Failed to get page content', 'error');
      return;
    }

    const content = results[0].result;

    // Get default model from storage or use default
    const storage = await chrome.storage.local.get(['selectedModel']);
    const model = storage.selectedModel || 'llama3.1:latest';

    showNotification('Processing...', 'Extracting job information with AI', 'info');

    // Process the content
    const response = await handleExtractJobInfoSync({
      content: content,
      url: tab.url,
      title: tab.title,
      model: model
    });

    if (response.success) {
      // Job is already saved in handleExtractJobInfo, show appropriate message
      const jobTitle = response.data?.title || response.data?.job?.title || 'Job';
      const company = response.data?.company || response.data?.job?.company || '';
      const savedMessage = company
        ? `${jobTitle} at ${company}`
        : jobTitle;

      const notificationMessage = response.updated
        ? `Job updated (duplicate prevented): ${savedMessage}`
        : `Job information extracted and saved: ${savedMessage}`;

      showNotification('Success!', notificationMessage, 'success');

      // Open tag modal if we have a job ID
      if (response.jobId && !response.updated) {
        setTimeout(() => {
          openTagModal(response.jobId, response.data);
        }, 500);
      }
    } else {
      showNotification('Error', response.error || 'Failed to extract job information', 'error');
    }

  } catch (error) {
    console.error('Error in keyboard shortcut handler:', error);
    showNotification('Error', error.message || 'Failed to extract job information', 'error');
  }
}

/**
 * Synchronous version of handleExtractJobInfo (for keyboard shortcut)
 */
async function handleExtractJobInfoSync(data) {
  return new Promise(async (resolve) => {
    await handleExtractJobInfo(data, (response) => {
      resolve(response);
    });
  });
}

/**
 * Open tag modal window
 */
function openTagModal(jobId, jobData) {
  const modalUrl = chrome.runtime.getURL('tag-modal.html');
  const dataParam = encodeURIComponent(JSON.stringify(jobData));
  const url = `${modalUrl}?jobId=${jobId}&data=${dataParam}`;

  chrome.windows.create({
    url: url,
    type: 'popup',
    width: 500,
    height: 500,
    focused: true
  });
}

/**
 * Show notification to user
 */
function showNotification(title, message, type = 'info') {
  // Use Chrome notifications API
  const notificationOptions = {
    type: 'basic',
    title: title,
    message: message,
    priority: type === 'error' ? 2 : 1
  };

  // Try to add icon if available (optional)
  try {
    // Chrome will use default icon if this fails
    notificationOptions.iconUrl = chrome.runtime.getURL('icon48.png');
  } catch (e) {
    // Icon not available, Chrome will use default
  }

  chrome.notifications.create(notificationOptions, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('Notification error:', chrome.runtime.lastError);
      return;
    }

    // Auto-close after 5 seconds for success/info, 10 seconds for errors
    if (notificationId) {
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, type === 'error' ? 10000 : 5000);
    }
  });
}

/**
 * Handle LinkedIn profile extraction
 * @param {Object} data - Contains content, url, and model
 * @param {Function} sendResponse - Callback to send response
 */
async function handleExtractLinkedInProfile(data, sendResponse) {
  try {
    const { content, url, model } = data;

    if (!content) {
      sendResponse({
        success: false,
        error: 'No content provided'
      });
      return;
    }

    if (!url || !url.includes('linkedin.com/in/')) {
      sendResponse({
        success: false,
        error: 'Invalid LinkedIn profile URL'
      });
      return;
    }

    // Send to backend for processing
    const backendUrl = 'http://localhost:3000/api/profile/linkedin';

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        linkedin_url: url,
        page_content: content
      })
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`);
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      sendResponse({
        success: true,
        profile: result.profile,
        message: result.message || 'LinkedIn profile extracted and saved successfully'
      });
    } else {
      sendResponse({
        success: false,
        error: result.error || 'Failed to extract LinkedIn profile'
      });
    }

  } catch (error) {
    console.error('Error extracting LinkedIn profile:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to extract LinkedIn profile'
    });
  }
}

/**
 * Handle email extraction from Gmail
 * @param {Object} data - Email content and metadata
 * @param {Function} sendResponse - Callback to send response
 */
async function handleExtractEmail(data, sendResponse) {
  try {
    const { emailContent, url, model } = data;

    if (!emailContent) {
      throw new Error('Email content is required');
    }

    showNotification('Extracting email...', 'Processing email content', 'info');

    const backendUrl = 'http://localhost:3000/api/extract/email';

    // Prepare email content string for parsing
    const emailContentString = JSON.stringify({
      subject: emailContent.subject || '',
      from: emailContent.from || '',
      to: emailContent.to || '',
      body: emailContent.body || emailContent.bodyText || '',
      bodyText: emailContent.bodyText || '',
      date: emailContent.date || ''
    });

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailContent: emailContentString,
        model: model || 'llama3.1:latest'
      })
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`);
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      showNotification('Email extracted!', 'You can assign it to a job in the gallery', 'success');
      sendResponse({
        success: true,
        communicationId: result.communication?.id,
        communication: result.communication,
        message: 'Email extracted successfully'
      });
    } else {
      throw new Error(result.error || 'Failed to extract email');
    }

  } catch (error) {
    console.error('Error extracting email:', error);
    showNotification('Error', error.message || 'Failed to extract email', 'error');
    sendResponse({
      success: false,
      error: error.message || 'Failed to extract email'
    });
  }
}

/**
 * Handle checking application status for a URL
 * @param {Object} data - Contains url
 * @param {Function} sendResponse - Callback to send response
 */
async function handleCheckApplicationStatus(data, sendResponse) {
  try {
    const { url } = data;

    if (!url) {
      sendResponse({
        success: false,
        error: 'URL is required'
      });
      return;
    }

    // Call backend API to check if job exists and has application
    const backendUrl = `http://localhost:3000/api/jobs/by-url?url=${encodeURIComponent(url)}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      // If job not found, that's okay - just means no application
      if (response.status === 404) {
        sendResponse({
          success: true,
          hasApplication: false,
          job: null
        });
        return;
      }
      throw new Error(`Failed to check application status: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to check application status');
    }

    sendResponse({
      success: true,
      hasApplication: result.hasApplication || false,
      job: result.job || null,
      jobId: result.jobId || null
    });

  } catch (error) {
    console.error('Error checking application status:', error);
    // On error, assume no application (fail gracefully)
    sendResponse({
      success: true,
      hasApplication: false,
      error: error.message || 'Failed to check application status'
    });
  }
}

// Log when background script is loaded
console.log('Job Saver Extension background script loaded');

