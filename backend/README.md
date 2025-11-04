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

### DELETE /api/jobs/:id
Delete a job by ID.

## Data Storage

Jobs are stored in `jobs.json` in the backend directory. This is a simple file-based storage solution. For production, you may want to use a proper database.

## Gallery Page

The gallery page (`/`) displays all saved jobs with:
- Search functionality
- Company filtering
- Salary information
- Job requirements
- Links to original posting and application

