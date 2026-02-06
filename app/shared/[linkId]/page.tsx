'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert } from '@/lib/alert-engine';
import { ErrorEvent } from '@/lib/error-monitor';
import AlertsList from '@/components/alerts-list';
import ErrorsPanel from '@/components/errors-panel';
import DashboardMetrics from '@/components/dashboard-metrics';

interface SharedStats {
  activeAlerts: number;
  criticalErrors: number;
  errorCount24h: number;
  affectedUsers: number;
  systemHealth: number;
}

export default function SharedDashboard({ params }: { params: { linkId: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [authorized, setAuthorized] = useState(false);
  const [projectId, setProjectId] = useState<string>('');
  const [stats, setStats] = useState<SharedStats>({
    activeAlerts: 0,
    criticalErrors: 0,
    errorCount24h: 0,
    affectedUsers: 0,
    systemHealth: 95,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const res = await fetch(`/api/share/${params.linkId}?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setProjectId(data.access.projectId);
          setAuthorized(true);
        } else {
          setError('Invalid or expired link');
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to verify access');
        setLoading(false);
      }
    };

    verifyAccess();
  }, [params.linkId, token]);

  useEffect(() => {
    if (!authorized || !projectId) return;

    const fetchData = async () => {
      try {
        const [alertsRes, errorsRes] = await Promise.all([
          fetch(`/api/alerts?projectId=${projectId}`),
          fetch(`/api/errors?projectId=${projectId}&limit=20`),
        ]);

        const alertsData = await alertsRes.json();
        const errorsData = await errorsRes.json();

        setAlerts(alertsData.alerts || []);
        setErrors(errorsData.errors || []);

        if (alertsData.stats) {
          setStats((prev) => ({
            ...prev,
            activeAlerts: alertsData.stats.active,
          }));
        }

        if (errorsData.stats) {
          setStats((prev) => ({
            ...prev,
            criticalErrors: errorsData.stats.criticalErrors,
            errorCount24h: errorsData.stats.errorCount24h,
            affectedUsers: errorsData.stats.affectedUsers,
          }));
        }
      } catch (error) {
        console.error('Error fetching shared dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [authorized, projectId]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-foreground/60">{error}</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="rounded-lg border border-border bg-surface p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="mt-4 text-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Shared Monitoring Dashboard</h1>
          <p className="mt-1 text-foreground/60">Real-time error tracking and alerting (Read-only)</p>
        </div>
      </header>

      <main className="p-8">
        {/* Metrics Cards */}
        <DashboardMetrics stats={stats} loading={loading} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-8">
          {/* Alerts Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Active Alerts</h2>
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                  {stats.activeAlerts} Active
                </span>
              </div>
              {alerts.length > 0 ? (
                <AlertsList alerts={alerts} />
              ) : (
                <p className="py-8 text-center text-foreground/50">No active alerts</p>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Dashboard Info</h3>
            <div className="space-y-4 text-sm text-foreground/70">
              <div>
                <p className="font-medium text-foreground/90">Status</p>
                <p>Read-only shared view</p>
              </div>
              <div>
                <p className="font-medium text-foreground/90">Auto-refresh</p>
                <p>Every 5 seconds</p>
              </div>
              <div>
                <p className="font-medium text-foreground/90">Updated</p>
                <p>{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Errors Section */}
        <div className="mt-8 rounded-lg border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Errors</h2>
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
              {stats.errorCount24h} in 24h
            </span>
          </div>
          {errors.length > 0 ? (
            <ErrorsPanel errors={errors} />
          ) : (
            <p className="py-8 text-center text-foreground/50">No errors detected</p>
          )}
        </div>
      </main>
    </div>
  );
}
