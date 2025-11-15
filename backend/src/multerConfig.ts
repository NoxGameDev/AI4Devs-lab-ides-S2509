import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

// Ensure uploads directory exists with secure permissions
const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { 
    recursive: true,
    mode: 0o700 // Only owner can read, write, execute (rwx------)
  });
} else {
  // Ensure existing directory has correct permissions
  try {
    fs.chmodSync(uploadsDir, 0o700);
  } catch (error) {
    console.warn('Could not set permissions on uploads directory:', error);
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename: timestamp-random-originalname
    // Remove any path separators from original filename to prevent directory traversal
    const sanitizedOriginal = path.basename(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(sanitizedOriginal);
    const filename = `${uniqueSuffix}${ext}`;
    
    // Set secure file permissions (read/write for owner only)
    setTimeout(() => {
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.chmodSync(filePath, 0o600); // Only owner can read/write (rw-------)
        } catch (error) {
          console.warn('Could not set permissions on uploaded file:', error);
        }
      }
    }, 100);
    
    cb(null, filename);
  },
});

// File filter for PDF and DOCX only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword', // DOC (for older Word docs)
  ];
  
  const allowedExts = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { uploadsDir };

