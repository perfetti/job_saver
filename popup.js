document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  const extractEmailBtn = document.getElementById('extractEmailBtn');
  const modelSelect = document.getElementById('modelSelect');
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

  // Load available models on popup open
  async function loadModels() {
    try {
      modelSelect.disabled = true;
      chrome.runtime.sendMessage({
        event: 'getAvailableModels'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error loading models:', chrome.runtime.lastError);
          modelSelect.innerHTML = '<option value="">Error loading models</option>';
          modelSelect.disabled = false;
          return;
        }

        if (response && response.success && response.models) {
          const models = response.models;
          modelSelect.innerHTML = '';

          if (models.length === 0) {
            modelSelect.innerHTML = '<option value="">No models available</option>';
          } else {
            models.forEach(model => {
              const option = document.createElement('option');
              option.value = model.name;
              option.textContent = model.name;
              modelSelect.appendChild(option);
            });

            // Load saved preference
            chrome.storage.local.get(['selectedModel'], (result) => {
              if (result.selectedModel && models.some(m => m.name === result.selectedModel)) {
                modelSelect.value = result.selectedModel;
              } else if (models.length > 0) {
                // Default to first model if no preference
                modelSelect.value = models[0].name;
                chrome.storage.local.set({ selectedModel: models[0].name });
              }
            });
          }
        } else {
          modelSelect.innerHTML = '<option value="">Error loading models</option>';
        }
        modelSelect.disabled = false;
      });
    } catch (error) {
      console.error('Error loading models:', error);
      modelSelect.innerHTML = '<option value="">Error loading models</option>';
      modelSelect.disabled = false;
    }
  }

  // Save model preference when changed
  modelSelect.addEventListener('change', () => {
    chrome.storage.local.set({ selectedModel: modelSelect.value });
  });

  // Load models when popup opens
  loadModels();

  // Function to open tag modal
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

      // Get selected model
      const selectedModel = modelSelect.value;
      if (!selectedModel) {
        throw new Error('Please select a model');
      }

      // Send content to background script for processing
      chrome.runtime.sendMessage({
        event: 'extractJobInfo',
        data: {
          content: content,
          url: tab.url,
          title: tab.title,
          model: selectedModel
        }
      }, (response) => {
        extractBtn.disabled = false;

        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          setStatus(`Error: ${chrome.runtime.lastError.message}`, 'error');
          return;
        }

        if (response && response.success) {
          const message = response.updated
            ? 'Job updated (duplicate prevented)!'
            : 'Job information extracted successfully!';
          setStatus(message, 'success');
          if (response.data) {
            showResults(response.data);
          }

          // Open tag modal if we have a job ID and it's a new job
          if (response.jobId && !response.updated) {
            setTimeout(() => {
              openTagModal(response.jobId, response.data);
            }, 500);
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

  // Email extraction button
  extractEmailBtn.addEventListener('click', async () => {
    try {
      extractEmailBtn.disabled = true;
      setStatus('Getting email content from Gmail...', 'info');

      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        throw new Error('No active tab found');
      }

      // Check if we're on Gmail
      if (!tab.url.includes('mail.google.com')) {
        throw new Error('Please navigate to a Gmail email page');
      }

      // Extract email content from Gmail
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Try to find email content in Gmail's structure
          const emailContent = {
            subject: '',
            from: '',
            to: '',
            body: '',
            bodyText: '',
            date: ''
          };

          // Try to get subject
          const subjectEl = document.querySelector('h2[data-thread-perm-id]') ||
                           document.querySelector('h2.hP') ||
                           document.querySelector('[data-thread-perm-id] h2');
          if (subjectEl) {
            emailContent.subject = subjectEl.innerText || subjectEl.textContent || '';
          }

          // Try to get from
          const fromEl = document.querySelector('span[email]') ||
                         document.querySelector('.gD') ||
                         document.querySelector('[name="from"]');
          if (fromEl) {
            emailContent.from = fromEl.innerText || fromEl.textContent || fromEl.getAttribute('email') || '';
          }

          // Try to get to
          const toEl = document.querySelector('[name="to"]') ||
                       document.querySelector('.g2');
          if (toEl) {
            emailContent.to = toEl.innerText || toEl.textContent || '';
          }

          // Try to get email body
          const bodyEl = document.querySelector('.a3s') ||
                         document.querySelector('.ii.gt') ||
                         document.querySelector('[role="article"]') ||
                         document.querySelector('.Am.Al.editable');
          if (bodyEl) {
            emailContent.body = bodyEl.innerHTML || '';
            emailContent.bodyText = bodyEl.innerText || bodyEl.textContent || '';
          } else {
            // Fallback to full page text
            emailContent.bodyText = document.body.innerText || document.body.textContent || '';
            emailContent.body = document.body.innerHTML || '';
          }

          // Try to get date
          const dateEl = document.querySelector('.g3') ||
                        document.querySelector('[name="date"]');
          if (dateEl) {
            emailContent.date = dateEl.innerText || dateEl.textContent || '';
          }

          return emailContent;
        }
      });

      if (!results || !results[0] || !results[0].result) {
        throw new Error('Failed to get email content');
      }

      const emailContent = results[0].result;

      if (!emailContent.body && !emailContent.bodyText) {
        throw new Error('Could not find email content. Please make sure you are viewing an email.');
      }

      setStatus('Sending email to server...', 'info');

      // Get selected model
      const selectedModel = modelSelect.value;
      if (!selectedModel) {
        throw new Error('Please select a model');
      }

      // Send email content to background script for processing
      chrome.runtime.sendMessage({
        event: 'extractEmail',
        data: {
          emailContent: emailContent,
          url: tab.url,
          model: selectedModel
        }
      }, (response) => {
        extractEmailBtn.disabled = false;

        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          setStatus(`Error: ${chrome.runtime.lastError.message}`, 'error');
          return;
        }

        if (response && response.success) {
          setStatus('Email extracted successfully! You can assign it to a job in the gallery.', 'success');
          if (response.communicationId) {
            // Open gallery in new tab
            chrome.tabs.create({ url: 'http://localhost:3000' });
          }
        } else {
          setStatus(`Error: ${response?.error || 'Failed to extract email'}`, 'error');
        }
      });

    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`, 'error');
      extractEmailBtn.disabled = false;
    }
  });
});

