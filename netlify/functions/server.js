const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
const fs = require('fs');
const serverless = require('serverless-http');

// Set FFmpeg path for Netlify Functions
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();

// Configure multer to use /tmp directory in Netlify Functions
const upload = multer({ dest: '/tmp' });

// Configure CORS - allow all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Convert video to MP3
app.post('/convert', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join('/tmp', `${Date.now()}.mp3`);
    const bitrate = req.body.bitrate || '192k';

    ffmpeg(inputPath)
        .toFormat('mp3')
        .audioBitrate(bitrate)
        .on('end', () => {
            // Read the file and send it as base64
            const fileContent = fs.readFileSync(outputPath);
            const base64Content = fileContent.toString('base64');
            
            // Clean up files
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
            res.json({
                success: true,
                file: base64Content,
                filename: `converted-${Date.now()}.mp3`
            });
        })
        .on('error', (err) => {
            console.error('Error:', err);
            // Clean up input file
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
            res.status(500).json({ error: 'Conversion failed' });
        })
        .save(outputPath);
});

// Download and convert YouTube video
app.post('/youtube', async (req, res) => {
    const { url, format = 'mp3', bitrate = '192k' } = req.body;

    try {
        const info = await ytdl.getInfo(url);
        const videoId = info.videoDetails.videoId;
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        const outputPath = path.join('/tmp', `${title}-${Date.now()}.${format}`);
        const stream = ytdl(url, { quality: 'highestaudio' });

        if (format === 'mp3') {
            ffmpeg(stream)
                .toFormat('mp3')
                .audioBitrate(bitrate)
                .on('end', () => {
                    // Read the file and send it as base64
                    const fileContent = fs.readFileSync(outputPath);
                    const base64Content = fileContent.toString('base64');
                    
                    // Clean up file
                    fs.unlinkSync(outputPath);
                    
                    res.json({
                        success: true,
                        file: base64Content,
                        filename: `${title}.mp3`
                    });
                })
                .on('error', (err) => {
                    console.error('Error:', err);
                    res.status(500).json({ error: 'Conversion failed' });
                })
                .save(outputPath);
        } else {
            stream.pipe(fs.createWriteStream(outputPath))
                .on('finish', () => {
                    // Read the file and send it as base64
                    const fileContent = fs.readFileSync(outputPath);
                    const base64Content = fileContent.toString('base64');
                    
                    // Clean up file
                    fs.unlinkSync(outputPath);
                    
                    res.json({
                        success: true,
                        file: base64Content,
                        filename: `${title}.${format}`
                    });
                });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Convert video format
app.post('/convert-video', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputFormat = req.body.format || 'mp4';
    const outputPath = path.join('/tmp', `${Date.now()}.${outputFormat}`);

    ffmpeg(inputPath)
        .toFormat(outputFormat)
        .on('end', () => {
            // Read the file and send it as base64
            const fileContent = fs.readFileSync(outputPath);
            const base64Content = fileContent.toString('base64');
            
            // Clean up files
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
            res.json({
                success: true,
                file: base64Content,
                filename: `converted-${Date.now()}.${outputFormat}`
            });
        })
        .on('error', (err) => {
            console.error('Error:', err);
            // Clean up input file
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
            res.status(500).json({ error: 'Conversion failed' });
        })
        .save(outputPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong'
    });
});

// Export the serverless handler
exports.handler = serverless(app);
