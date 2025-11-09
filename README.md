# Job Saver Chrome Extension

A Chrome extension that extracts job information from web pages using Ollama AI.

## Features

- Extract job information from any webpage
- Uses Ollama for intelligent job data extraction
- Event-based background script architecture
- Clean and modern UI
- Automatic saving to backend server
- Gallery page to view all saved jobs
- Search and filter functionality
- Tag jobs for better organization
- Keyboard shortcut support (Ctrl+Shift+Space / MacCtrl+Shift+Space)
- Context menu integration

## Setup

Follow these steps in order for the easiest setup:

### Step 1: Install Ollama

1. Download and install Ollama from: https://ollama.ai
2. Pull the required model:
   ```bash
   ollama pull llama3.1:latest
   ```
   (You can use other models too - see Configuration section)

### Step 2: Configure Ollama for Chrome Extensions (REQUIRED)

By default, Ollama blocks requests from Chrome extensions. You **must** configure Ollama to allow them:

**Option 1: Allow all Chrome extensions (Easiest)**

For macOS/Linux, add to your `~/.zshrc` or `~/.bashrc`:
```bash
export OLLAMA_ORIGINS=chrome-extension://*
```

Then restart your terminal and run:
```bash
ollama serve
```

**Option 2: Allow specific extension (More secure)**

1. First, install the extension (see Step 4 below) to get your extension ID
2. Go to `chrome://extensions/`
3. Find "Job Saver Extension" and copy the ID (looks like: `abcdefghijklmnopqrstuvwxyzabcdef`)
4. Add to your `~/.zshrc` or `~/.bashrc`:
   ```bash
   export OLLAMA_ORIGINS=chrome-extension://YOUR_EXTENSION_ID_HERE
   ```
5. Restart your terminal and run `ollama serve`

**Important:** After setting the environment variable, you must restart Ollama (stop it with Ctrl+C and run `ollama serve` again) for the changes to take effect.

### Step 3: Set Up Backend Server (REQUIRED for saving jobs)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`
   - Gallery page: `http://localhost:3000`
   - API endpoint: `http://localhost:3000/api/jobs`

   **Note:** Keep this server running while using the extension. For development with auto-reload, use `npm run dev` instead.

### Step 4: Install the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the root `job_saver_extension` folder (the one containing `manifest.json`)
5. The extension should now be installed

**Note:** If you chose Option 2 in Step 2, you can now get your extension ID from `chrome://extensions/` and update your `OLLAMA_ORIGINS` environment variable.

### Usage

There are three ways to extract job information:

1. **Via Extension Popup:**
   - Navigate to any job posting webpage
   - Click the extension icon in the toolbar
   - Click "Extract Job Info" button
   - Wait for the extraction to complete
   - View the extracted job information

2. **Via Keyboard Shortcut:**
   - Navigate to any job posting webpage
   - Press `Ctrl+Shift+Space` (Windows/Linux) or `MacCtrl+Shift+Space` (Mac)
   - The job will be extracted and saved automatically
   - A notification will appear when complete

3. **Via Context Menu:**
   - Right-click on any job posting webpage
   - Select "Extract Job Information" from the context menu
   - The job will be extracted and saved automatically

After extraction, if it's a new job, a tag modal will automatically open where you can add tags to organize your jobs.

## Configuration

### Ollama Model

The extension uses `llama3.1:latest` by default. You can:
- Select a different model from the dropdown in the extension popup
- Make sure the model is installed: `ollama pull <model-name>`

### Ollama URL

If Ollama is running on a different port or host, update the URL in `background.js`:
```javascript
const ollamaUrl = 'http://localhost:11434/api/generate';
```

## File Structure

### Extension Files
- `manifest.json` - Extension configuration
- `popup.html` - Popup UI
- `popup.js` - Popup script logic
- `popup.css` - Popup styling
- `content.js` - Content script for page interaction
- `background.js` - Background script with event handlers and Ollama integration

### Backend Files
- `backend/server.js` - Express server with API endpoints
- `backend/public/gallery.html` - Gallery page to view saved jobs
- `backend/package.json` - Backend dependencies
- `backend/jobs.json` - Data storage (created automatically)

## Event Architecture

The background script uses an event handler mapping:
- Events are handled by functions in the `eventHandlers` object
- New events can be added by adding entries to this object
- Current event: `extractJobInfo`

## Troubleshooting

- **403 Forbidden Error**: This means Ollama is blocking Chrome extension requests. You MUST configure `OLLAMA_ORIGINS` environment variable (see Step 2 in Setup). After setting it, restart Ollama (`ollama serve`).
- **Ollama not responding**: Make sure Ollama is running (`ollama serve`). Check that it's accessible at `http://localhost:11434`.
- **Model not found**: Make sure the specified model is installed (`ollama pull llama3.1:latest` or your chosen model).
- **Connection errors**:
  - Check that Ollama is running and accessible at `http://localhost:11434`
  - Verify the `OLLAMA_ORIGINS` environment variable is set correctly
  - Make sure you restarted Ollama after setting the environment variable
- **Backend connection errors**: Make sure the backend server is running (`npm start` in the `backend` directory).
- **No content extracted**: Make sure you're on a page with actual content. Some pages (like Chrome internal pages) cannot be accessed.
- **Jobs not saving**: Ensure the backend server is running on `http://localhost:3000`.

