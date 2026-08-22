const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Store in memory, then stream to Cloudinary (no local disk writes)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WEBP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 5MB per file, max 6 files
});

const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `petguardian/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// Uploads an array of multer files to Cloudinary, returns [{url, publicId}]
const uploadFilesToCloudinary = async (files, folder) => {
  if (!files || files.length === 0) return [];

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const err = new Error(
      'Photo upload is not available: Cloudinary is not configured on this server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env, or submit without photos.'
    );
    err.statusCode = 503;
    throw err;
  }

  const uploads = files.map((file) => streamUpload(file.buffer, folder));
  const results = await Promise.all(uploads);
  return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

module.exports = { upload, uploadFilesToCloudinary, deleteFromCloudinary };
