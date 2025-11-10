const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { initDatabase, getDb, migrateFromJson, rowToJob, rowToApplication } = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Note: Static files middleware moved to end to ensure API routes are matched first

// Helper function to normalize URL for duplicate detection
function normalizeUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    urlObj.search = '';
    urlObj.hash = '';
    let normalized = urlObj.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase();
  } catch (e) {
    return url.toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '');
  }
}

// Helper to prepare job data for database
function prepareJobData(jobData) {
  return {
    location: Array.isArray(jobData.location) ? JSON.stringify(jobData.location) : jobData.location,
    requirements: Array.isArray(jobData.requirements) ? JSON.stringify(jobData.requirements) : jobData.requirements,
    tags: Array.isArray(jobData.tags) ? JSON.stringify(jobData.tags) : (jobData.tags ? JSON.stringify([jobData.tags]) : null),
    excluded: jobData.excluded === true ? 1 : 0
  };
}

// API Routes

// GET /api/jobs - Get all jobs (with optional application status)
app.get('/api/jobs', (req, res) => {
  const db = getDb();

  db.all(`
    SELECT j.*,
           a.id as application_id,
           a.status as application_status,
           a.started_at as application_started_at,
           a.submitted_at as application_submitted_at
    FROM jobs j
    LEFT JOIN applications a ON j.id = a.job_id
    ORDER BY j.savedAt DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching jobs:', err);
      db.close();
      return res.status(500).json({ success: false, error: err.message });
    }

    const jobs = rows.map(row => {
      const job = rowToJob(row);
      if (row.application_id) {
        job.application = rowToApplication({
          id: row.application_id,
          job_id: row.id,
          status: row.application_status,
          started_at: row.application_started_at,
          submitted_at: row.application_submitted_at,
          notes: null,
          created_at: null,
          updated_at: null
        });
      }
      return job;
    });

    db.close();
    res.json({ success: true, jobs: jobs, count: jobs.length });
  });
});

// GET /api/jobs/:id - Get a single job
app.get('/api/jobs/:id', (req, res) => {
  const db = getDb();

  db.get(`
    SELECT j.*,
           a.id as application_id,
           a.status as application_status,
           a.started_at as application_started_at,
           a.submitted_at as application_submitted_at,
           a.notes as application_notes
    FROM jobs j
    LEFT JOIN applications a ON j.id = a.job_id
    WHERE j.id = ?
  `, [req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching job:', err);
      db.close();
      return res.status(500).json({ success: false, error: err.message });
    }

    if (!row) {
      db.close();
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const job = rowToJob(row);
    if (row.application_id) {
      job.application = rowToApplication({
        id: row.application_id,
        job_id: row.id,
        status: row.application_status,
        started_at: row.application_started_at,
        submitted_at: row.application_submitted_at,
        notes: row.application_notes,
        created_at: null,
        updated_at: null
      });
    }

    db.close();
    res.json({ success: true, job: job });
  });
});

// POST /api/jobs - Save a new job
app.post('/api/jobs', (req, res) => {
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

  const db = getDb();
  const prepared = prepareJobData(jobData);

  // Check for duplicates by sourceUrl
  const normalizedSourceUrl = normalizeUrl(jobData.sourceUrl);

  function insertOrUpdateJob(existingJob) {
    if (existingJob) {
      // Update existing job
      db.run(`
        UPDATE jobs SET
          title = ?, company = ?, location = ?, description = ?,
          salary_lower_bound = ?, salary_upper_bound = ?, salary_currency = ?,
          requirements = ?, applicationUrl = ?, sourceUrl = ?, postedDate = ?,
          extractedAt = ?, excluded = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        jobData.title, jobData.company, prepared.location, jobData.description,
        jobData.salary_lower_bound || null, jobData.salary_upper_bound || null, jobData.salary_currency || null,
        prepared.requirements, jobData.applicationUrl || null, jobData.sourceUrl || null, jobData.postedDate || null,
        new Date().toISOString(), prepared.excluded, prepared.tags, existingJob.id
      ], function(err) {
        if (err) {
          console.error('Error updating job:', err);
          db.close();
          return res.status(500).json({ success: false, error: err.message });
        }

        db.get('SELECT * FROM jobs WHERE id = ?', [existingJob.id], (err, updatedRow) => {
          db.close();
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          res.json({ success: true, job: rowToJob(updatedRow), message: 'Job updated (duplicate prevented)', updated: true });
        });
      });
    } else {
      // Insert new job
      db.run(`
        INSERT INTO jobs (
          id, title, company, location, description,
          salary_lower_bound, salary_upper_bound, salary_currency,
          requirements, applicationUrl, sourceUrl, postedDate,
          extractedAt, savedAt, excluded, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        jobData.id, jobData.title, jobData.company, prepared.location, jobData.description,
        jobData.salary_lower_bound || null, jobData.salary_upper_bound || null, jobData.salary_currency || null,
        prepared.requirements, jobData.applicationUrl || null, jobData.sourceUrl || null, jobData.postedDate || null,
        jobData.extractedAt || new Date().toISOString(), jobData.savedAt, prepared.excluded, prepared.tags
      ], function(err) {
        if (err) {
          console.error('Error saving job:', err);
          db.close();
          return res.status(500).json({ success: false, error: err.message });
        }

        db.get('SELECT * FROM jobs WHERE id = ?', [jobData.id], (err, newRow) => {
          db.close();
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          res.json({ success: true, job: rowToJob(newRow), message: 'Job saved successfully' });
        });
      });
    }
  }

  if (normalizedSourceUrl) {
    // Try to find existing job by normalized URL
    db.get('SELECT * FROM jobs WHERE sourceUrl IS NOT NULL AND LOWER(TRIM(REPLACE(REPLACE(REPLACE(sourceUrl, "?", ""), "#", ""), "/", ""))) LIKE ?',
      [`%${normalizedSourceUrl.replace(/\/$/, '')}%`], (err, row) => {
        if (err) {
          console.error('Error checking for duplicates:', err);
          // Continue with insert if check fails
          insertOrUpdateJob(null);
        } else {
          insertOrUpdateJob(row);
        }
      });
  } else {
    // No sourceUrl to check, just insert
    insertOrUpdateJob(null);
  }
});

// PUT /api/jobs/:id - Update a job
app.put('/api/jobs/:id', (req, res) => {
  const jobData = req.body;

  // Validate required fields
  if (!jobData.title || !jobData.company) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: title and company are required'
    });
  }

  const db = getDb();
  const prepared = prepareJobData(jobData);

  db.run(`
    UPDATE jobs SET
      title = ?, company = ?, location = ?, description = ?,
      salary_lower_bound = ?, salary_upper_bound = ?, salary_currency = ?,
      requirements = ?, applicationUrl = ?, sourceUrl = ?, postedDate = ?,
      extractedAt = ?, excluded = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    jobData.title, jobData.company, prepared.location, jobData.description,
    jobData.salary_lower_bound || null, jobData.salary_upper_bound || null, jobData.salary_currency || null,
    prepared.requirements, jobData.applicationUrl || null, jobData.sourceUrl || null, jobData.postedDate || null,
    new Date().toISOString(), prepared.excluded, prepared.tags, req.params.id
  ], function(err) {
    if (err) {
      console.error('Error updating job:', err);
      db.close();
      return res.status(500).json({ success: false, error: err.message });
    }

    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id], (err, row) => {
      db.close();
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, job: rowToJob(row), message: 'Job updated successfully' });
    });
  });
});

