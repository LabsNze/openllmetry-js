'use client';

import { Alert } from '@/lib/alert-engine';

interface DashboardMetricsProps {
  stats: {
    activeAlerts: number;
    criticalErrors: number;
    errorCount24h: number;
    affectedUsers: number;
    systemHealth: number;
  };
  loading: boolean;
}

export default function DashboardMetrics({ stats, loading }: DashboardMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-6 animate-pulse">
            <div className="h-4 bg-background rounded w-2/3 mb-2"></div>
            <div className="h-8 bg-background rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Active Alerts',
      value: stats.activeAlerts,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      icon: '⚠️',
    },
    {
      label: 'Critical Errors',
      value: stats.criticalErrors,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      icon: '🔥',
    },
    {
      label: 'Errors (24h)',
      value: stats.errorCount24h,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      icon: '❌',
    },
    {
      label: 'Affected Users',
      value: stats.affectedUsers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      icon: '👥',
    },
    {
      label: 'System Health',
      value: `${stats.systemHealth}%`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      icon: '💚',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
      {metrics.map((metric, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground/60 font-medium">{metric.label}</p>
              <p className={`mt-2 text-3xl font-bold ${metric.color}`}>
                {typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString()}
              </p>
            </div>
            <div className={`rounded-lg p-3 text-xl ${metric.bgColor}`}>
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
