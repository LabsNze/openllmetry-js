# Advanced Monitoring & Alerting Dashboard

A powerful real-time monitoring and alerting system built with Next.js and React. Features comprehensive error detection, alert management, and team collaboration through shareable links.

## Overview

The monitoring dashboard provides enterprise-grade error tracking and alerting capabilities without external dependencies. It includes:

- **Real-time Error Detection**: Automatic error capturing and grouping
- **Alert System**: Customizable alert rules with multiple severity levels
- **Shared Access**: Role-based access control via generated links
- **Analytics**: Real-time charts and insights
- **Breadcrumb Tracking**: User action trails for error context

## Features

### 1. Main Dashboard (`/dashboard`)

The main monitoring hub displays:

- **Key Metrics**:
  - Active alerts count
  - Critical errors
  - Errors in last 24 hours
  - Affected users
  - System health percentage

- **Active Alerts**: Real-time list of all active alerts with actions to acknowledge or resolve
- **Recent Errors**: Latest error events with expandable stack traces and context

### 2. Error Detection & Grouping

Automatic error management features:

- **Error Capturing**: `captureError()` function with full context
- **Smart Grouping**: Similar errors automatically grouped by message hash
- **Frequency Tracking**: Monitor how many times each error occurs
- **Stack Traces**: Full stack trace capture and display
- **Breadcrumbs**: User action history leading to the error

**Capturing an error:**

```typescript
import { captureError } from '@/lib/error-monitor';

try {
  // your code
} catch (error) {
  captureError(
    'project-id',
    error.message,
    error.stack,
    'TypeError',
    { userId: 'user123', context: 'important' },
    'production'
  );
}
```

### 3. Alert System (`/dashboard/alert-rules`)

Comprehensive alert management:

- **Create Alert Rules**: Define conditions that trigger alerts
- **Multiple Severity Levels**: Critical, High, Medium, Low, Info
- **Alert Conditions**:
  - `error_rate_high`: Error rate exceeds threshold
  - `response_time_slow`: Response time degradation
  - `memory_spike`: Memory usage spike
  - `multiple_failures`: Multiple failures in time window
  - `custom`: Custom conditions

**Creating an alert rule:**

```typescript
import { createAlertRule } from '@/lib/alert-engine';

const rule = createAlertRule(
  'project-id',
  'High Error Rate Alert',
  'error_rate_high',
  10, // threshold: 10 errors
  60000, // duration: 1 minute
  'critical',
  ['email', 'slack'] // notification channels
);
```

### 4. Shared Access & Team Collaboration

#### Generate Share Links

Multiple link types for different scenarios:

1. **Dev Links**: For development and testing
2. **Team Invites**: For team member access

**Generating a share link:**

```typescript
import { generateShareLink } from '@/lib/shared-access';

const link = generateShareLink(
  'project-id',
  'dev-link', // or 'team-invite'
  'viewer', // access level: viewer, collaborator, admin
  'user@example.com',
  7 * 24 * 60 * 60 * 1000 // 7 days expiry
);

// Share URL: /shared/{link.id}?token={link.token}
```

#### Access Control

Three permission levels:

- **Viewer**: Read-only access to all monitoring data
- **Collaborator**: Can acknowledge/resolve alerts
- **Admin**: Full access including alert rule management

### 5. Real-time Analytics (`/dashboard/analytics`)

Interactive charts and visualizations:

- **Error & Alert Trends**: 30-minute line chart of error/alert activity
- **Severity Distribution**: Pie chart showing alert distribution by severity
- **Top Error Types**: Bar chart of most common error types
- **Affected Users**: Area chart showing user impact over time

All charts auto-refresh every 30 seconds.

### 6. Shared Dashboard View (`/shared/[linkId]`)

Read-only dashboard accessible via generated links:

- View current metrics and alerts
- Browse error history
- Real-time updates
- No editing capabilities for security

## API Endpoints

### Error Management

**POST /api/errors** - Capture new error
```json
{
  "projectId": "project-id",
  "message": "Error message",
  "stack": "Error stack trace",
  "type": "TypeError",
  "context": { "key": "value" },
  "environment": "production"
}
```

**GET /api/errors** - Fetch project errors
```
?projectId=project-id&limit=50
```

### Alert Management

**GET /api/alerts** - Fetch project alerts
```
?projectId=project-id&status=active
```

**POST /api/alerts** - Create new alert
```json
{
  "projectId": "project-id",
  "title": "Alert Title",
  "description": "Description",
  "severity": "critical",
  "condition": "error_rate_high",
  "metrics": { "errorCount": 10 },
  "affectedServices": ["service-1"]
}
```

