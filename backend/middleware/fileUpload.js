import multer from 'multer';
import path from 'path';

// Set up storage engine. We use memory storage to upload directly to Cloudinary
// without saving to disk first.
const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error(`Image upload only supports the following filetypes: ${filetypes}`), false);
};

const documentFileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error(`Document upload only supports the following filetypes: ${filetypes}`), false);
};

const uploadDocuments = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: documentFileFilter,
});

const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: imageFileFilter,
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: fileFilter,
});

export { uploadDocuments, uploadImage };