const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'jobs.db');
const OLD_JOBS_FILE = path.join(__dirname, 'jobs.json');

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create tables
    db.serialize(() => {
      // Jobs table
      db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT,
          description TEXT,
          salary_lower_bound INTEGER,
          salary_upper_bound INTEGER,
          salary_currency TEXT,
          requirements TEXT,
          applicationUrl TEXT,
          sourceUrl TEXT,
          postedDate TEXT,
          extractedAt TEXT,
          savedAt TEXT NOT NULL,
          excluded INTEGER DEFAULT 0,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating jobs table:', err);
          reject(err);
          return;
        }
      });

      // Applications table
      db.run(`
        CREATE TABLE IF NOT EXISTS applications (
          id TEXT PRIMARY KEY,
          job_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'started',
          started_at TEXT NOT NULL,
          submitted_at TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating applications table:', err);
          reject(err);
          return;
        }
      });

      // Create index for faster lookups
      db.run('CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id)', (err) => {
        if (err) {
          console.error('Error creating index:', err);
        }
      });

      // User profile table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_profile (
          id TEXT PRIMARY KEY DEFAULT 'default',
          linkedin_url TEXT,
          resume_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating user_profile table:', err);
          reject(err);
          return;
        }
      });

      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
}

// Get database connection
function getDb() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
      throw err;
    }
  });
}

// Migrate existing JSON data to database
function migrateFromJson() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(OLD_JOBS_FILE)) {
      console.log('No existing jobs.json file found, skipping migration');
      resolve();
      return;
    }

    try {
      const jobsData = JSON.parse(fs.readFileSync(OLD_JOBS_FILE, 'utf8'));

      if (!Array.isArray(jobsData) || jobsData.length === 0) {
        console.log('No jobs to migrate');
        resolve();
        return;
      }

      const db = getDb();
      let migrated = 0;

      db.serialize(() => {
        const stmt = db.prepare(`
          INSERT OR IGNORE INTO jobs (
            id, title, company, location, description,
            salary_lower_bound, salary_upper_bound, salary_currency,
            requirements, applicationUrl, sourceUrl, postedDate,
            extractedAt, savedAt, excluded, tags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        jobsData.forEach((job) => {
          stmt.run(
            job.id,
            job.title,
            job.company,
            Array.isArray(job.location) ? JSON.stringify(job.location) : job.location,
            job.description,
            job.salary_lower_bound || null,
            job.salary_upper_bound || null,
            job.salary_currency || null,
            Array.isArray(job.requirements) ? JSON.stringify(job.requirements) : job.requirements,
            job.applicationUrl || null,
            job.sourceUrl || null,
            job.postedDate || null,
            job.extractedAt || null,
            job.savedAt || new Date().toISOString(),
            job.excluded === true ? 1 : 0,
            Array.isArray(job.tags) ? JSON.stringify(job.tags) : null
          );
          migrated++;
        });

        stmt.finalize((err) => {
          if (err) {
            console.error('Error during migration:', err);
            reject(err);
          } else {
            console.log(`Migrated ${migrated} jobs from JSON to database`);
            // Optionally backup the old file
            const backupPath = OLD_JOBS_FILE + '.backup';
            fs.copyFileSync(OLD_JOBS_FILE, backupPath);
            console.log(`Backed up old jobs.json to ${backupPath}`);
            resolve();
          }
          db.close();
        });
      });
    } catch (error) {
      console.error('Error reading jobs.json:', error);
      reject(error);
    }
  });
}

// Helper to convert database row to job object
function rowToJob(row) {
  if (!row) return null;

  const job = {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location ? (row.location.startsWith('[') ? JSON.parse(row.location) : row.location) : null,
    description: row.description,
    salary_lower_bound: row.salary_lower_bound,
    salary_upper_bound: row.salary_upper_bound,
    salary_currency: row.salary_currency,
    requirements: row.requirements ? (row.requirements.startsWith('[') ? JSON.parse(row.requirements) : row.requirements) : null,
    applicationUrl: row.applicationUrl,
    sourceUrl: row.sourceUrl,
    postedDate: row.postedDate,
    extractedAt: row.extractedAt,
    savedAt: row.savedAt,
    excluded: row.excluded === 1,
    tags: row.tags ? JSON.parse(row.tags) : []
  };

  return job;
}

// Helper to convert database row to application object
function rowToApplication(row) {
  if (!row) return null;

  return {
    id: row.id,
    job_id: row.job_id,
    status: row.status,
    started_at: row.started_at,
    submitted_at: row.submitted_at,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// Helper to convert database row to user profile object
function rowToUserProfile(row) {
  if (!row) return null;

  return {
    id: row.id,
    linkedin_url: row.linkedin_url,
    resume_data: row.resume_data ? JSON.parse(row.resume_data) : null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

module.exports = {
  initDatabase,
  getDb,
  migrateFromJson,
  rowToJob,
  rowToApplication,
  rowToUserProfile
};

