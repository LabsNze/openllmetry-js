# Deployment Guide - ErrorWatch MVP

## Quick Start

```bash
# Install dependencies
pnpm install

# Run preview with dev server
pnpm dev

# Access the application
# Open http://localhost:3000 in your browser
```

## Local Development

### Setup
1. Clone the repository from GitHub
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env.development.local`
4. Add your Upstash QStash credentials (optional for development)
5. Run development server: `pnpm dev`

### Environment Variables
```env
QSTASH_URL=          # From Upstash Console
QSTASH_TOKEN=        # From Upstash Console
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Production Build

```bash
# Build the application
pnpm build

# Test production build locally
pnpm start

# The app will run on http://localhost:3000
```

## Deployment Options

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in project settings
3. Deploy automatically on push to main branch
4. Preview deployments for pull requests

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Set start command: `npm run build && npm start`
4. Deploy

### Heroku
```bash
heroku create your-app-name
heroku config:set QSTASH_URL=your_url
heroku config:set QSTASH_TOKEN=your_token
git push heroku main
```

## Environment Setup

### Upstash QStash Configuration
1. Create account at https://console.upstash.com
2. Create a QStash project
3. Copy QSTASH_URL and QSTASH_TOKEN
4. Add to your deployment environment variables

### Callback Configuration
For QStash to send job callbacks:
```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Monitoring & Logs

### Local Development
- Check browser console for client errors
- Check terminal for server errors

### Production
- Use platform's built-in logging (Vercel, Railway, etc.)
- Monitor QStash job status in console
- Check application metrics

## Performance

### Optimization Tips
1. Use CDN for static assets (automatic on Vercel)
2. Enable compression in production
3. Optimize database queries if persistence added
4. Cache API responses where applicable
5. Use lazy loading for heavy components

### Expected Performance
- Time to Interactive: ~2 seconds
- Largest Contentful Paint: ~3 seconds
- Cumulative Layout Shift: <0.1

## Troubleshooting

### Build Errors
- Clear `.next` and `node_modules`: `rm -rf .next node_modules && pnpm install`
- Check Node version: `node --version` (should be 18+)
- Verify environment variables are set

### Runtime Errors
- Check browser console for frontend errors
- Check server logs for backend errors
- Verify API routes are accessible
- Ensure QStash credentials are correct

### Performance Issues
- Check network tab in DevTools
- Monitor CPU/memory usage
- Review bundle size: `pnpm build --analyze`

## Scaling Considerations

- Real-time updates: Consider WebSocket for larger scale
- Database: Add persistence for production use
- Caching: Implement Redis for frequently accessed data
- Job queue: QStash handles async processing
- Authentication: Add user management for teams

## Security Checklist

- [ ] Environment variables are not committed
- [ ] Sensitive data removed from logs
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Share links have proper expiration
- [ ] API rate limiting implemented
- [ ] CORS properly configured

## Maintenance

### Regular Tasks
- Update dependencies: `pnpm update`
- Check for security vulnerabilities: `pnpm audit`
- Monitor QStash logs for failed jobs
- Review error patterns for new issues
- Backup user data if implemented

### Updating
```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update @package-name

# Check outdated packages
pnpm outdated
```

## Support

For issues or questions:
1. Check the documentation files in the repo
2. Review error logs and console output
3. Check Upstash documentation for QStash issues
4. Submit issues to GitHub repository
