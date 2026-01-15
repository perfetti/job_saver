// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    try {
      // Extract page content
      const content = {
        text: document.body.innerText || document.body.textContent || '',
        html: document.documentElement.outerHTML,
        title: document.title,
        url: window.location.href
      };
      console.log("Sending page content to background script", content);

      sendResponse({ content: content });
    } catch (error) {
      sendResponse({ error: error.message });
    }
    return true; // Keep the message channel open for async response
  }

  if (request.action === 'showAppliedBadge') {
    injectAppliedBadge();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'hideAppliedBadge') {
    removeAppliedBadge();
    sendResponse({ success: true });
    return true;
  }
});

// Check if we've applied to this job when page loads
checkApplicationStatus();

// Also check on navigation (for SPAs like React Router, etc.)
let lastUrl = window.location.href;
setInterval(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    checkApplicationStatus();
  }
}, 1000);

/**
 * Check if current page URL has an application
 */
async function checkApplicationStatus() {
  try {
    const currentUrl = window.location.href;

    // Skip chrome:// and extension pages
    if (currentUrl.startsWith('chrome://') ||
        currentUrl.startsWith('chrome-extension://') ||
        currentUrl.startsWith('edge://')) {
      return;
    }

    // Send message to background script to check application status
    chrome.runtime.sendMessage(
      {
        event: 'checkApplicationStatus',
        data: { url: currentUrl }
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error checking application status:', chrome.runtime.lastError);
          return;
        }

        if (response && response.success && response.hasApplication) {
          injectAppliedBadge();
        }
      }
    );
  } catch (error) {
    console.error('Error in checkApplicationStatus:', error);
  }
}

/**
 * Inject the APPLIED badge into the page
 */
function injectAppliedBadge() {
  // Remove existing badge if present
  removeAppliedBadge();

  // Create badge element
  const badge = document.createElement('div');
  badge.id = 'job-saver-applied-badge';
  badge.textContent = 'APPLIED';
  badge.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    cursor: default;
    user-select: none;
    animation: slideIn 0.3s ease-out;
    letter-spacing: 0.5px;
  `;

  // Add animation keyframes if not already present
  if (!document.getElementById('job-saver-badge-styles')) {
    const style = document.createElement('style');
    style.id = 'job-saver-badge-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(badge);
}

/**
 * Remove the APPLIED badge from the page
 */
function removeAppliedBadge() {
  const existingBadge = document.getElementById('job-saver-applied-badge');
  if (existingBadge) {
    existingBadge.remove();
  }
}

