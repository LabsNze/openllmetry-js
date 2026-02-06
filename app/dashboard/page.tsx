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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Monitoring</h1>
            <p className="mt-2 text-base text-muted-foreground">Real-time error detection and intelligent alerting</p>
          </div>
          <button
            onClick={() => generateShareLink('dev-link')}
            className="btn btn-primary self-start md:self-auto"
          >
            Share Dashboard
          </button>
        </div>

        {/* Metrics Cards */}
        <DashboardMetrics stats={stats} loading={loading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Alerts Section - Main */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Active Alerts</h2>
                  <p className="text-sm text-muted-foreground mt-1">Last 24 hours</p>
                </div>
                <div className="alert-badge alert-critical">
                  {stats.activeAlerts} Active
                </div>
              </div>
              {alerts.length > 0 ? (
                <AlertsList alerts={alerts} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No active alerts</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">Your system is running smoothly</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="card p-6 h-fit">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access</h3>
            <div className="space-y-3">
              <button
                onClick={() => generateShareLink('dev-link')}
                className="w-full btn btn-outline text-sm"
              >
                Generate Dev Link
              </button>
              <button
                onClick={() => generateShareLink('team-invite')}
                className="w-full btn btn-outline text-sm"
              >
                Invite Team Member
              </button>
              <Link
                href="/dashboard/alert-rules"
                className="block w-full text-center btn btn-outline text-sm"
              >
                Manage Rules
              </Link>
              <Link
                href="/dashboard/analytics"
                className="block w-full text-center btn btn-outline text-sm"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Errors Section */}
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recent Errors</h2>
              <p className="text-sm text-muted-foreground mt-1">{stats.errorCount24h} errors in last 24 hours</p>
            </div>
            <div className="alert-badge alert-high">
              {errors.length} shown
            </div>
          </div>
          {errors.length > 0 ? (
            <ErrorsPanel errors={errors} />
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No errors detected</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Keep up the good work</p>
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="card p-6 max-w-md w-full animate-slide-in-up">
            <h3 className="text-xl font-semibold text-foreground mb-4">Share Dashboard</h3>
            <p className="text-sm text-muted-foreground mb-4">Copy this link to share with your team:</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input-base flex-1 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                }}
                className="btn btn-primary btn-sm"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full btn btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