// PUT /api/jobs/:id/tags - Update tags for a job
app.put('/api/jobs/:id/tags', (req, res) => {
  const db = getDb();
  const tags = req.body.tags || [];

  db.run('UPDATE jobs SET tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(tags), req.params.id], function(err) {
      if (err) {
        console.error('Error updating tags:', err);
        db.close();
        return res.status(500).json({ success: false, error: err.message });
      }

      if (this.changes === 0) {
        db.close();
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id], (err, row) => {
        db.close();
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, job: rowToJob(row), message: 'Tags updated successfully' });
      });
    });
});

// DELETE /api/jobs/:id - Delete a job
app.delete('/api/jobs/:id', (req, res) => {
  const db = getDb();

  db.run('DELETE FROM jobs WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting job:', err);
      db.close();
      return res.status(500).json({ success: false, error: err.message });
    }

    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    db.close();
    res.json({ success: true, message: 'Job deleted successfully' });
  });
});

// Application Routes

// POST /api/applications - Start a new application
app.post('/api/applications', (req, res) => {
  const { job_id, status, notes } = req.body;

  if (!job_id) {
    return res.status(400).json({
      success: false,
      error: 'job_id is required'
    });
  }

  const db = getDb();

  // Check if job exists
  db.get('SELECT id FROM jobs WHERE id = ?', [job_id], (err, job) => {
    if (err) {
      console.error('Error checking job:', err);
      db.close();
      return res.status(500).json({ success: false, error: err.message });
    }

    if (!job) {
      db.close();
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Check if application already exists
    db.get('SELECT * FROM applications WHERE job_id = ?', [job_id], (err, existing) => {
      if (err) {
        console.error('Error checking existing application:', err);
        db.close();
        return res.status(500).json({ success: false, error: err.message });
      }

      if (existing) {
        db.close();
        return res.status(400).json({
          success: false,
          error: 'Application already exists for this job',
          application: rowToApplication(existing)
        });
      }

      // Create new application
      const applicationId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
      const startedAt = new Date().toISOString();

      db.run(`
        INSERT INTO applications (id, job_id, status, started_at, notes)
        VALUES (?, ?, ?, ?, ?)
      `, [applicationId, job_id, status || 'started', startedAt, notes || null], function(err) {
        if (err) {
          console.error('Error creating application:', err);
          db.close();
          return res.status(500).json({ success: false, error: err.message });
        }

        db.get('SELECT * FROM applications WHERE id = ?', [applicationId], (err, row) => {
          db.close();
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          res.json({ success: true, application: rowToApplication(row), message: 'Application started successfully' });
        });
      });
    });
  });
});

// GET /api/applications/:job_id - Get application for a job
app.get('/api/applications/:job_id', (req, res) => {
  const db = getDb();

  db.get('SELECT * FROM applications WHERE job_id = ?', [req.params.job_id], (err, row) => {
    db.close();
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    if (!row) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, application: rowToApplication(row) });
  });
});

