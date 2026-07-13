const multer = require('multer');
const { sendError } = require('../utils/apiResponse');

// Allowed MIME types for profile photos
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Allowed MIME types for document attachments
const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// Maximum file sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;    // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Memory storage — files are held in memory as Buffer objects.
 * This is used before uploading to Cloudinary.
 */
const memoryStorage = multer.memoryStorage();

/**
 * File filter for profile photo uploads
 */
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type. Only ${ALLOWED_IMAGE_TYPES.join(', ')} are allowed for images.`),
      false
    );
  }
};

/**
 * File filter for document/attachment uploads
 */
const documentFileFilter = (req, file, cb) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type. Only images and PDF files are allowed for documents.`),
      false
    );
  }
};

/**
 * Multer instance for profile photo uploads
 * Single file, field name: 'profilePhoto'
 */
const uploadProfilePhoto = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter,
}).single('profilePhoto');

/**
 * Multer instance for consultation attachment uploads
 * Up to 5 files, field name: 'attachments'
 */
const uploadAttachments = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: documentFileFilter,
}).array('attachments', 5);

/**
 * Middleware wrapper for profile photo upload with error handling
 */
const handleProfilePhotoUpload = (req, res, next) => {
  uploadProfilePhoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 400, 'File is too large. Maximum allowed size is 5MB.');
      }
      return sendError(res, 400, `File upload error: ${err.message}`);
    }
    if (err) {
      return sendError(res, 400, err.message);
    }
    next();
  });
};

/**
 * Middleware wrapper for document attachment upload with error handling
 */
const handleAttachmentsUpload = (req, res, next) => {
  uploadAttachments(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 400, 'One or more files are too large. Maximum allowed size is 10MB per file.');
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return sendError(res, 400, 'Too many files. Maximum 5 attachments are allowed.');
      }
      return sendError(res, 400, `File upload error: ${err.message}`);
    }
    if (err) {
      return sendError(res, 400, err.message);
    }
    next();
  });
};

/**
 * Multer instance for single prescription upload
 * Single file, field name: 'prescriptionFile'
 */
const uploadPrescriptionFile = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: documentFileFilter,
}).single('prescriptionFile');

/**
 * Middleware wrapper for single prescription upload
 */
const handlePrescriptionUpload = (req, res, next) => {
  uploadPrescriptionFile(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 400, 'File is too large. Maximum allowed size is 10MB.');
      }
      return sendError(res, 400, `File upload error: ${err.message}`);
    }
    if (err) {
      return sendError(res, 400, err.message);
    }
    next();
  });
};

module.exports = {
  handleProfilePhotoUpload,
  handleAttachmentsUpload,
  handlePrescriptionUpload,
};