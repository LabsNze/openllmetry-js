# Getting Started with OpenLLMetry Monitoring Dashboard

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 2. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will start at `http://localhost:3000`

### 3. Navigate to Dashboard

- **Main Dashboard**: http://localhost:3000/dashboard
- **Analytics**: http://localhost:3000/dashboard/analytics
- **Alert Rules**: http://localhost:3000/dashboard/alert-rules
- **Shared View**: http://localhost:3000/shared/[linkId]?token=[token]

## Project Structure

```
.
├── app/
│   ├── api/                    # API routes
│   │   ├── alerts/            # Alert management
│   │   ├── alert-rules/       # Alert rule CRUD
│   │   ├── errors/            # Error capturing & retrieval
│   │   └── share/             # Share link generation & validation
│   ├── dashboard/             # Monitoring dashboard pages
│   │   ├── page.tsx           # Main dashboard
│   │   ├── analytics/         # Analytics & charts
│   │   └── alert-rules/       # Alert management page
│   ├── shared/                # Public shared dashboards
│   └── layout.tsx             # Root layout
├── components/                # React components
│   ├── navbar.tsx             # Navigation bar
│   ├── dashboard-metrics.tsx  # Stats display
│   ├── alerts-list.tsx        # Alert list component
│   ├── errors-panel.tsx       # Error display
│   └── real-time-charts.tsx   # Chart visualizations
├── lib/                       # Utilities & engines
│   ├── tracing-core.ts        # Tracing infrastructure
│   ├── error-monitor.ts       # Error detection & management
│   ├── alert-engine.ts        # Alert system
│   └── shared-access.ts       # Access control & sharing
├── public/                    # Static assets
└── globals.css               # Global styles & theme
```

## Key Features

### Error Monitoring
- Automatic error capture and grouping
- Stack trace analysis
- Breadcrumb tracking
- Context preservation

### Alert System
- Custom alert rules
- Multiple severity levels
- Real-time notifications
- Status management (active/acknowledged/resolved)

### Team Collaboration
- Shareable dashboard links
- Role-based access (viewer/collaborator/admin)
- Time-limited invites
- Revocable access

### Real-time Analytics
- Interactive charts (Line, Pie, Bar, Area)
- Error trends
- Severity distribution
- Top error types
- Affected users tracking

## Deployment

### Build for Production

```bash
pnpm build
pnpm start
```

### Environment Variables

Create a `.env.local` file (see `.env.example`):

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Deploy to Vercel

```bash
vercel deploy
```

## API Usage Examples

### Capture Error

```bash
curl -X POST http://localhost:3000/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "my-project",
    "message": "Database connection failed",
    "stack": "Error: Connection timeout\n  at Database.connect",
    "type": "DatabaseError",
    "environment": "production"
  }'
```

### Get Errors

```bash
curl http://localhost:3000/api/errors?projectId=my-project&limit=50
```

### Create Alert

```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "my-project",
    "title": "High Error Rate Detected",
    "description": "Error rate exceeded 10%",
    "severity": "critical",
    "condition": "error_rate_high",
    "affectedServices": ["api-service", "worker-service"]
  }'
```

### Generate Share Link

```bash
curl -X POST http://localhost:3000/api/share/generate-link \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "my-project",
    "projectName": "My Project",
    "type": "dev-link",
    "accessLevel": "viewer"
  }'
```

## Component Reference

### DashboardMetrics
Displays key statistics with icons and colors
```tsx
<DashboardMetrics stats={stats} loading={loading} />
```

### AlertsList
Shows active alerts with actions
```tsx
<AlertsList alerts={alerts} />
```

### ErrorsPanel
Expandable error list with stack traces
```tsx
<ErrorsPanel errors={errors} />
```

### RealTimeCharts
Interactive charts with Recharts
```tsx
<RealTimeCharts projectId={projectId} />
```

## Styling & Theme

The dashboard uses a professional dark theme with:
- **Primary Color**: Blue (#60a5fa)
- **Destructive**: Red (#ef4444)
- **Warning**: Orange/Yellow (#f97316)
- **Success**: Green (#22c55e)

All colors are CSS variables in `globals.css` and can be customized.

## Performance Optimization

- Auto-refresh every 5 seconds (adjustable)
- Efficient error grouping with hash-based lookup
- Client-side pagination
- Optimized chart re-renders
- Lazy loading components

## Testing

Test the dashboard locally:

1. Visit http://localhost:3000/dashboard
2. Click "Share Dashboard" to generate a link
3. Copy the shared link and test in incognito mode
4. Verify read-only access works correctly

## Troubleshooting

**Dashboard not loading?**
- Check browser console for errors
- Verify API routes are accessible at `/api/`
- Ensure development server is running

**Share links not working?**
- Verify token is included in URL
- Check if link has expired
- Confirm link is still active (not revoked)

**Charts not displaying?**
- Check Recharts installation: `npm ls recharts`
- Verify browser console for errors
- Try hard refresh (Ctrl+Shift+R)

## Next Steps

1. **Integrate with your app**: Use error capturing in your application
2. **Set up alert rules**: Create rules for your critical metrics
3. **Share with team**: Generate links for team member access
4. **Monitor regularly**: Check analytics dashboard daily
5. **Iterate**: Add custom metrics and refine alert thresholds

## Documentation

- [Monitoring Dashboard Guide](./MONITORING.md)
- [LLM Traces Dashboard Guide](./DASHBOARD.md)
- [OpenLLMetry Documentation](https://traceloop.com/docs/openllmetry)

## Support

- GitHub Issues: [traceloop/openllmetry-js](https://github.com/traceloop/openllmetry-js/issues)
- Slack: [Traceloop Community](https://traceloop.com/slack)
- Docs: https://traceloop.com/docs

---

Built with ❤️ by Traceloop | Open Source under Apache 2.0 License
