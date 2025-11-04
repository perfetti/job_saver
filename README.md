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

2. **Model**: The extension uses `llama3.2` by default. You can change this in `background.js`:
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

- **Ollama not responding**: Make sure Ollama is running (`ollama serve`)
- **Model not found**: Make sure the specified model is installed (`ollama pull llama3.2`)
- **CORS errors**: Check that Ollama allows requests from the extension
- **No content extracted**: Make sure you're on a page with actual content

