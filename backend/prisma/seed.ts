import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JobJson {
  id: string;
  title: string;
  company: string;
  location?: string | string[];
  description?: string;
  salary_lower_bound?: number;
  salary_upper_bound?: number;
  salary_currency?: string;
  requirements?: string | string[];
  applicationUrl?: string | null;
  sourceUrl?: string | null;
  postedDate?: string | null;
  extractedAt?: string;
  savedAt?: string;
  tags?: string[];
  excluded?: boolean;
}

async function main() {
  console.log('Starting seed...');

  const jobsFilePath = path.join(__dirname, '..', 'jobs.json');

  if (!fs.existsSync(jobsFilePath)) {
    console.error(`jobs.json not found at ${jobsFilePath}`);
    process.exit(1);
  }

  const jobsData: JobJson[] = JSON.parse(fs.readFileSync(jobsFilePath, 'utf-8'));
  console.log(`Found ${jobsData.length} jobs in jobs.json`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const jobData of jobsData) {
    try {
      // Transform location array to string
      const location = Array.isArray(jobData.location)
        ? jobData.location.join(', ')
        : (jobData.location || null);

      // Transform requirements array to JSON string
      const requirements = Array.isArray(jobData.requirements)
        ? JSON.stringify(jobData.requirements)
        : (typeof jobData.requirements === 'string' ? jobData.requirements : null);

      // Transform tags array to JSON string
      const tags = Array.isArray(jobData.tags) && jobData.tags.length > 0
        ? JSON.stringify(jobData.tags)
        : null;

      // Parse dates
      const extractedAt = jobData.extractedAt ? new Date(jobData.extractedAt) : null;
      const savedAt = jobData.savedAt ? new Date(jobData.savedAt) : new Date();

      // Use existing ID from JSON
      if (!jobData.id) {
        console.warn(`Skipping job without ID: ${jobData.title} at ${jobData.company}`);
        skipped++;
        continue;
      }

      const jobId = jobData.id;

      // Check if job exists
      const existingJob = await prisma.job.findUnique({
        where: { id: jobId },
      });

      const jobDataToSave = {
        title: jobData.title,
        company: jobData.company,
        location: location,
        description: jobData.description || null,
        salaryLowerBound: jobData.salary_lower_bound || null,
        salaryUpperBound: jobData.salary_upper_bound || null,
        salaryCurrency: jobData.salary_currency || null,
        requirements: requirements,
        applicationUrl: jobData.applicationUrl || null,
        sourceUrl: jobData.sourceUrl || null,
        postedDate: jobData.postedDate || null,
        extractedAt: extractedAt,
        savedAt: savedAt,
        excluded: jobData.excluded || false,
        tags: tags,
      };

      if (existingJob) {
        // Update existing job
        await prisma.job.update({
          where: { id: jobId },
          data: jobDataToSave,
        });
        updated++;
      } else {
        // Create new job
        await prisma.job.create({
          data: {
            id: jobId,
            ...jobDataToSave,
          },
        });
        created++;
      }
    } catch (error) {
      console.error(`Error processing job ${jobData.id || 'unknown'}:`, error);
      skipped++;
    }
  }

  console.log(`\nSeed completed!`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

