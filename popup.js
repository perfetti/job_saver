document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  const status = document.getElementById('status');
  const results = document.getElementById('results');

  function setStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status ${type}`;
  }

  function showResults(data) {
    results.textContent = JSON.stringify(data, null, 2);
    results.classList.add('show');
  }

  extractBtn.addEventListener('click', async () => {
    try {
      extractBtn.disabled = true;
      setStatus('Getting page content...', 'info');

      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('No active tab found');
      }

      // Check if we can access the tab (some pages like chrome:// can't be accessed)
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        throw new Error('Cannot extract content from this type of page');
      }

      // Use executeScript to inject and get page content directly
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
        throw new Error('Failed to get page content');
      }

      const content = results[0].result;

      setStatus('Sending to background script...', 'info');

      // Send content to background script for processing
      chrome.runtime.sendMessage({
        event: 'extractJobInfo',
        data: {
          content: content,
          url: tab.url,
          title: tab.title
        }
      }, (response) => {
        extractBtn.disabled = false;

        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          setStatus(`Error: ${chrome.runtime.lastError.message}`, 'error');
          return;
        }

        if (response && response.success) {
          setStatus('Job information extracted successfully!', 'success');
          if (response.data) {
            showResults(response.data);
          }
        } else {
          setStatus(`Error: ${response?.error || 'Failed to extract job information'}`, 'error');
        }
      });

    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`, 'error');
      extractBtn.disabled = false;
    }
  });
});

