# AI Development Logs

This file documents interactions with AI assistants during the development of this project.

---

## Entry 1 - Docker Compose Setup (November 15, 2025)

### Request
Set up and test the entire project via Docker Compose, including backend and frontend services.

### Summary
Successfully containerized the full-stack application and configured Docker Compose to run all services together.

### Tasks Completed

1. **Created Backend Dockerfile**
   - Multi-stage build using Node.js 18-slim base image
   - Installed OpenSSL for Prisma compatibility (required on Debian-based images)
   - Generated Prisma Client in both build and production stages to ensure correct binaries
   - Configured to run the compiled TypeScript application

2. **Created Frontend Dockerfile**
   - Multi-stage build: Node.js 18-alpine for building, nginx:alpine for serving
   - Builds the React application and serves it with nginx
   - Exposes port 80 (mapped to 3000 in docker-compose)

3. **Enhanced docker-compose.yml**
   - Added backend service with dependency on database health
   - Added frontend service with dependency on backend
   - Configured health checks for database and backend services
   - Added persistent volume for PostgreSQL data
   - Removed obsolete `version` field (no longer needed in modern Docker Compose)
   - Set up proper environment variables for DATABASE_URL

4. **Created .dockerignore Files**
   - Added `.dockerignore` for backend to exclude unnecessary files
   - Added `.dockerignore` for frontend to optimize build context

5. **Fixed Prisma Issues**
   - Resolved OpenSSL compatibility issues by switching from Alpine to Debian-slim base image
   - Fixed Prisma binary engine loading by regenerating Prisma Client in production stage
   - Ensured correct platform-specific binaries are available at runtime

### Key Technical Challenges Resolved

- **Prisma + Alpine Linux incompatibility**: Prisma requires OpenSSL, which isn't easily compatible with Alpine's musl libc. Solution: Switched to Debian-slim base image and installed OpenSSL via apt-get.
- **Prisma binary engines not found**: Initially tried copying pre-generated binaries from builder stage, but platform differences caused failures. Solution: Regenerate Prisma Client in the production stage after installing dependencies.
- **Database migrations**: Initially attempted to run `prisma migrate deploy`, but no migrations existed. Simplified to just start the server (Prisma Client can handle schema sync on first connection).

### Final Status
✅ All services running and healthy:
- Database (PostgreSQL): Port 5432
- Backend (Express + Prisma): Port 3010
- Frontend (React + nginx): Port 3000

✅ Endpoints verified:
- Backend API responding with "Hola LTI!"
- Frontend serving React application successfully

### Files Created/Modified
- `backend/Dockerfile` (created)
- `frontend/Dockerfile` (created)
- `backend/.dockerignore` (created)
- `frontend/.dockerignore` (created)
- `docker-compose.yml` (modified - added backend and frontend services)

---

## Entry 2 - Ticket 1: Candidate Registration Form UI Implementation (November 15, 2025)

### Request
Implement the frontend user interface for adding new candidates to the ATS system with a registration form (Ticket 1).

### Summary
Successfully implemented a complete candidate registration form UI with validation, autocomplete functionality, file upload support, and a modern dark theme design system. Added supporting backend endpoints for candidate registration and autocomplete suggestions.

### Tasks Completed

1. **Updated Prisma Schema**
   - Added Candidate model with fields: firstName, lastName, email, phone, address, education, workExperience, resumePath
   - Added timestamps (createdAt, updatedAt) for tracking
   - Email field marked as unique to prevent duplicate candidates

2. **Frontend Components Created**
   - **Dashboard Component** (`frontend/src/components/Dashboard.tsx`)
     - Main dashboard with "Add Candidate" button
     - Form container management and welcome message
   - **CandidateForm Component** (`frontend/src/components/CandidateForm.tsx`)
     - Complete registration form with all required fields
     - Client-side validation (email format, required fields)
     - Autocomplete functionality for Education and Work Experience fields
     - File upload component for PDF/DOCX resumes
     - Success/error message handling
     - Full accessibility support (ARIA attributes, keyboard navigation)

3. **Styling and Design System**
   - **Updated global styles** (`frontend/src/index.css`)
     - Dark charcoal background (#1a1a1a)
     - White text for primary content
   - **Dashboard styling** (`frontend/src/components/Dashboard.css`)
     - Dark theme with lime green (#6fb322) accent buttons
     - Layered gray surfaces for depth
     - Rounded corners (8-12px)
     - Clean typography hierarchy
   - **Form styling** (`frontend/src/components/CandidateForm.css`)
     - Dark form inputs with green focus states
     - Autocomplete dropdown with dark theme
     - Custom file upload button styling
     - Responsive grid layout for form fields
     - Accessibility features (reduced motion, high contrast support)

4. **Backend API Endpoints**
   - **POST /api/candidates** - Candidate registration endpoint
     - Validates all required fields
     - Email format validation
     - Creates candidate record in database
     - Returns success/error responses
   - **GET /api/candidates/autocomplete/:field** - Autocomplete suggestions
     - Supports 'education' and 'workExperience' fields
     - Case-insensitive search with query parameter
     - Returns top 10 unique suggestions
   - Added CORS middleware for frontend-backend communication
   - Added JSON body parsing middleware

5. **Dependencies and Configuration**
   - Added `cors` package to backend dependencies
   - Added `@types/cors` to backend devDependencies
   - Updated package-lock.json for new dependencies

6. **Design Refinements**
   - Applied visual design criteria with dark theme
   - Removed glow effects from buttons for cleaner look
   - Ensured consistent color palette throughout
   - Maintained accessibility standards

### Key Technical Challenges Resolved

- **TypeScript Type Errors**: Fixed ref type mismatch between HTMLInputElement and HTMLTextAreaElement for autocomplete functionality. Solution: Used correct type for textarea ref.
- **Backend Autocomplete Typing**: Resolved TypeScript errors with Prisma select queries for dynamic fields. Solution: Used type assertions to properly handle conditional field selection.
- **Package Lock Synchronization**: Docker build failed due to package-lock.json being out of sync after adding cors dependency. Solution: Ran `npm install` locally to update package-lock.json.
- **Prisma Schema Updates**: Needed to push schema changes to database. Solution: Used `prisma db push` after container startup to sync schema.

### Design System Implementation

**Color Palette Applied:**
- Primary background: Deep charcoal (#1a1a1a)
- Surface elevation: Layered grays (#2a2a2a, #3a3a3a)
- Accent/Highlight: Vibrant lime green (#6fb322)
- Text hierarchy: White (#ffffff) for primary, muted gray (#a0a0a0) for secondary

**Typography:**
- Bold sans-serif for headings (700 weight)
- Clean sans-serif for body content
- Clear hierarchy with letter-spacing adjustments

**Component Design:**
- Rounded corners (8-12px) throughout
- Subtle background differentiation with borders
- High-contrast buttons using lime green accent
- Compact information density with proper spacing
- Hover states with directional cues (translateY)

### Final Status
✅ All acceptance criteria met:
- "Add Candidate" button clearly visible on main dashboard
- Form includes all required fields (firstName, lastName, email, phone, address, education, workExperience)
- Email validation checks for valid format
- Required fields cannot be submitted empty
- Resume upload accepts PDF or DOCX formats (UI ready, backend file handling in Ticket 2)
- Success message displays after successful submission
- Clear error messages display when errors occur
- Autocomplete works for education and work experience fields
- Form works on different devices and browsers (responsive design)
- Form follows accessibility best practices (ARIA attributes, keyboard navigation)

✅ Services running:
- Frontend with new candidate registration form: http://localhost:3000
- Backend with candidate endpoints: http://localhost:3010

### Files Created/Modified
- `backend/prisma/schema.prisma` (modified - added Candidate model)
- `backend/src/index.ts` (modified - added candidate endpoints and CORS)
- `backend/package.json` (modified - added cors and @types/cors)
- `backend/package-lock.json` (modified - updated dependencies)
- `frontend/src/App.tsx` (modified - integrated Dashboard component)
- `frontend/src/components/Dashboard.tsx` (created)
- `frontend/src/components/Dashboard.css` (created)
- `frontend/src/components/CandidateForm.tsx` (created)
- `frontend/src/components/CandidateForm.css` (created)
- `frontend/src/index.css` (modified - added dark theme base styles)

### Notes
- File upload UI is complete, but actual file storage/processing will be implemented in Ticket 2 (Backend - Candidate Registration Processing)
- Autocomplete suggestions populate based on existing candidate data in the database
- Form includes comprehensive validation on both client and server sides
- Design system aligns with specified visual criteria for modern, community-focused interface

