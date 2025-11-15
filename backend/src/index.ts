import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';

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

// Get autocomplete suggestions for education and work experience
app.get('/api/candidates/autocomplete/:field', async (req, res) => {
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

// Basic candidate registration endpoint (full implementation in ticket 2)
app.post('/api/candidates', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, education, workExperience } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !address || !education || !workExperience) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create candidate (resume handling will be added in ticket 2)
    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        education,
        workExperience,
      },
    });

    res.status(201).json({ 
      message: 'Candidate added successfully',
      candidate 
    });
  } catch (error: any) {
    console.error('Candidate creation error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A candidate with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add candidate' });
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
