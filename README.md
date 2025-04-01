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

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open http://localhost:3000 in your browser

## API Endpoints

- POST `/convert` - Convert video/audio to MP3
- POST `/youtube` - Download and convert YouTube videos
- POST `/convert-video` - Convert videos between formats

## Technologies Used

- Frontend: HTML5, TailwindCSS, JavaScript
- Backend: Node.js, Express
- Media Processing: FFmpeg
- YouTube Integration: ytdl-core
