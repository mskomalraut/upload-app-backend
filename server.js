// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Schema
const mediaSchema = new mongoose.Schema({
  title: String,
  description: String,
  thumbnailUrl: String,
  videoUrl: String,
});

const Media = mongoose.model('Media', mediaSchema);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Multer Configuration
const upload = multer({ dest: 'uploads/' });

// API Routes
app.post('/upload', upload.fields([{ name: 'thumbnail' }, { name: 'video' }]), async (req, res) => {
  const { title, description } = req.body;
  const { thumbnail, video } = req.files;

  try {
    const thumbnailResult = await cloudinary.uploader.upload(thumbnail[0].path, { folder: 'thumbnails' });
    const videoResult = await cloudinary.uploader.upload(video[0].path, { folder: 'videos', resource_type: 'video' });

    const newMedia = new Media({
      title,
      description,
      thumbnailUrl: thumbnailResult.secure_url,
      videoUrl: videoResult.secure_url,
    });

    await newMedia.save();
    res.status(200).json(newMedia);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

app.get('/media', async (req, res) => {
  try {
    const mediaItems = await Media.find({});
    res.status(200).json(mediaItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

app.get('/media/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const mediaItem = await Media.findById(id);
    if (mediaItem) {
      res.status(200).json(mediaItem);
    } else {
      res.status(404).json({ error: 'Media not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