// PUT /api/applications/:id - Update an application
app.put('/api/applications/:id', (req, res) => {
  const { status, submitted_at, notes } = req.body;
  const db = getDb();

  db.run(`
    UPDATE applications
    SET status = ?, submitted_at = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [status, submitted_at || null, notes || null, req.params.id], function(err) {
    if (err) {
      console.error('Error updating application:', err);
      db.close();
      return res.status(500).json({ success: false, error: err.message });
    }

    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    db.get('SELECT * FROM applications WHERE id = ?', [req.params.id], (err, row) => {
      db.close();
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, application: rowToApplication(row), message: 'Application updated successfully' });
    });
  });
});

// DELETE /api/applications/:id - Delete an application
app.delete('/api/applications/:id', (req, res) => {
  const db = getDb();

  db.run('DELETE FROM applications WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting application:', err);
      db.close();
      return res.status(500).json({ success: false, error: err.message });
    }

    if (this.changes === 0) {
      db.close();
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    db.close();
    res.json({ success: true, message: 'Application deleted successfully' });
  });
});

// Serve static files from public directory (after API routes)
app.use(express.static(path.join(__dirname, 'public')));

// GET / - Serve gallery page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    await migrateFromJson();

    app.listen(PORT, () => {
      console.log(`Job Saver Backend running on http://localhost:${PORT}`);
      console.log(`Gallery page available at http://localhost:${PORT}`);
      console.log(`Database: ${path.join(__dirname, 'jobs.db')}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
