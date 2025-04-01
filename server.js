const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
