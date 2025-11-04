const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'jobs.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory

// Initialize jobs file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper function to read jobs from file
function readJobs() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading jobs file:', error);
    return [];
  }
}

// Helper function to write jobs to file
function writeJobs(jobs) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing jobs file:', error);
    return false;
  }
}

// API Routes

// GET /api/jobs - Get all jobs
app.get('/api/jobs', (req, res) => {
  try {
    const jobs = readJobs();
    res.json({ success: true, jobs: jobs, count: jobs.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/jobs - Save a new job
app.post('/api/jobs', (req, res) => {
  try {
    const jobData = req.body;

    // Validate required fields
    if (!jobData.title || !jobData.company) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title and company are required'
      });
    }

    // Add ID and timestamp if not present
    if (!jobData.id) {
      jobData.id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    }

    if (!jobData.savedAt) {
      jobData.savedAt = new Date().toISOString();
    }

    // Read existing jobs
    const jobs = readJobs();

    // Check for duplicates (by sourceUrl if available)
    if (jobData.sourceUrl) {
      const existing = jobs.find(job => job.sourceUrl === jobData.sourceUrl);
      if (existing) {
        // Update existing job instead of creating duplicate
        Object.assign(existing, jobData);
        writeJobs(jobs);
        return res.json({ success: true, job: existing, message: 'Job updated' });
      }
    }

    // Add new job
    jobs.push(jobData);
    writeJobs(jobs);

    res.json({ success: true, job: jobData, message: 'Job saved successfully' });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/jobs/:id - Delete a job
app.delete('/api/jobs/:id', (req, res) => {
  try {
    const jobs = readJobs();
    const filteredJobs = jobs.filter(job => job.id !== req.params.id);

    if (filteredJobs.length === jobs.length) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    writeJobs(filteredJobs);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET / - Serve gallery page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Job Saver Backend running on http://localhost:${PORT}`);
  console.log(`Gallery page available at http://localhost:${PORT}`);
});

