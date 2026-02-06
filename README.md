<p align="center">
  <strong>ErrorWatch</strong> - Real-time Error Monitoring Dashboard
</p>

# ErrorWatch - Production-Ready Monitoring Dashboard

A powerful, production-ready Next.js monitoring dashboard for detecting, tracking, and alerting on errors in real-time. Built with React 19, Next.js 16, Tailwind CSS, and Upstash QStash for async processing.

## Quick Start

```bash
# Install dependencies (runs on preview startup)
pnpm install

# Start development server
pnpm dev

# Visit the app
# http://localhost:3000 - Landing page
```

The preview environment will automatically install all dependencies and start the dev server.

## Features

- **Real-time Monitoring** - Live error tracking with automatic detection and auto-refresh
- **Alert Management** - Custom alert rules with multiple severity levels (critical, high, medium, low)
- **Error Detection** - Automatic error grouping, pattern recognition, and stack trace analysis
- **Shared Access** - Generate dev links and team invite links for secure dashboard sharing
- **Real-time Analytics** - Interactive charts (Line, Bar, Pie, Area) showing trends and metrics
- **Breadcrumb Tracking** - Track user actions and system events leading to errors
- **Team Collaboration** - Role-based access control and shared dashboards
- **Async Processing** - Reliable job handling via Upstash QStash integration
- **Live Indicators** - Real-time status badges and health metrics

## Application Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with hero section and features showcase |
| `/dashboard` | Real-time monitoring with live metrics and alerts |
| `/dashboard/analytics` | Interactive charts and trend analysis |
| `/dashboard/alert-rules` | Create and manage alert rules |
| `/dashboard/setup` | Onboarding and configuration wizard |
| `/shared/[linkId]` | Read-only shareable dashboard for team members |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Next.js 16 |
| **Styling** | Tailwind CSS 3.4, Custom design tokens |
| **Visualization** | Recharts for interactive charts |
| **Async Jobs** | Upstash QStash for reliable message processing |
| **Language** | TypeScript 5.8 |
| **Fonts** | Geist Sans & Mono from Next.js |

## Environment Variables (Optional)
