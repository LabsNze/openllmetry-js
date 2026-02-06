# Upstash QStash Integration Guide

## Overview

This monitoring dashboard uses Upstash QStash for reliable, asynchronous processing of:
- Alert notifications across multiple channels
- Error analysis and source file detection
- Metrics aggregation
- Alert acknowledgment and resolution tracking

## Setup Instructions

### 1. Create Upstash Account and Project

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up or log in with your account
3. Click "Create" and select "QStash"
4. Choose your region (recommend US for best latency)

### 2. Get Your Credentials

After creating the QStash project:
1. Navigate to your QStash project dashboard
2. Copy these values:
   - **QSTASH_URL**: The base URL for your QStash instance
   - **QSTASH_TOKEN**: Your authentication token

### 3. Configure Environment Variables

Add these to your `.env.local` file or Vercel deployment settings:

```env
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your_token_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or your production URL
```

For production deployment on Vercel:
1. Go to Project Settings → Environment Variables
2. Add the three variables above
3. Redeploy

### 4. Verify Setup

Run the development server:

```bash
pnpm install
pnpm dev
```

Test the QStash integration by:
1. Creating a new alert at `/dashboard/alert-rules`
2. Check the network tab in browser dev tools - you should see a call to `/api/alerts` returning `"notificationQueued": true`
3. Check your terminal logs for `[v0] Alert notification job queued: <alert-id>`

## How It Works

### Architecture

```
Client Request
    ↓
API Endpoint (e.g., /api/alerts)
    ↓
Business Logic (create alert)
    ↓
QStash Client (publishJob)
    ↓
QStash Cloud (queuing)
    ↓
Callback to /api/queue/process
    ↓
Job Handler (send notifications, process errors, etc.)
```

### Supported Job Types

#### 1. Send Alert (`send-alert`)
- **Trigger**: When a new alert is created
- **Channels**: in-app, email, slack, webhook
- **Handler**: Sends notifications to configured channels
- **File**: `app/api/queue/process/route.ts`

#### 2. Process Error (`process-error`)
- **Trigger**: When an error is captured
- **Actions**: Analyze stack trace, extract source file, determine severity
- **File**: `app/api/queue/process/route.ts`

#### 3. Aggregate Metrics (`aggregate-metrics`)
- **Trigger**: Scheduled or manual
- **Actions**: Calculate error rates, alert trends, system health
- **File**: `app/api/queue/process/route.ts`

#### 4. Acknowledge Alert (`acknowledge-alert`)
- **Trigger**: When user acknowledges an alert
- **Actions**: Log acknowledgment, trigger secondary actions
- **File**: `app/api/queue/process/route.ts`

#### 5. Resolve Alert (`resolve-alert`)
- **Trigger**: When user resolves an alert
- **Actions**: Mark as resolved, log resolution message, notify team
- **File**: `app/api/queue/process/route.ts`

## API Endpoints

### Publish a Job

```typescript
import { publishJob } from '@/lib/qstash';

const messageId = await publishJob({
  type: 'send-alert',
  alertId: 'alert-123',
  channels: ['email', 'slack']
});
```

### Queue Process Endpoint

**POST** `/api/queue/process`
- Receives job from QStash
- Verifies signature via `verifySignatureAppRouter`
- Routes to appropriate handler based on job type
- Returns result JSON

## Monitoring QStash Jobs

### In Dashboard

1. Visit QStash Console: https://console.upstash.com
2. Select your project
3. View job history, success/failure rates, logs
4. Monitor latency and throughput

### In Terminal Logs

Jobs are logged with `[v0]` prefix:

```
[v0] Publishing QStash job...
[v0] Alert notification job queued: alert-xyz
[v0] Processing queue job: send-alert
[v0] Would send notification via email for alert alert-xyz
```

## Graceful Degradation

If QStash credentials are missing:
1. System logs a warning but continues normally
2. Alerts are still created and displayed
3. Jobs won't be queued but the request succeeds
4. Dashboard remains fully functional

This allows development without QStash credentials configured.

## Testing Without QStash

The application works without QStash configured:
- Set `QSTASH_URL` and `QSTASH_TOKEN` to empty strings
- All features work except async job processing
- Logs will show warnings about missing credentials

## Production Considerations

### Reliability

- QStash ensures at-least-once delivery
- Failed jobs are automatically retried
- Set appropriate retry policies in QStash console

### Performance

- Background jobs don't block user requests
- Notification sending happens asynchronously
- Error processing happens in background

### Scalability

- QStash handles millions of messages per day
- Automatic load balancing
- No infrastructure to manage

## Troubleshooting

### Jobs Not Processing

1. Check QSTASH_URL and QSTASH_TOKEN in `.env.local`
2. Verify NEXT_PUBLIC_BASE_URL points to your actual domain
3. Check QStash console for failed jobs and error messages
4. Look for signature verification errors in logs

### Signature Verification Failures

- Ensure QSTASH_TOKEN is correct
- Check that `/api/queue/process` endpoint is public (no auth required)
- Verify request headers match QStash expectations

### Timeout Issues

- Increase handler timeout in `app/api/queue/process/route.ts`
- Simplify job handlers to reduce processing time
- Use QStash retry policy for transient failures

## Security

### Signature Verification

All QStash requests are verified using the `verifySignatureAppRouter` middleware:

```typescript
export const POST = verifySignatureAppRouter(async (request: NextRequest) => {
  // Request is verified and trusted
});
```

### Token Security

- Never commit QSTASH_TOKEN to version control
- Use `.gitignore` for `.env.local`
- Rotate tokens regularly in production
- Use Vercel's environment variable encryption

## Advanced Usage

### Custom Job Types

Add new job types to `lib/qstash.ts`:

```typescript
export type QStashPayload =
  | { type: 'send-alert'; ... }
  | { type: 'my-custom-job'; data: string };
```

Then handle in `app/api/queue/process/route.ts`.

### Scheduled Jobs

Use QStash Scheduled Messages for recurring tasks:

```typescript
await qstashClient.scheduleJSON({
  cron: '0 */6 * * *', // Every 6 hours
  url: `${baseUrl}/api/queue/process`,
  body: { type: 'aggregate-metrics', timeWindow: 3600 },
});
```

## Resources

- [Upstash QStash Docs](https://upstash.com/docs/qstash/features/overview)
- [QStash API Reference](https://upstash.com/docs/qstash/api/messages/create)
- [Next.js Middleware Integration](https://upstash.com/docs/qstash/features/middleware)
