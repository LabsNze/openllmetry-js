'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertStatus } from '@/lib/alert-engine';
import { ErrorEvent, ErrorGroup } from '@/lib/error-monitor';
import AlertsList from '@/components/alerts-list';
import ErrorsPanel from '@/components/errors-panel';
import DashboardMetrics from '@/components/dashboard-metrics';
import Navbar from '@/components/navbar';
import Link from 'next/link';

interface DashboardStats {
  activeAlerts: number;
  criticalErrors: number;
  errorCount24h: number;
  affectedUsers: number;
  systemHealth: number;
}

export default function MonitoringDashboard() {
  const [projectId] = useState('default-project');
  const [stats, setStats] = useState<DashboardStats>({
    activeAlerts: 0,
    criticalErrors: 0,
    errorCount24h: 0,
    affectedUsers: 0,
    systemHealth: 95,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Fetch data
    const fetchData = async () => {
      try {
        // Fetch alerts
        const alertsRes = await fetch(`/api/alerts?projectId=${projectId}`);
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
        if (alertsData.stats) {
          setStats((prev) => ({
            ...prev,
            activeAlerts: alertsData.stats.active,
          }));
        }

        // Fetch errors
        const errorsRes = await fetch(`/api/errors?projectId=${projectId}&limit=20`);
        const errorsData = await errorsRes.json();
        setErrors(errorsData.errors || []);
        if (errorsData.stats) {
          setStats((prev) => ({
            ...prev,
            criticalErrors: errorsData.stats.criticalErrors,
            errorCount24h: errorsData.stats.errorCount24h,
            affectedUsers: errorsData.stats.affectedUsers,
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up auto-refresh
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const generateShareLink = async (type: 'dev-link' | 'team-invite') => {
    try {
      const res = await fetch('/api/share/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectName: 'Monitoring Dashboard',
          type,
          accessLevel: 'viewer',
        }),
      });
      const data = await res.json();
      if (data.link) {
        setShareUrl(data.link.url);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Monitoring Dashboard</h1>
            <p className="mt-2 text-foreground/60">Real-time error tracking and alerting</p>
          </div>
          <button
            onClick={() => generateShareLink('dev-link')}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Share Dashboard
          </button>
        </div>

        {/* Metrics Cards */}
        <DashboardMetrics stats={stats} loading={loading} />

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
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

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => generateShareLink('dev-link')}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground hover:bg-surface/80 transition-colors text-sm"
              >
                Generate Dev Link
              </button>
              <button
                onClick={() => generateShareLink('team-invite')}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground hover:bg-surface/80 transition-colors text-sm"
              >
                Send Team Invite
              </button>
              <Link
                href="/dashboard/alert-rules"
                className="block rounded-lg border border-border bg-background px-4 py-2 text-foreground hover:bg-surface/80 transition-colors text-sm text-center"
              >
                Manage Alert Rules
              </Link>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-surface p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Share Dashboard</h3>
            <p className="mb-4 text-foreground/70">Copy this link to share your dashboard:</p>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground/80 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                className="rounded-lg bg-primary px-3 py-2 text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground hover:bg-surface/80 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
