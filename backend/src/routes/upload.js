const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer, folder) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
  stream.end(buffer);
});

router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Resim gerekli' });
    const folder = req.body.folder || 'marketplace/general';
    const result = await uploadToCloudinary(req.file.buffer, folder);
    res.json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/images', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'Resimler gerekli' });
    const folder = req.body.folder || 'marketplace/products';
    const results = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, folder)));
    res.json({ success: true, images: results.map(r => ({ url: r.secure_url, publicId: r.public_id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/image', protect, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.body.publicId);
    res.json({ success: true, message: 'Resim silindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
