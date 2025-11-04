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

      sendResponse({ content: content });
    } catch (error) {
      sendResponse({ error: error.message });
    }
    return true; // Keep the message channel open for async response
  }
});

