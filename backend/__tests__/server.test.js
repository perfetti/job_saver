const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Mock the db module before requiring server
jest.mock('../db', () => {
  const mockDb = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
    close: jest.fn()
  };

  return {
    initDatabase: jest.fn(() => Promise.resolve()),
    getDb: jest.fn(() => mockDb),
    migrateFromJson: jest.fn(() => Promise.resolve()),
    rowToJob: jest.fn((row) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location ? JSON.parse(row.location) : row.location,
      description: row.description,
      salary_lower_bound: row.salary_lower_bound,
      salary_upper_bound: row.salary_upper_bound,
      salary_currency: row.salary_currency,
      requirements: row.requirements ? JSON.parse(row.requirements) : row.requirements,
      applicationUrl: row.applicationUrl,
      sourceUrl: row.sourceUrl,
      postedDate: row.postedDate,
      extractedAt: row.extractedAt,
      savedAt: row.savedAt,
      excluded: row.excluded === 1,
      tags: row.tags ? JSON.parse(row.tags) : []
    })),
    rowToApplication: jest.fn((row) => ({
      id: row.id,
      job_id: row.job_id,
      status: row.status,
      started_at: row.started_at,
      submitted_at: row.submitted_at,
      notes: row.notes
    })),
    rowToUserProfile: jest.fn((row) => ({
      id: row.id,
      linkedin_url: row.linkedin_url,
      resume_data: row.resume_data ? JSON.parse(row.resume_data) : null
    }))
  };
});

// Import server after mocking
let app;
beforeAll(() => {
  // Clear module cache to ensure fresh import
  delete require.cache[require.resolve('../server')];
  app = require('../server');
});

const { getDb } = require('../db');

