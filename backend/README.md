# Job Saver Backend - Next.js with TypeScript

Backend server for storing and displaying saved job postings from the Job Saver Chrome Extension.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Ollama** - AI for job and profile extraction

## Setup

### Prerequisites

1. **PostgreSQL** must be installed and running
   - Install from: https://www.postgresql.org/download/
   - Create a database: `createdb job_saver`
   - Or use a cloud provider like Supabase, Neon, or Railway

2. **Ollama** must be installed and running locally
   - Download from: https://ollama.ai
   - Install and start Ollama
   - Make sure it's running on `http://localhost:11434`
   - See main README for Chrome extension configuration

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/job_saver?schema=public"
```

3. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate
```

4. (Optional) Migrate existing data from SQLite:
   - If you have existing data in `jobs.db`, you can create a migration script
   - Or manually export/import data

5. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`
- Gallery page: `http://localhost:3000`
- API endpoints: `http://localhost:3000/api/*`

## Database Management

### Prisma Studio
View and edit data in a GUI:
```bash
npm run db:studio
```

### Create a new migration
```bash
npm run db:migrate
```

### Reset database (⚠️ deletes all data)
```bash
npx prisma migrate reset
```

## API Endpoints

All API routes are in `app/api/`:

- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Save a new job
- `GET /api/jobs/:id` - Get a single job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job
- `PUT /api/jobs/:id/tags` - Update tags

- `POST /api/applications` - Start a new application
- `GET /api/applications/:id` - Get application by ID
- `GET /api/applications/job/:jobId` - Get application for a job
- `PUT /api/applications/:id` - Update an application
- `DELETE /api/applications/:id` - Delete an application

- `GET /api/profile` - Get user profile
- `POST /api/profile/linkedin` - Save LinkedIn URL and extract profile
- `PUT /api/profile/resume` - Update resume data

## Project Structure

```
backend/
├── app/
│   ├── api/              # API routes
│   ├── (pages)/          # Next.js pages (gallery, applications, etc.)
│   └── layout.tsx        # Root layout
├── lib/
│   ├── prisma.ts         # Prisma client
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── public/                # Static files (if needed)
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Migration from Express/SQLite

If migrating from the old Express/SQLite backend:

1. Export your data from SQLite (if needed)
2. Set up PostgreSQL and run migrations
3. Import data if you have exports
4. Update Chrome extension to point to new backend URL (if different port)

The API endpoints remain the same, so the Chrome extension should work without changes if running on the same port.
