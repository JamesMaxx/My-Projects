const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');

// For prototype we'll accept uploads and return a placeholder URL. In production, wire to S3 or other cloud storage.
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  // TODO: upload to S3 and return URL. For now, return a dummy URL.
  const filename = req.file.originalname;
  const url = `https://example.com/uploads/${encodeURIComponent(filename)}`;
  res.json({ url });
});

module.exports = router;
