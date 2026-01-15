# APPLIED Badge Implementation Approaches

## Overview
Inject an "APPLIED" badge on job pages where the user has already applied.

## Approach 1: Content Script with Real-time API Check

### How it works:
1. **Content script** (`content.js`) runs on every page load
2. On page load, it sends the current URL to the **background script**
3. **Background script** queries the backend API:
   - First, find job by URL (need to create `/api/jobs/by-url?url=...` endpoint)
   - Then check if that job has an application via `/api/applications/job/[jobId]`
4. If application exists, background script sends response back to content script
5. **Content script** injects the badge into the DOM

### Pros:
- ✅ Always up-to-date (real-time check)
- ✅ No caching complexity
- ✅ Works even if user applies from different device/browser
- ✅ Simple state management

### Cons:
- ❌ Network request on every page load (slower)
- ❌ Requires backend API endpoint to find job by URL
- ❌ More API calls = more server load
- ❌ Won't work offline

### Implementation steps:
1. Create backend API endpoint: `GET /api/jobs/by-url?url=...`
2. Add handler in `background.js` to check application status
3. Enhance `content.js` to inject badge when notified
4. Add CSS for badge styling

---

## Approach 2: Background Script with URL Cache

### How it works:
1. **Background script** maintains a cache of job URLs with application status
2. Cache stored in `chrome.storage.local` as: `{ [url]: { hasApplication: true, jobId: '...' } }`
3. When user applies to a job, update the cache
4. **Content script** runs on page load and checks local cache first
5. If URL found in cache with `hasApplication: true`, inject badge immediately
6. Background script periodically syncs cache with backend (or on extension startup)

### Pros:
- ✅ Fast (no network request per page load)
- ✅ Works offline (after initial sync)
- ✅ Less server load
- ✅ Instant badge display

### Cons:
- ❌ Cache can get out of sync
- ❌ More complex state management
- ❌ Need cache invalidation strategy
- ❌ Requires cache sync logic

### Implementation steps:
1. Add cache management functions in `background.js`
2. Sync cache on extension startup/install
3. Update cache when application is created
4. Enhance `content.js` to check cache and inject badge
5. Add periodic cache sync (optional)
6. Add CSS for badge styling

---

## Recommendation

**Approach 1** is recommended for:
- Simplicity and reliability
- Small to medium user base
- When real-time accuracy is important

**Approach 2** is recommended for:
- Better performance/user experience
- Large user base
- When offline support is desired

## Hybrid Approach (Best of Both)

Combine both:
- Check cache first (fast path)
- If not in cache, make API call (slow path)
- Update cache after API call
- Periodic background sync to keep cache fresh




