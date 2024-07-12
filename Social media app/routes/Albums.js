const express = require('express');
const router = express.Router();
const Album = require('../models/Album');
const Photo = require('../models/Photo');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Create a new album
router.post('/', async (req, res) => {
  try {
    const { title, userId } = req.body;
    const newAlbum = new Album({ title, userId });
    const savedAlbum = await newAlbum.save();
    res.status(201).json(savedAlbum);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create album' });
  }
});

// Get albums for a specific user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const albums = await Album.find({ userId }).populate('photos');
    res.status(200).json(albums);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

// Add a new photo to an album
router.post('/:albumId/photos', upload.single('photo'), async (req, res) => {
  try {
    const { albumId } = req.params;
    const photoUrl = `/uploads/${req.file.filename}`;
    const newPhoto = new Photo({ url: photoUrl, description: '' });
    const savedPhoto = await newPhoto.save();

    const album = await Album.findById(albumId);
    album.photos.push(savedPhoto);
    await album.save();

    res.status(201).json({ photo: savedPhoto });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add photo' });
  }
});

// Update photo description
router.patch('/:albumId/photos/:photoId', async (req, res) => {
  try {
    const { albumId, photoId } = req.params;
    const { description } = req.body;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    photo.description = description;
    await photo.save();

    res.status(200).json(photo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update description' });
  }
});

// Delete a photo from an album
router.delete('/:albumId/photos/:photoId', async (req, res) => {
  try {
    const { albumId, photoId } = req.params;

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    album.photos.pull(photoId);
    await album.save();
    await photo.remove();

    res.status(200).json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

module.exports = router;
