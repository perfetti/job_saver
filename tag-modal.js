// Get job data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');
const jobData = JSON.parse(decodeURIComponent(urlParams.get('data') || '{}'));

// Populate job preview
document.getElementById('jobTitle').textContent = jobData.title || 'Untitled Job';
document.getElementById('jobCompany').textContent = jobData.company || '';
const  currentLocation = Array.isArray(jobData.location)
  ? jobData.location.join(', ')
  : (jobData.location || 'Location not specified');
document.getElementById('jobLocation').textContent = currentLocation;

// Tags management
let tags = [];

const tagsInput = document.getElementById('tagsInput');
const tagsDisplay = document.getElementById('tagsDisplay');
const saveBtn = document.getElementById('saveBtn');
const skipBtn = document.getElementById('skipBtn');
const status = document.getElementById('status');

// Load existing tags if available
if (jobData.tags && Array.isArray(jobData.tags)) {
  tags = [...jobData.tags];
  renderTags();
}

// Handle tag input
tagsInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTag(tagsInput.value.trim());
    tagsInput.value = '';
  }
});

tagsInput.addEventListener('blur', () => {
  const value = tagsInput.value.trim();
  if (value) {
    addTag(value);
    tagsInput.value = '';
  }
});

function addTag(tag) {
  if (tag && !tags.includes(tag.toLowerCase())) {
    tags.push(tag.toLowerCase());
    renderTags();
  }
}

function removeTag(tag) {
  tags = tags.filter(t => t !== tag);
  renderTags();
}

function renderTags() {
  tagsDisplay.innerHTML = '';
  tags.forEach(tag => {
    const tagEl = document.createElement('div');
    tagEl.className = 'tag';
    tagEl.innerHTML = `
      ${tag}
      <span class="tag-remove" data-tag="${tag}">×</span>
    `;
    tagEl.querySelector('.tag-remove').addEventListener('click', () => {
      removeTag(tag);
    });
    tagsDisplay.appendChild(tagEl);
  });
}

// Save tags
saveBtn.addEventListener('click', async () => {
  try {
    saveBtn.disabled = true;
    status.className = 'status';
    status.textContent = 'Saving tags...';

    const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/tags`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: tags })
    });

    if (!response.ok) {
      throw new Error(`Failed to save tags: ${response.statusText}`);
    }

    status.className = 'status success';
    status.textContent = 'Tags saved successfully!';

    setTimeout(() => {
      window.close();
    }, 1000);

  } catch (error) {
    console.error('Error saving tags:', error);
    status.className = 'status error';
    status.textContent = `Error: ${error.message}`;
    saveBtn.disabled = false;
  }
});

// Skip button
skipBtn.addEventListener('click', () => {
  window.close();
});

// Focus input on load
tagsInput.focus();

