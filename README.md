# Video Converter Tool

A web-based tool for converting videos and audio files, downloading YouTube videos, and more.

## Features

- Convert videos to MP3
- Download and convert YouTube videos
- Convert videos to different formats
- Modern and responsive UI
- Real-time progress tracking
- Audio visualization

## Prerequisites

1. Install Node.js from https://nodejs.org/ (LTS version recommended)
2. Install FFmpeg:
   - Download from https://ffmpeg.org/download.html
   - Add FFmpeg to your system PATH

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open http://localhost:3000 in your browser

## Deployment to Netlify

### Frontend Deployment

1. Create a Netlify account at https://www.netlify.com/
2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Login to Netlify:
```bash
netlify login
```

4. Create netlify.toml in your project root:
```toml
[build]
  publish = "."
  command = "# no build command needed"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
    [headers.values]
    Access-Control-Allow-Origin = "*"
```

5. Deploy to Netlify:
```bash
netlify deploy --prod
```

### Backend Deployment (Netlify Functions)

1. Create a `netlify/functions` directory:
```bash
mkdir -p netlify/functions
```

2. Move server endpoints to serverless functions. Create `netlify/functions/api.js`:
```javascript
const express = require('express');
const serverless = require('serverless-http');
const app = require('../../server'); // Your existing Express app

// Wrap your Express app
module.exports.handler = serverless(app);
```

3. Update package.json:
```json
{
  "dependencies": {
    "serverless-http": "^3.1.1"
    // ... other existing dependencies
  }
}
```

4. Configure Environment Variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add required environment variables:
     - `NODE_VERSION`: Set to `16` or higher
     - Any other environment variables your app needs

### Continuous Deployment

1. Push your code to GitHub
2. In Netlify:
   - Go to Sites > Your site > Site settings > Build & deploy
   - Connect to your GitHub repository
   - Configure build settings:
     - Build command: Leave empty
     - Publish directory: `.`
   - Enable automatic deployments

3. Configure Build Hooks (optional):
   - Go to Site settings > Build & deploy > Build hooks
   - Create a build hook for automatic deployments

### Important Notes

1. Make sure your frontend code uses the correct API URL:
   - In development: `http://localhost:3000`
   - In production: `https://your-netlify-site.netlify.app`

2. Update CORS settings in server.js to allow your Netlify domain

3. FFmpeg Usage:
   - For FFmpeg functionality in Netlify Functions, use `@ffmpeg-installer/ffmpeg`
   - Add to package.json:
   ```json
   {
     "dependencies": {
       "@ffmpeg-installer/ffmpeg": "^1.1.0"
     }
   }
   ```
   - Update FFmpeg import in server.js:
   ```javascript
   const ffmpeg = require('fluent-ffmpeg');
   const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
   ffmpeg.setFfmpegPath(ffmpegPath);
   ```

## API Endpoints

- POST `/convert` - Convert video/audio to MP3
- POST `/youtube` - Download and convert YouTube videos
- POST `/convert-video` - Convert videos between formats

## Technologies Used

- Frontend: HTML5, TailwindCSS, JavaScript
- Backend: Node.js, Express
- Media Processing: FFmpeg
- YouTube Integration: ytdl-core
- Deployment: Netlify, Serverless Functions

## Troubleshooting

1. If builds fail, check:
   - Node.js version in Netlify settings
   - Build logs for specific errors
   - Environment variables are properly set

2. For CORS issues:
   - Verify CORS settings in server.js
   - Check Netlify headers configuration
   - Ensure API URLs are correct

3. For FFmpeg issues:
   - Confirm @ffmpeg-installer/ffmpeg is installed
   - Check FFmpeg path configuration
   - Verify tmp directory permissions in Netlify Functions
