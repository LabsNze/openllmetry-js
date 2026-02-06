'use client';

import { useEffect, useState } from 'react';

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
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Pulse the live indicator
    const interval = setInterval(() => {
      setIsLive((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="stat-card animate-shimmer">
            <div className="h-4 bg-muted/50 rounded w-2/3 mb-2"></div>
            <div className="h-8 bg-muted/50 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Active Alerts',
      value: stats.activeAlerts,
      severity: stats.activeAlerts > 5 ? 'critical' : stats.activeAlerts > 2 ? 'high' : 'low',
      trend: 'up',
    },
    {
      label: 'Critical Errors',
      value: stats.criticalErrors,
      severity: stats.criticalErrors > 10 ? 'critical' : 'high',
      trend: 'down',
    },
    {
      label: 'Errors (24h)',
      value: stats.errorCount24h,
      severity: stats.errorCount24h > 50 ? 'high' : 'medium',
      trend: 'stable',
    },
    {
      label: 'Affected Users',
      value: stats.affectedUsers,
      severity: stats.affectedUsers > 100 ? 'high' : 'low',
      trend: 'down',
    },
    {
      label: 'System Health',
      value: `${stats.systemHealth}%`,
      severity: stats.systemHealth >= 95 ? 'good' : stats.systemHealth >= 80 ? 'medium' : 'critical',
      trend: 'up',
    },
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-800/50 hover:border-red-700/50';
      case 'high':
        return 'bg-gradient-to-br from-orange-900/30 to-orange-900/10 border-orange-800/50 hover:border-orange-700/50';
      case 'medium':
        return 'bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border-yellow-800/50 hover:border-yellow-700/50';
      case 'good':
        return 'bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-800/50 hover:border-green-700/50';
      default:
        return 'bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-blue-800/50 hover:border-blue-700/50';
    }
  };

  const getValueColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'good':
        return 'text-green-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={`card p-6 transition-all duration-300 ${getSeverityStyles(
            metric.severity
          )}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </p>
            </div>
            {idx === 4 && (
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full transition-opacity ${
                    isLive ? 'bg-green-500 opacity-100' : 'bg-green-500 opacity-40'
                  }`}
                ></span>
                <span className="text-xs text-green-400 font-medium">Live</span>
              </div>
            )}
          </div>
          <p className={`text-2xl md:text-3xl font-bold ${getValueColor(metric.severity)}`}>
            {typeof metric.value === 'string'
              ? metric.value
              : metric.value.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <span>
              {metric.trend === 'up' && '📈'}
              {metric.trend === 'down' && '📉'}
              {metric.trend === 'stable' && '➡️'}
            </span>
            <span>
              {metric.trend === 'up' && 'Increasing'}
              {metric.trend === 'down' && 'Decreasing'}
              {metric.trend === 'stable' && 'Stable'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
