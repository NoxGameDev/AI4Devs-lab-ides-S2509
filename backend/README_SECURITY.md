# Security Configuration

## HTTPS Setup (Production)

For production deployment, HTTPS should be configured. Here are the recommended approaches:

### Option 1: Reverse Proxy (Recommended)
Use a reverse proxy like Nginx or Traefik in front of the application:
- Terminate SSL/TLS at the reverse proxy
- Forward requests to the backend over HTTP internally
- Configure SSL certificates (Let's Encrypt recommended)

### Option 2: Node.js HTTPS Server
Configure Express to use HTTPS directly:

1. Obtain SSL certificates (e.g., from Let's Encrypt)
2. Update `backend/src/index.ts`:

```typescript
import https from 'https';
import fs from 'fs';

// ... existing code ...

const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH || '/path/to/private.key'),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/path/to/certificate.crt'),
};

https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`HTTPS server is running at https://localhost:${port}`);
});
```

3. Set environment variables in `docker-compose.yml` or `.env`:
   - `SSL_KEY_PATH`: Path to private key
   - `SSL_CERT_PATH`: Path to certificate

### Environment Variables for Production

Required environment variables:
- `JWT_SECRET`: Strong random secret for JWT signing (minimum 32 characters)
- `DATABASE_URL`: Database connection string
- `NODE_ENV`: Set to `production` in production

### Security Best Practices

1. **JWT Secret**: Use a strong, randomly generated secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **File Storage**: 
   - Uploads directory has restricted permissions (700)
   - Individual files have restricted permissions (600)
   - Files are stored outside the web root
   - File names are sanitized to prevent path traversal

3. **Authentication**:
   - Passwords are hashed using bcrypt (10 salt rounds)
   - JWT tokens expire after 7 days
   - All candidate routes require authentication
   - Only recruiters can access candidate management

4. **Database**:
   - Use strong database passwords
   - Limit database access to application server only
   - Use connection pooling in production

5. **CORS**: 
   - In production, configure CORS to only allow your frontend domain:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
     credentials: true,
   }));
   ```

