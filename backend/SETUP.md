# Setup Guide - Next.js Migration

## Quick Start

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up PostgreSQL:**
   - Install PostgreSQL locally or use a cloud service (Supabase, Neon, Railway)
   - Create a database: `createdb job_saver`
   - Or use your cloud provider's connection string

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/job_saver?schema=public"
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Create and run migrations
   npm run db:migrate
   ```

5. **Migrate existing data (if you have SQLite data):**
   ```bash
   # Make sure jobs.db exists in backend directory
   npx tsx prisma/migrate-from-sqlite.ts
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000`

## File Structure

- `app/api/` - Next.js API routes (replaces Express routes)
- `app/` - Next.js pages (will replace HTML files)
- `lib/` - Shared utilities and Prisma client
- `prisma/` - Database schema and migrations
- `public/` - Static files (HTML files temporarily here)

## Next Steps

1. Migrate HTML pages to React components in `app/`
2. Update Chrome extension if needed (API endpoints should be compatible)
3. Add TypeScript types throughout
4. Set up proper error handling and validation

## Troubleshooting

- **Database connection errors**: Check your `DATABASE_URL` in `.env`
- **Prisma errors**: Run `npm run db:generate` after schema changes
- **Port conflicts**: Next.js uses port 3000 by default, change in `package.json` if needed

