const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile photos
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillswap/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

// Storage for certificates
const certificateStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillswap/certificates',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});

// Storage for chat files
const chatFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillswap/chat',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  },
});

const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadCertificate = multer({ storage: certificateStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadChatFile = multer({ storage: chatFileStorage, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = { cloudinary, uploadProfile, uploadCertificate, uploadChatFile };
