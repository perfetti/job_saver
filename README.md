# Job Saver Chrome Extension

A Chrome extension that extracts job information from web pages using Ollama AI.

## Features

- Extract job information from any webpage
- Uses Ollama for intelligent job data extraction
- Event-based background script architecture
- Clean and modern UI

## Setup

### Prerequisites

1. **Ollama** must be installed and running locally
   - Download from: https://ollama.ai
   - Install and start Ollama
   - Make sure it's running on `http://localhost:11434`

2. **Configure Ollama for Chrome Extensions** (REQUIRED)

   By default, Ollama blocks requests from Chrome extensions. You need to configure Ollama to allow them:

   **Option 1: Allow all Chrome extensions (Easiest)**
   ```bash
   export OLLAMA_ORIGINS=chrome-extension://*
   ollama serve
   ```

   **Option 2: Allow specific extension (More secure)**

   First, get your extension ID:
   1. Go to `chrome://extensions/`
   2. Find "Job Saver Extension"
   3. Copy the ID (looks like: `abcdefghijklmnopqrstuvwxyzabcdef`)

   Then set the environment variable:
   ```bash
   export OLLAMA_ORIGINS=chrome-extension://YOUR_EXTENSION_ID_HERE
   ollama serve
   ```

   **For macOS/Linux (Persistent):**
   Add to your `~/.zshrc` or `~/.bashrc`:
   ```bash
   export OLLAMA_ORIGINS=chrome-extension://*
   ```

   Then restart your terminal and run `ollama serve`.

3. **Model**: The extension uses `llama3.2` by default. You can change this in `background.js`:
   ```javascript
   const model = 'llama3.2'; // Change to your preferred model
   ```

### Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `job_saver_extension` folder
5. The extension should now be installed

### Usage

1. Navigate to any job posting webpage
2. Click the extension icon in the toolbar
3. Click "Extract Job Info" button
4. Wait for the extraction to complete
5. View the extracted job information in JSON format

## Configuration

### Ollama Model

You can change the Ollama model in `background.js`:
```javascript
const model = 'llama3.2'; // Change this
```

### Ollama URL

If Ollama is running on a different port or host, update the URL in `background.js`:
```javascript
const ollamaUrl = 'http://localhost:11434/api/generate';
```

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Popup UI
- `popup.js` - Popup script logic
- `popup.css` - Popup styling
- `content.js` - Content script for page interaction
- `background.js` - Background script with event handlers and Ollama integration

## Event Architecture

The background script uses an event handler mapping:
- Events are handled by functions in the `eventHandlers` object
- New events can be added by adding entries to this object
- Current event: `extractJobInfo`

## Troubleshooting

- **403 Forbidden Error**: This means Ollama is blocking Chrome extension requests. You MUST configure `OLLAMA_ORIGINS` environment variable (see Prerequisites section above).
- **Ollama not responding**: Make sure Ollama is running (`ollama serve`)
- **Model not found**: Make sure the specified model is installed (`ollama pull llama3.2`)
- **Connection errors**: Check that Ollama is running and accessible at `http://localhost:11434`
- **No content extracted**: Make sure you're on a page with actual content

