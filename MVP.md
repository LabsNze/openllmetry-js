# ErrorWatch MVP - Complete Guide

## Overview

ErrorWatch is a production-ready error monitoring and alerting dashboard built with Next.js 16, React 19, and Tailwind CSS. It provides real-time error detection, intelligent alerting, team collaboration, and comprehensive analytics.

## Key Features

### Real-Time Monitoring
- Live error stream with automatic updates every 5 seconds
- Active alert tracking with severity levels
- System health metrics and user impact analysis
- Color-coded severity indicators (critical, high, medium, low)

### Error Detection & Grouping
- Automatic error capture and categorization
- Stack trace analysis with source file detection
- Breadcrumb tracking for user actions
- Duplicate error detection and grouping

### Alert Management
- Custom alert rule creation
- Multiple severity levels
- Configurable notification channels (email, Slack, webhook, in-app)
- Alert acknowledgment and resolution workflow

### Team Collaboration
- Shareable dashboard links with unique URLs
- Role-based access control (viewer, collaborator, admin)
- Team member invitations
- Time-limited access tokens

### Analytics & Insights
- Interactive charts (line, pie, bar, area)
- Error trend analysis
- Top error patterns and affected users
- Service health overview

### Real-time Updates
- Live indicator badges
- Automatic data refresh
- Responsive notifications
- Smooth animations and transitions

## Project Structure

```
app/
├── page.tsx                    # Root page (redirects to /home)
├── layout.tsx                  # Root layout with metadata
├── globals.css                 # Premium dark theme with design tokens
├── home/
│   └── page.tsx               # Landing page with features overview
├── dashboard/
│   ├── page.tsx               # Main monitoring dashboard
│   ├── analytics/
│   │   └── page.tsx           # Analytics & trends
│   ├── alert-rules/
│   │   └── page.tsx           # Alert management
│   └── setup/
│       └── page.tsx           # Onboarding flow
├── shared/
│   └── [linkId]/
│       └── page.tsx           # Shared dashboard view
├── metrics/
│   └── page.tsx               # LLM traces metrics
└── api/
    ├── alerts/                # Alert management endpoints
    ├── errors/                # Error capture endpoints
    ├── traces/                # LLM trace endpoints
    ├── share/                 # Share link generation
    ├── alert-rules/           # Alert rules endpoints
    └── queue/process/         # QStash job processing

components/
├── navbar.tsx                 # Navigation bar
├── dashboard-metrics.tsx      # Metrics cards with live indicators
├── alerts-list.tsx            # Alert listing component
├── errors-panel.tsx           # Error details and breadcrumbs
├── real-time-charts.tsx       # Recharts visualizations
├── trace-list.tsx             # LLM trace browser
└── trace-details.tsx          # Trace details viewer

lib/
├── alert-engine.ts            # Alert creation and management
├── error-monitor.ts           # Error capture and grouping
├── shared-access.ts           # Link generation and access control
├── qstash.ts                  # QStash integration
├── tracing-core.ts            # LLM trace handling
└── mock-traces.ts             # Mock data generation
```

## Running the Project

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.development.local

# Run development server
pnpm dev
```

### Access Points
- Home/Landing: http://localhost:3000 (redirects to /home)
- Landing Page: http://localhost:3000/home
- Main Dashboard: http://localhost:3000/dashboard
- Setup/Onboarding: http://localhost:3000/dashboard/setup
- Analytics: http://localhost:3000/dashboard/analytics
- Alert Rules: http://localhost:3000/dashboard/alert-rules
- LLM Traces: http://localhost:3000/metrics

## Core Components

### Dashboard Metrics
Real-time metric cards displaying:
- Active Alerts (with severity trends)
- Critical Errors (with direction indicator)
- 24-hour Error Count (with trend analysis)
- Affected Users (with impact level)
- System Health (with live status indicator)

### Alerts Management
- View all active, acknowledged, and resolved alerts
- Create new alert rules with conditions
- Acknowledge or resolve alerts
- Set notification preferences
- Integration with QStash for async processing

### Error Details
- Stack trace visualization
- Source file and line number detection
- Breadcrumb tracking with timestamps
- Error grouping and duplicate detection
- User session context

### Real-time Charts
- Error frequency line chart
- Severity distribution pie chart
- Alert status breakdown
- Time-based analytics

## Environment Configuration

### Required Variables
```
QSTASH_URL=         # Upstash QStash URL
QSTASH_TOKEN=       # Upstash QStash token
```

### Optional Variables
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## QStash Integration

QStash provides reliable async job processing for:
- Alert notifications
- Error processing and analysis
- Alert acknowledgment handling
- Metric aggregation

Job types:
- `send-alert` - Route alerts to notification channels
- `process-error` - Stack trace analysis
- `acknowledge-alert` - Alert acknowledgment
- `resolve-alert` - Alert resolution
- `aggregate-metrics` - Metric calculations

## Design System

### Color Palette
- Background: Deep blue-grey (HSL 200, 15%, 8%)
- Surface: Medium blue-grey (HSL 200, 12%, 14%)
- Primary: Bright cyan (HSL 200, 100%, 62%)
- Destructive: Red (HSL 0, 84%, 60%)
- Success: Green (HSL 120, 75%, 55%)
- Warning: Amber (HSL 40, 100%, 55%)

### Typography
- Sans: Geist (default system font)
- Monospace: Geist Mono

### Components
- Cards with gradient backgrounds
- Alert badges with severity colors
- Live indicator pulses
- Smooth animations and transitions
- Glass-morphism effects

## Performance Optimizations

- Real-time metrics with 5-second refresh
- Efficient data fetching with parallel requests
- Optimized Recharts visualizations
- Lazy loading of heavy components
- CSS animations for smooth UX

## Security

- Share link tokens with expiration
- Role-based access control
- Read-only dashboard views
- No authentication required (MVP)
- Safe error message handling

## Future Enhancements

- User authentication and teams
- Database persistence
- Email notifications
- Slack integration
- Custom webhook handlers
- Source map processing
- Session replay
- Error replay debugging
- ML-powered anomaly detection

## Deployment

Ready for deployment on:
- Vercel (recommended)
- Railway
- Heroku
- AWS
- Docker containers

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Support & Documentation

See the following files for more details:
- `MONITORING.md` - Comprehensive monitoring features
- `QSTASH_SETUP.md` - QStash integration guide
- `DASHBOARD.md` - Dashboard usage guide
- `GETTING_STARTED.md` - Quick start guide