**PATCH /api/alerts/[alertId]** - Update alert status
```json
{
  "action": "acknowledge",
  "acknowledgedBy": "user@example.com"
}
```

### Alert Rules

**GET /api/alert-rules** - Fetch alert rules
```
?projectId=project-id
```

**POST /api/alert-rules** - Create new rule
```json
{
  "projectId": "project-id",
  "name": "Rule Name",
  "condition": "error_rate_high",
  "threshold": 10,
  "duration": 60000,
  "severity": "high",
  "channels": ["email", "slack"]
}
```

### Shared Access

**POST /api/share/generate-link** - Generate share link
```json
{
  "projectId": "project-id",
  "projectName": "Project Name",
  "type": "dev-link",
  "accessLevel": "viewer",
  "createdBy": "user@example.com"
}
```

**GET /api/share/[linkId]** - Validate access
```
?token=token123
```

## Data Models

### Error Event

```typescript
interface ErrorEvent {
  id: string;
  projectId: string;
  message: string;
  stack: string;
  type: string;
  severity: 'critical' | 'error' | 'warning';
  context: Record<string, any>;
  timestamp: Date;
  url?: string;
  userId?: string;
  sessionId?: string;
  breadcrumbs: BreadcrumbEntry[];
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  environment: string;
  frequency: number;
}
```

### Alert

```typescript
interface Alert {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  condition: AlertCondition;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  metrics: Record<string, number>;
  affectedServices: string[];
  notificationChannels: string[];
  relatedErrors: string[];
}
```

### Access Link

```typescript
interface AccessLink {
  id: string;
  token: string;
  type: 'dev-link' | 'team-invite' | 'public-url';
  accessLevel: 'viewer' | 'collaborator' | 'admin';
  projectId: string;
  createdAt: Date;
  expiresAt?: Date;
  teamId?: string;
  createdBy: string;
  active: boolean;
  viewCount: number;
}
```

## Workflow Examples

### Setting Up Error Monitoring

1. **Initialize Project**
   ```typescript
   import { createSharedProject } from '@/lib/shared-access';
   createSharedProject('my-project', 'My Project', 'user@example.com');
   ```

2. **Capture Errors**
   ```typescript
   import { captureError } from '@/lib/error-monitor';
   
   try {
     // application code
   } catch (error) {
     captureError('my-project', error.message, error.stack);
   }
   ```

3. **Create Alert Rules**
   ```typescript
   import { createAlertRule } from '@/lib/alert-engine';
   
   createAlertRule(
     'my-project',
     'High Error Rate',
     'error_rate_high',
     5,
     60000,
     'critical'
   );
   ```

4. **Share Dashboard**
   ```typescript
   import { generateShareLink } from '@/lib/shared-access';
   
   const link = generateShareLink('my-project', 'dev-link', 'viewer');
   console.log(`Share: ${window.location.origin}/shared/${link.id}?token=${link.token}`);
   ```

### Handling Alert Acknowledgment

1. **User clicks "Acknowledge"** in dashboard
2. **API updates alert status**: `/api/alerts/[alertId]` with `action: 'acknowledge'`
3. **Alert status changes** from "active" to "acknowledged"
4. **Dashboard updates** in real-time

### Resolving Errors

1. **Fix the underlying issue** in your application
2. **Mark error group as resolved** via error details view
3. **Create team invite** for code review
4. **Deploy fix** and monitor error rates
5. **Verify** via shared dashboard link

## Best Practices

1. **Error Context**: Always include relevant context when capturing errors
2. **Alert Rules**: Don't create too many rules; focus on critical issues
3. **Sharing**: Use time-limited links for security; rotate access regularly
4. **Monitoring**: Check analytics dashboard daily for trends
5. **Response**: Set SLAs for alert acknowledgment and resolution
6. **Documentation**: Document alert rules and their thresholds

## Security Considerations

- **Token-based Access**: Share links include secure, unique tokens
- **Expiring Links**: Generate time-limited links by default
- **Role-based Control**: Viewer-only access for read-only dashboards
- **Revocation**: Immediately revoke access links when needed
- **No Persistence**: Data stored in-memory (production ready for database)

## Future Enhancements

- Database persistence (PostgreSQL, MongoDB)
- Real Slack/Email notifications
- Advanced filtering and search
- Custom metric definitions
- Alert escalation policies
- On-call schedule integration
- Historical data retention
- Export capabilities (CSV, JSON)
- Machine learning anomaly detection

## Support

For issues or questions:
- Check the main README.md
- Review the DASHBOARD.md for trace monitoring
- Create an issue on GitHub

---

Built with Next.js 16, React 19, and Tailwind CSS. Production-ready and fully typed with TypeScript.
