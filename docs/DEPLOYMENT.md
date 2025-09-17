# TrueHearted Deployment Guide

## Prerequisites

### 1. Supabase Project Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project (if not already done)
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID
```

### 2. Environment Configuration
Create `.env.production` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# External API Configuration
VITE_API_BASE_URL=https://api.truehearted.com
VITE_APP_ENV=production

# Optional: Analytics & Monitoring
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## Frontend Deployment (Vercel)

### 1. Vercel Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Configure environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_API_BASE_URL production
```

### 2. Build Configuration
Create `vercel.json`:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 3. Progressive Web App Setup
Create `public/sw.js`:
```javascript
const CACHE_NAME = 'truehearted-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

## Backend API Deployment (Node.js)

### 1. Express.js API Structure
```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';

const app = express();
const port = process.env.PORT || 3001;

// Supabase admin client for JWT verification
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// MySQL connection pool
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Authentication middleware
async function authenticateSupabaseUser(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get member ID from mapping
    const { data: mapping } = await supabaseAdmin
      .from('user_mappings')
      .select('member_id')
      .eq('supabase_user_id', user.id)
      .single();

    if (!mapping) {
      return res.status(404).json({ error: 'User mapping not found' });
    }

    req.user = user;
    req.memberId = mapping.member_id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// API Routes
app.get('/api/profile', authenticateSupabaseUser, async (req, res) => {
  try {
    const [rows] = await mysqlPool.execute(
      'SELECT * FROM members WHERE id = ?',
      [req.memberId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.get('/api/matches', authenticateSupabaseUser, async (req, res) => {
  // Implementation for fetching matches
});

app.post('/api/like', authenticateSupabaseUser, async (req, res) => {
  // Implementation for sending likes
});

app.listen(port, () => {
  console.log(`TrueHearted API running on port ${port}`);
});
```

### 2. Docker Configuration
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3001

USER node

CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - MYSQL_HOST=${MYSQL_HOST}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
    depends_on:
      - mysql
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    restart: unless-stopped

volumes:
  mysql_data:
```

## Database Migration

### 1. Supabase Migration
```bash
# Run pending migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

### 2. MySQL Data Import
```bash
# Run the import script
node scripts/complete-data-import.js

# Verify import
node scripts/verify-import.js
```

## Production Deployment Steps

### 1. Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates configured
- [ ] Domain DNS pointing to deployment
- [ ] Monitoring and logging configured
- [ ] Backup procedures in place

### 2. Deployment Process
```bash
# 1. Deploy frontend
vercel --prod

# 2. Deploy API (AWS/Google Cloud)
docker build -t truehearted-api .
docker push your-registry/truehearted-api:latest

# 3. Update production deployment
kubectl apply -f k8s/deployment.yaml

# 4. Run database migrations
npm run migrate:prod

# 5. Verify deployment
npm run health-check
```

### 3. Post-deployment Verification
```bash
# Check API health
curl https://api.truehearted.com/health

# Check frontend
curl https://truehearted.com

# Verify authentication flow
npm run test:e2e:prod
```

## SSL/TLS Configuration

### 1. Let's Encrypt (Certbot)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d truehearted.com -d www.truehearted.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name truehearted.com www.truehearted.com;

    ssl_certificate /etc/letsencrypt/live/truehearted.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/truehearted.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location / {
        root /var/www/truehearted;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name truehearted.com www.truehearted.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Observability

### 1. Application Monitoring (Sentry)
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
  tracesSampleRate: 0.1,
});
```

### 2. Health Check Endpoints
```typescript
// Backend health check
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await mysqlPool.execute('SELECT 1');
    
    // Check Supabase connectivity
    await supabaseAdmin.from('user_mappings').select('count').limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 3. Logging Configuration
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## Backup & Disaster Recovery

### 1. Automated Backups
```bash
#!/bin/bash
# backup-script.sh

# MySQL backup
mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://truehearted-backups/mysql/

# Cleanup old backups (keep 30 days)
find . -name "backup_*.sql" -mtime +30 -delete
```

### 2. Disaster Recovery Plan
1. **RTO**: 4 hours maximum downtime
2. **RPO**: 1 hour maximum data loss
3. **Backup Schedule**: Daily MySQL dumps, continuous Supabase backups
4. **Recovery Testing**: Monthly DR drills

## Performance Optimization

### 1. CDN Configuration (Cloudflare)
```javascript
// Cache static assets
const cacheConfig = {
  '/static/*': '1y',
  '/images/*': '1y',
  '/api/*': '0', // No cache for API
  '/': '1h'
};
```

### 2. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_members_status_location ON members(status, location);
CREATE INDEX idx_likes_sent_from_to ON likes(sent_from, sent_to);
CREATE INDEX idx_messages_receiver_timestamp ON messages(receiver_id, timestamp);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM members WHERE status = 'active' AND location LIKE '%New York%';
```

## Security Hardening

### 1. API Security
```typescript
// Input validation middleware
import joi from 'joi';

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Usage
const likeSchema = joi.object({
  target_member_id: joi.string().uuid().required(),
  like_type: joi.string().valid('like', 'pass').required()
});

app.post('/api/like', authenticateSupabaseUser, validateRequest(likeSchema), async (req, res) => {
  // Implementation
});
```

### 2. Rate Limiting
```typescript
import { rateLimit } from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: 'Too many authentication attempts, please try again later.'
});

app.use('/auth/', authLimiter);
```

This deployment guide provides a comprehensive approach to deploying TrueHearted in a production environment while maintaining security, performance, and reliability standards.