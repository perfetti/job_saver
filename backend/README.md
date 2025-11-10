# Job Saver Backend

Backend server for storing and displaying saved job postings from the Job Saver Chrome Extension.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

3. The server will run on `http://localhost:3000`
   - Gallery page: `http://localhost:3000`
   - API endpoint: `http://localhost:3000/api/jobs`

**Note:** On first run, the server will:
- Create a SQLite database (`jobs.db`)
- Automatically migrate any existing `jobs.json` data to the database
- Create a backup of `jobs.json` as `jobs.json.backup`

## API Endpoints

### GET /api/jobs
Get all saved jobs.

**Response:**
```json
{
  "success": true,
  "jobs": [...],
  "count": 10
}
```

### POST /api/jobs
Save a new job.

**Request Body:**
```json
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location",
  "description": "Job description",
  "salary_lower_bound": 126000,
  "salary_upper_bound": 255000,
  "salary_currency": "USD",
  "requirements": ["Requirement 1", "Requirement 2"],
  "applicationUrl": "https://...",
  "postedDate": "2025-10-29",
  "sourceUrl": "https://..."
}
```

### PUT /api/jobs/:id
Update a job by ID.

### DELETE /api/jobs/:id
Delete a job by ID.

## Application Tracking API

### POST /api/applications
Start a new application for a job.

**Request Body:**
```json
{
  "job_id": "job-id-here",
  "status": "started",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "application-id",
    "job_id": "job-id",
    "status": "started",
    "started_at": "2025-01-15T10:00:00.000Z",
    "submitted_at": null,
    "notes": null
  }
}
```

### GET /api/applications/:job_id
Get application for a specific job.

### PUT /api/applications/:id
Update an application (status, submitted date, notes).

**Request Body:**
```json
{
  "status": "submitted",
  "submitted_at": "2025-01-20T10:00:00.000Z",
  "notes": "Submitted via company website"
}
```

### DELETE /api/applications/:id
Delete an application.

## Data Storage

Jobs and applications are stored in a **SQLite database** (`jobs.db`). The database includes:

- **jobs table**: All job postings with full details
- **applications table**: Application tracking linked to jobs via foreign key

### Migration

On first startup, the server automatically:
1. Creates the database schema
2. Migrates existing `jobs.json` data (if present)
3. Creates a backup of the original JSON file

The old `jobs.json` file is preserved as `jobs.json.backup` for safety.

## Gallery Page

The gallery page (`/`) displays all saved jobs with:
- Search functionality
- Company filtering
- Tag filtering
- List and Hierarchy views
- Application status tracking
- **Start Application** button for jobs without applications
- Application status badges (Started, Submitted, Rejected, Accepted)
- Edit functionality for all job fields
- Exclusion tracking with counts