describe('Server API Tests', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = getDb();
    jest.clearAllMocks();
  });

  describe('GET /api/jobs', () => {
    it('should return all jobs', (done) => {
      const mockJobs = [
        {
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: '["San Francisco, CA"]',
          description: 'Great job',
          salary_lower_bound: 100000,
          salary_upper_bound: 150000,
          salary_currency: 'USD',
          requirements: '["5+ years experience"]',
          applicationUrl: null,
          sourceUrl: 'https://example.com/job/1',
          postedDate: '2025-01-01',
          extractedAt: '2025-01-01T00:00:00.000Z',
          savedAt: '2025-01-01T00:00:00.000Z',
          excluded: 0,
          tags: null,
          application_id: null
        }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockJobs);
      });

      request(app)
        .get('/api/jobs')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.jobs).toHaveLength(1);
          expect(res.body.jobs[0].title).toBe('Software Engineer');
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });

    it('should handle database errors', (done) => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      request(app)
        .get('/api/jobs')
        .expect(500)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(false);
          expect(res.body.error).toBeDefined();
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return a single job', (done) => {
      const mockJob = {
        id: '1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: '["San Francisco, CA"]',
        description: 'Great job',
        salary_lower_bound: 100000,
        salary_upper_bound: 150000,
        salary_currency: 'USD',
        requirements: '["5+ years experience"]',
        applicationUrl: null,
        sourceUrl: 'https://example.com/job/1',
        postedDate: '2025-01-01',
        extractedAt: '2025-01-01T00:00:00.000Z',
        savedAt: '2025-01-01T00:00:00.000Z',
        excluded: 0,
        tags: null,
        application_id: null
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockJob);
      });

      request(app)
        .get('/api/jobs/1')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.job.id).toBe('1');
          expect(res.body.job.title).toBe('Software Engineer');
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });

    it('should return 404 for non-existent job', (done) => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      request(app)
        .get('/api/jobs/999')
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(false);
          expect(res.body.error).toContain('not found');
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('POST /api/jobs', () => {
    it('should create a new job', (done) => {
      const newJob = {
        title: 'Senior Developer',
        company: 'Startup Inc',
        location: ['Remote'],
        description: 'Amazing opportunity',
        salary_lower_bound: 120000,
        salary_upper_bound: 180000,
        salary_currency: 'USD',
        requirements: ['10+ years', 'Node.js'],
        sourceUrl: 'https://example.com/job/2',
        tags: ['remote', 'senior']
      };

      // Mock duplicate check (no existing job)
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      // Mock insert
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.changes = 1;
        this.lastID = 1;
        callback(null);
      });

      // Mock get after insert
      const insertedJob = {
        id: 'test-id-123',
        title: newJob.title,
        company: newJob.company,
        location: JSON.stringify(newJob.location),
        description: newJob.description,
        salary_lower_bound: newJob.salary_lower_bound,
        salary_upper_bound: newJob.salary_upper_bound,
        salary_currency: newJob.salary_currency,
        requirements: JSON.stringify(newJob.requirements),
        sourceUrl: newJob.sourceUrl,
        tags: JSON.stringify(newJob.tags),
        excluded: 0,
        savedAt: new Date().toISOString()
      };

      // First call is for duplicate check, second is for getting inserted job
      mockDb.get
        .mockImplementationOnce((query, params, callback) => {
          callback(null, null); // No duplicate
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, insertedJob); // Return inserted job
        });

      request(app)
        .post('/api/jobs')
        .send(newJob)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.job.title).toBe(newJob.title);
          expect(res.body.message).toContain('saved');
          done();
        });
    });

    it('should use default values for missing required fields', (done) => {
      const invalidJob = {
        title: 'Developer'
        // Missing company
      };

      // Mock duplicate check (no existing job)
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      // Mock insert
      mockDb.run.mockImplementation(function(query, params, callback) {
        // Set this.changes for the callback context
        this.changes = 1;
        this.lastID = 1;
        callback(null);
      });

      // Mock get after insert
      const insertedJob = {
        id: 'test-id-123',
        title: 'Developer',
        company: 'Company Not Found', // Default value
        location: null,
        description: null,
        salary_lower_bound: null,
        salary_upper_bound: null,
        salary_currency: null,
        requirements: null,
        sourceUrl: null,
        tags: null,
        excluded: 0,
        savedAt: new Date().toISOString()
      };

      mockDb.get
        .mockImplementationOnce((query, params, callback) => {
          callback(null, null); // No duplicate
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, insertedJob); // Return inserted job
        });

      request(app)
        .post('/api/jobs')
        .send(invalidJob)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.job.company).toBe('Company Not Found');
          done();
        });
    });

    it('should update existing job if duplicate URL found', (done) => {
      const jobData = {
        title: 'Updated Title',
        company: 'Updated Company',
        sourceUrl: 'https://example.com/job/1',
        tags: ['updated']
      };

      const existingJob = {
        id: 'existing-id',
        title: 'Old Title',
        company: 'Old Company',
        sourceUrl: 'https://example.com/job/1'
      };

      // Mock duplicate check (finds existing job)
      mockDb.get.mockImplementation((query, params, callback) => {
        if (query.includes('SELECT * FROM jobs WHERE')) {
          callback(null, existingJob);
        } else {
          // Return updated job
          callback(null, {
            ...existingJob,
            title: jobData.title,
            company: jobData.company,
            tags: JSON.stringify(jobData.tags)
          });
        }
      });

      // Mock update
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.changes = 1;
        callback(null);
      });

      request(app)
        .post('/api/jobs')
        .send(jobData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.updated).toBe(true);
          expect(res.body.message).toContain('updated');
          done();
        });
    });
  });

  describe('PUT /api/jobs/:id', () => {
    it('should update an existing job', (done) => {
      const updateData = {
        title: 'Updated Title',
        company: 'Updated Company',
        location: ['New York, NY'],
        description: 'Updated description'
      };

      // Mock update
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.changes = 1;
        callback(null);
      });

      // Mock get after update
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, {
          id: '1',
          ...updateData,
          location: JSON.stringify(updateData.location),
          salary_lower_bound: null,
          salary_upper_bound: null,
          excluded: 0
        });
      });

      request(app)
        .put('/api/jobs/1')
        .send(updateData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.job.title).toBe(updateData.title);
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });

    it('should return 404 for non-existent job', (done) => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        // Set this.changes to 0 to simulate no rows updated
        this.changes = 0;
        callback(null);
      });

      request(app)
        .put('/api/jobs/999')
        .send({ title: 'Test', company: 'Test' })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(false);
          expect(res.body.error).toContain('not found');
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('PUT /api/jobs/:id/tags', () => {
    it('should update job tags', (done) => {
      const tags = ['remote', 'full-time', 'senior'];

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.changes = 1;
        callback(null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, {
          id: '1',
          title: 'Test Job',
          company: 'Test Company',
          tags: JSON.stringify(tags)
        });
      });

      request(app)
        .put('/api/jobs/1/tags')
        .send({ tags })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.job.tags).toEqual(tags);
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('should delete a job', (done) => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.changes = 1;
        callback(null);
      });

      request(app)
        .delete('/api/jobs/1')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('deleted');
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });

    it('should return 404 for non-existent job', (done) => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        // Set this.changes to 0 to simulate no rows deleted
        this.changes = 0;
        callback(null);
      });

      request(app)
        .delete('/api/jobs/999')
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(false);
          expect(res.body.error).toContain('not found');
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('POST /api/applications', () => {
    it('should create a new application', (done) => {
      const applicationData = {
        job_id: '1',
        status: 'started',
        notes: 'Applied via website'
      };

      // Mock job exists check
      mockDb.get
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { id: '1' }); // Job exists
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, null); // No existing application
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, {
            id: 'app-1',
            job_id: '1',
            status: 'started',
            started_at: new Date().toISOString(),
            notes: 'Applied via website'
          });
        });

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.changes = 1;
        this.lastID = 1;
        callback(null);
      });

      request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.application.job_id).toBe('1');
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });

    it('should return 404 if job does not exist', (done) => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null); // Job doesn't exist
      });

      request(app)
        .post('/api/applications')
        .send({ job_id: '999' })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(false);
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });
  });

  describe('GET /api/profile', () => {
    it('should return user profile if exists', (done) => {
      const mockProfile = {
        id: 'default',
        linkedin_url: 'https://linkedin.com/in/test',
        resume_data: JSON.stringify({ name: 'Test User' })
      };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockProfile);
      });

      request(app)
        .get('/api/profile')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.profile.linkedin_url).toBe(mockProfile.linkedin_url);
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });

    it('should return null if profile does not exist', (done) => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      request(app)
        .get('/api/profile')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.success).toBe(true);
          expect(res.body.profile).toBeNull();
          expect(mockDb.close).toHaveBeenCalled();
          done();
        });
    });
  });
});

