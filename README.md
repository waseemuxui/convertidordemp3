# Video Converter API

A serverless API for converting videos to MP3 and downloading YouTube videos.

## API Endpoints

Base URL: `https://your-netlify-site.netlify.app/.netlify/functions/server`

### Convert Video to MP3
```http
POST /convert
Content-Type: multipart/form-data

file: <video_file>
bitrate: "192k" (optional)
```

### Download YouTube Video
```http
POST /youtube
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=...",
  "format": "mp3",
  "bitrate": "192k"
}
```

## Response Format

All successful responses will include:
```json
{
  "success": true,
  "file": "<base64_encoded_file>",
  "filename": "output_filename.mp3"
}
```

## Deployment

1. Connect your GitHub repository to Netlify
2. Set the following environment variables in Netlify:
   - `NODE_VERSION`: `16.20.0`
   - `NPM_VERSION`: `8.19.4`
   - `AWS_LAMBDA_JS_RUNTIME`: `nodejs16.x`

3. Deploy to Netlify:
   ```bash
   git push origin main
   ```

The API will be available at: `https://your-netlify-site.netlify.app/.netlify/functions/server`

## Local Development

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run locally:
   ```bash
   npm start
   ```

The API will be available at: `http://localhost:8888/.netlify/functions/server`
