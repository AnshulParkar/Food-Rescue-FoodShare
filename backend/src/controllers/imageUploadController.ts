import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for local file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
}).single('image');

export const uploadImage = async (req: Request, res: Response) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ 
                message: 'Error uploading file', 
                error: err.message 
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            // Return the local file URL
            const fileUrl = `/uploads/${req.file.filename}`;
            
            res.json({ 
                message: 'File uploaded successfully',
                url: fileUrl
            });
        } catch (error: any) {
            console.error('Error in file upload:', error);
            res.status(500).json({ 
                message: 'Error uploading file',
                error: error.message 
            });
        }
    });
};

export const getUploadUrl = async (req: Request, res: Response) => {
    try {
        const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
        // For local storage, we just return the filename that will be used
        const url = `/uploads/${filename}`;
        res.json({ url, filename });
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Error generating upload URL',
            error: error.message 
        });
    }
};