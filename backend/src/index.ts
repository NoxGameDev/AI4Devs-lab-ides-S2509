import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { upload, uploadsDir } from './multerConfig';
import { authenticateToken, requireRecruiter, generateToken, hashPassword, verifyPassword } from './auth';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

// Authentication endpoints (public)
// Register new recruiter (for initial setup - in production, this should be admin-only)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password strength check
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        role: 'recruiter',
      },
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user (requires authentication)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Get all candidates (requires authentication)
app.get('/api/candidates', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ candidates, count: candidates.length });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get autocomplete suggestions for education and work experience (requires authentication)
app.get('/api/candidates/autocomplete/:field', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const { field } = req.params;
    const { q } = req.query;

    if (field !== 'education' && field !== 'workExperience') {
      return res.status(400).json({ error: 'Invalid field' });
    }

    const searchQuery = q as string || '';
    
    const whereClause = field === 'education' 
      ? {
          education: {
            contains: searchQuery,
            mode: 'insensitive' as const,
          },
        }
      : {
          workExperience: {
            contains: searchQuery,
            mode: 'insensitive' as const,
          },
        };

    const candidates = await prisma.candidate.findMany({
      select: field === 'education' 
        ? { education: true }
        : { workExperience: true },
      where: whereClause,
      take: 10,
    });

    const suggestions = candidates
      .map((c) => {
        if (field === 'education') {
          return (c as { education: string }).education;
        } else {
          return (c as { workExperience: string }).workExperience;
        }
      })
      .filter((val, idx, self) => self.indexOf(val) === idx && val && val.trim() !== '') as string[];

    res.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Candidate registration endpoint with file upload support (requires authentication)
app.post('/api/candidates', authenticateToken, requireRecruiter, upload.single('resume'), async (req, res) => {
  try {
    // Extract form data from request body
    const { firstName, lastName, email, phone, address, education, workExperience } = req.body;
    const resumeFile = req.file;
    
    // Log file upload info for debugging
    if (resumeFile) {
      console.log('File uploaded:', {
        originalname: resumeFile.originalname,
        filename: resumeFile.filename,
        mimetype: resumeFile.mimetype,
        size: resumeFile.size,
        path: resumeFile.path
      });
    } else {
      console.log('No file uploaded with this request');
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address || !education || !workExperience) {
      // If validation fails and a file was uploaded, clean it up
      if (resumeFile) {
        try {
          fs.unlinkSync(resumeFile.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Clean up uploaded file if email is invalid
      if (resumeFile) {
        try {
          fs.unlinkSync(resumeFile.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Build resume path if file was uploaded
    let resumePath: string | undefined = undefined;
    if (resumeFile) {
      // Store relative path from uploads directory
      resumePath = path.join('resumes', resumeFile.filename);
    }

    // Create candidate with resume path
    const candidate = await prisma.candidate.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        education: education.trim(),
        workExperience: workExperience.trim(),
        resumePath,
      },
    });

    res.status(201).json({ 
      message: 'Candidate added successfully',
      candidate 
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    console.error('Candidate creation error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A candidate with this email already exists' });
    } else if (error.message && error.message.includes('Invalid file type')) {
      res.status(400).json({ error: error.message });
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File size exceeds the 5MB limit' });
    } else {
      res.status(500).json({ error: 'Failed to add candidate: ' + (error.message || 'Unknown error') });
    }
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain'); 
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
