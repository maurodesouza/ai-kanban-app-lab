# Deployment Guide

## Overview

This guide covers deployment options and best practices for the Kanban Todo App.

## Deployment Options

### 1. Vercel (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository (recommended)

#### Steps
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
3. Add environment variables:
   ```
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
4. Deploy!

#### Automatic Optimizations
Vercel automatically provides:
- Edge caching
- Image optimization
- Global CDN
- Automatic HTTPS

### 2. Netlify

#### Prerequisites
- Netlify account
- Built application

#### Steps
1. Build the application:
   ```bash
   npm run build
   ```
2. Create `netlify.toml`:
   ```toml
   [build]
     publish = ".next"
     command = "npm run build"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
3. Deploy the `.next` directory to Netlify

### 3. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    restart: unless-stopped
```

#### Commands
```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Build Docker image
docker build -t kanban-todo-app .

# Run container
docker run -p 3000:3000 kanban-todo-app
```

### 4. Traditional Hosting

#### Build for Production
```bash
npm run build
npm run start
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'kanban-todo-app',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

#### Commands
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Environment Configuration

### Development
```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Production
```bash
# .env.production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Staging
```bash
# .env.staging
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
NODE_ENV=production
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer .next

# Check performance budget
npm run performance:ci
```

### Caching Strategy
- **Static Assets**: Cache for 1 year
- **HTML Pages**: Cache for 1 hour
- **API Routes**: No caching
- **Images**: Cache with proper headers

### CDN Configuration
```javascript
// next.config.js
module.exports = {
  assetPrefix: process.env.CDN_URL,
  images: {
    domains: ['your-cdn-domain.com'],
  },
};
```

## Monitoring and Analytics

### Performance Monitoring
```javascript
// lib/analytics.js
export const trackPerformance = () => {
  if (typeof window !== 'undefined') {
    // Track Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};
```

### Error Tracking
```javascript
// lib/error-tracking.js
export const reportError = (error, context) => {
  // Send to your error tracking service
  console.error('Application Error:', error, context);
  
  // Example: Send to Sentry, LogRocket, etc.
  // Sentry.captureException(error, { extra: context });
};
```

## Security Considerations

### Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};
```

### Environment Variables Security
- Never commit `.env.local` to version control
- Use different secrets for development/staging/production
- Rotate secrets regularly
- Use secret management services in production

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run check
      - run: npm run test
      - run: npm run performance:ci

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Quality Gates
```bash
# Pre-deployment checklist
npm run check           # Lint, type-check, format
npm run test            # All tests
npm run test:e2e        # E2E tests
npm run performance:ci # Performance budget
```

## Scaling Considerations

### Database Scaling
- Consider database for persistent storage
- Implement connection pooling
- Use read replicas for high traffic

### Application Scaling
- Horizontal scaling with load balancers
- Vertical scaling with more resources
- Edge computing for global distribution

### Monitoring
- Application performance monitoring (APM)
- Real user monitoring (RUM)
- Infrastructure monitoring

## Backup and Recovery

### Data Backup
```bash
# Backup user data (if applicable)
mysqldump -u username -p database_name > backup.sql

# Backup configuration files
tar -czf config-backup.tar.gz .env* next.config.js
```

### Disaster Recovery
1. Restore from backups
2. Verify application functionality
3. Monitor performance
4. Update DNS if needed

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review performance metrics
- Check accessibility compliance
- Update documentation
- Security audits

### Update Process
```bash
# Update dependencies
npm update

# Check for breaking changes
npm audit

# Test updates
npm run test

# Deploy updates
npm run build
npm run start
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Performance Issues
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer .next

# Check Core Web Vitals
npm run performance:check
```

#### Accessibility Issues
- Check accessibility dashboard in development
- Run automated audits
- Test with screen readers
- Validate keyboard navigation

### Debugging in Production
```bash
# Enable debug logging
DEBUG=* npm run start

# Check server logs
pm2 logs

# Monitor resources
pm2 monit
```

## Rollback Strategy

### Quick Rollback
```bash
# Vercel: Use dashboard to rollback
# Netlify: Deploy previous version
# Docker: Revert to previous image tag
# PM2: Restart with previous build
```

### Database Rollback
```bash
# Restore database
mysql -u username -p database_name < backup.sql

# Verify data integrity
npm run test:integration
```

## Support

### Getting Help
1. Check this documentation
2. Review application logs
3. Monitor performance dashboard
4. Check accessibility audit results
5. Contact support team

### Emergency Contacts
- Development team: dev-team@example.com
- Operations team: ops-team@example.com
- Support team: support@example.com
