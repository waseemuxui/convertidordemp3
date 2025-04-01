const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
const fs = require('fs');

// Set FFmpeg path for Netlify Functions
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configure CORS for Netlify domain
app.use(cors({
    origin: ['https://convertidordemp3.netlify.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Convert video to MP3
app.post('/convert', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `${Date.now()}.mp3`);
    const bitrate = req.body.bitrate || '192k';

    ffmpeg(inputPath)
        .toFormat('mp3')
        .audioBitrate(bitrate)
        .on('end', () => {
            fs.unlinkSync(inputPath); // Clean up input file
            res.json({
                success: true,
                file: `/uploads/${path.basename(outputPath)}`
            });
        })
        .on('error', (err) => {
            console.error('Error:', err);
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
        
        const outputPath = path.join('uploads', `${title}-${Date.now()}.${format}`);
        const stream = ytdl(url, { quality: 'highestaudio' });

        if (format === 'mp3') {
            ffmpeg(stream)
                .toFormat('mp3')
                .audioBitrate(bitrate)
                .on('end', () => {
                    res.json({
                        success: true,
                        file: `/uploads/${path.basename(outputPath)}`,
                        title: title
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
                    res.json({
                        success: true,
                        file: `/uploads/${path.basename(outputPath)}`,
                        title: title
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
    const outputPath = path.join('uploads', `${Date.now()}.${outputFormat}`);

    ffmpeg(inputPath)
        .toFormat(outputFormat)
        .on('end', () => {
            fs.unlinkSync(inputPath); // Clean up input file
            res.json({
                success: true,
                file: `/uploads/${path.basename(outputPath)}`
            });
        })
        .on('error', (err) => {
            console.error('Error:', err);
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

// Cleanup temporary files periodically
setInterval(() => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return;
        }

        const now = Date.now();
        files.forEach(file => {
            const filePath = path.join(uploadDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                // Remove files older than 1 hour
                if (now - stats.mtime.getTime() > 3600000) {
                    fs.unlink(filePath, err => {
                        if (err) console.error('Error deleting file:', err);
                    });
                }
            });
        });
    });
}, 1800000); // Run every 30 minutes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
