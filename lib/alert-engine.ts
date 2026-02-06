// Real-time alert detection and management engine
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'active' | 'resolved' | 'acknowledged';
export type AlertCondition = 'error_rate_high' | 'response_time_slow' | 'memory_spike' | 'multiple_failures' | 'custom';

export interface Alert {
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

export interface AlertRule {
  id: string;
  projectId: string;
  name: string;
  condition: AlertCondition;
  threshold: number;
  duration: number; // milliseconds
  severity: AlertSeverity;
  enabled: boolean;
  notificationChannels: string[];
  createdAt: Date;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  channel: string; // 'email', 'slack', 'webhook', 'in-app'
  message: string;
  sent: boolean;
  sentAt?: Date;
  recipient?: string;
}

// In-memory storage
const alerts = new Map<string, Alert>();
const alertRules = new Map<string, AlertRule>();
const alertNotifications = new Map<string, AlertNotification>();
const alertHistory = new Map<string, Alert[]>();

export function createAlert(
  projectId: string,
  title: string,
  description: string,
  severity: AlertSeverity,
  condition: AlertCondition,
  metrics: Record<string, number>,
  affectedServices: string[]
): Alert {
  const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const alert: Alert = {
    id,
    projectId,
    title,
    description,
    severity,
    status: 'active',
    condition,
    triggeredAt: new Date(),
    metrics,
    affectedServices,
    notificationChannels: [],
    relatedErrors: [],
  };

  alerts.set(id, alert);

  // Add to history
  if (!alertHistory.has(projectId)) {
    alertHistory.set(projectId, []);
  }
  alertHistory.get(projectId)!.push(alert);

  return alert;
}

export function createAlertRule(
  projectId: string,
  name: string,
  condition: AlertCondition,
  threshold: number,
  duration: number,
  severity: AlertSeverity,
  notificationChannels: string[] = []
): AlertRule {
  const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const rule: AlertRule = {
    id,
    projectId,
    name,
    condition,
    threshold,
    duration,
    severity,
    enabled: true,
    notificationChannels,
    createdAt: new Date(),
  };

  alertRules.set(id, rule);
  return rule;
}

export function getAlert(alertId: string): Alert | null {
  return alerts.get(alertId) || null;
}

export function getAlertsByProject(projectId: string, status?: AlertStatus): Alert[] {
  const projectAlerts = Array.from(alerts.values()).filter(
    (alert) => alert.projectId === projectId
  );
  if (status) {
    return projectAlerts.filter((alert) => alert.status === status);
  }
  return projectAlerts;
}

export function acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
  const alert = alerts.get(alertId);
  if (alert) {
    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;
    return true;
  }
  return false;
}

export function resolveAlert(alertId: string): boolean {
  const alert = alerts.get(alertId);
  if (alert) {
    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    return true;
  }
  return false;
}

export function addRelatedError(alertId: string, errorId: string): boolean {
  const alert = alerts.get(alertId);
  if (alert && !alert.relatedErrors.includes(errorId)) {
    alert.relatedErrors.push(errorId);
    return true;
  }
  return false;
}

export function getAlertRulesByProject(projectId: string): AlertRule[] {
  return Array.from(alertRules.values()).filter(
    (rule) => rule.projectId === projectId
  );
}

export function updateAlertRule(
  ruleId: string,
  updates: Partial<AlertRule>
): boolean {
  const rule = alertRules.get(ruleId);
  if (rule) {
    Object.assign(rule, updates);
    return true;
  }
  return false;
}

export function deleteAlertRule(ruleId: string): boolean {
  return alertRules.delete(ruleId);
}

export function createAlertNotification(
  alertId: string,
  channel: string,
  message: string,
  recipient?: string
): AlertNotification {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const notification: AlertNotification = {
    id,
    alertId,
    channel,
    message,
    sent: false,
    recipient,
  };

  alertNotifications.set(id, notification);
  return notification;
}

export function markNotificationAsSent(notificationId: string): boolean {
  const notification = alertNotifications.get(notificationId);
  if (notification) {
    notification.sent = true;
    notification.sentAt = new Date();
    return true;
  }
  return false;
}

export function getAlertNotifications(alertId: string): AlertNotification[] {
  return Array.from(alertNotifications.values()).filter(
    (notif) => notif.alertId === alertId
  );
}

export function getAlertHistory(projectId: string, limit: number = 100): Alert[] {
  const history = alertHistory.get(projectId) || [];
  return history.slice(-limit);
}

export function getAlertStats(projectId: string): {
  active: number;
  resolved: number;
  acknowledged: number;
  bySeverity: Record<AlertSeverity, number>;
} {
  const projectAlerts = getAlertsByProject(projectId);
  const stats = {
    active: projectAlerts.filter((a) => a.status === 'active').length,
    resolved: projectAlerts.filter((a) => a.status === 'resolved').length,
    acknowledged: projectAlerts.filter((a) => a.status === 'acknowledged').length,
    bySeverity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    } as Record<AlertSeverity, number>,
  };

  projectAlerts.forEach((alert) => {
    stats.bySeverity[alert.severity]++;
  });

  return stats;
}
