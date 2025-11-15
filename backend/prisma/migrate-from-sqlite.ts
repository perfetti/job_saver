// Migration script to move data from SQLite to PostgreSQL
// Run with: npx tsx prisma/migrate-from-sqlite.ts

import { PrismaClient } from '@prisma/client'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()
const sqlitePath = path.join(__dirname, '..', 'jobs.db')

async function migrate() {
  if (!fs.existsSync(sqlitePath)) {
    console.log('No SQLite database found. Skipping migration.')
    return
  }

  const db = new sqlite3.Database(sqlitePath)
  const dbGet = promisify(db.get.bind(db))
  const dbAll = promisify(db.all.bind(db))

  try {
    console.log('Starting migration from SQLite to PostgreSQL...')

    // Migrate jobs
    const jobs = await dbAll('SELECT * FROM jobs')
    console.log(`Found ${jobs.length} jobs to migrate`)

    for (const job of jobs) {
      try {
        await prisma.job.upsert({
          where: { id: job.id },
          update: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            salaryLowerBound: job.salary_lower_bound,
            salaryUpperBound: job.salary_upper_bound,
            salaryCurrency: job.salary_currency,
            requirements: job.requirements,
            applicationUrl: job.applicationUrl,
            sourceUrl: job.sourceUrl,
            postedDate: job.postedDate,
            extractedAt: job.extractedAt ? new Date(job.extractedAt) : null,
            savedAt: job.savedAt ? new Date(job.savedAt) : new Date(),
            excluded: job.excluded === 1,
            tags: job.tags,
          },
          create: {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            salaryLowerBound: job.salary_lower_bound,
            salaryUpperBound: job.salary_upper_bound,
            salaryCurrency: job.salary_currency,
            requirements: job.requirements,
            applicationUrl: job.applicationUrl,
            sourceUrl: job.sourceUrl,
            postedDate: job.postedDate,
            extractedAt: job.extractedAt ? new Date(job.extractedAt) : null,
            savedAt: job.savedAt ? new Date(job.savedAt) : new Date(),
            excluded: job.excluded === 1,
            tags: job.tags,
          },
        })
      } catch (error) {
        console.error(`Error migrating job ${job.id}:`, error)
      }
    }

    // Migrate applications
    const applications = await dbAll('SELECT * FROM applications')
    console.log(`Found ${applications.length} applications to migrate`)

    for (const app of applications) {
      try {
        await prisma.application.upsert({
          where: { id: app.id },
          update: {
            jobId: app.job_id,
            status: app.status,
            startedAt: new Date(app.started_at),
            submittedAt: app.submitted_at ? new Date(app.submitted_at) : null,
            notes: app.notes,
          },
          create: {
            id: app.id,
            jobId: app.job_id,
            status: app.status,
            startedAt: new Date(app.started_at),
            submittedAt: app.submitted_at ? new Date(app.submitted_at) : null,
            notes: app.notes,
          },
        })
      } catch (error) {
        console.error(`Error migrating application ${app.id}:`, error)
      }
    }

    // Migrate user profile
    const profile = await dbGet('SELECT * FROM user_profile WHERE id = ?', ['default'])
    if (profile) {
      try {
        await prisma.userProfile.upsert({
          where: { id: 'default' },
          update: {
            linkedinUrl: profile.linkedin_url,
            resumeData: profile.resume_data,
          },
          create: {
            id: 'default',
            linkedinUrl: profile.linkedin_url,
            resumeData: profile.resume_data,
          },
        })
        console.log('Migrated user profile')
      } catch (error) {
        console.error('Error migrating user profile:', error)
      }
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration error:', error)
    throw error
  } finally {
    db.close()
    await prisma.$disconnect()
  }
}

migrate()
  .then(() => {
    console.log('Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })

