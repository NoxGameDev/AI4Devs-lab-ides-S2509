# Backend Dockerfile
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code and Prisma schema
COPY src ./src
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

# Install OpenSSL and Prisma CLI globally for migrations
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* && npm install -g prisma

# Copy package files
COPY package*.json ./

# Install production dependencies and Prisma
RUN npm ci --only=production && npm install prisma

# Copy Prisma schema
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client for this platform
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create uploads directory for file storage
RUN mkdir -p /app/uploads/resumes

# Expose port
EXPOSE 3010

# Start server (Prisma will connect on first use)
CMD ["node", "dist/index.js"]

