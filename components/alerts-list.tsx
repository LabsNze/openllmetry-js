'use client';

import { Alert } from '@/lib/alert-engine';

interface AlertsListProps {
  alerts: Alert[];
}

export default function AlertsList({ alerts }: AlertsListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-500/20 text-red-500';
      case 'acknowledged':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'resolved':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      {alerts.slice(0, 10).map((alert) => (
        <div
          key={alert.id}
          className="rounded-lg border border-border bg-background p-4 hover:bg-background/80 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                  {alert.status}
                </span>
              </div>
              <h4 className="font-semibold text-foreground">{alert.title}</h4>
              <p className="mt-1 text-sm text-foreground/60">{alert.description}</p>
              {alert.affectedServices.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {alert.affectedServices.map((service) => (
                    <span key={service} className="text-xs bg-surface px-2 py-1 rounded text-foreground/70">
                      {service}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground/50">
                {new Date(alert.triggeredAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
      {alerts.length > 10 && (
        <p className="py-4 text-center text-sm text-foreground/50">
          +{alerts.length - 10} more alerts
        </p>
      )}
    </div>
  );
}
