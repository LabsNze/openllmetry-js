'use client';

import { useState, useEffect } from 'react';
import { AlertRule, Alert } from '@/lib/alert-engine';
import Navbar from '@/components/navbar';
import Link from 'next/link';

export default function AlertRulesPage() {
  const [projectId] = useState('default-project');
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    condition: 'error_rate_high' as const,
    threshold: 5,
    duration: 60000,
    severity: 'high' as const,
    channels: [] as string[],
  });

  useEffect(() => {
    fetchRulesAndAlerts();
  }, []);

  const fetchRulesAndAlerts = async () => {
    try {
      const res = await fetch(`/api/alerts?projectId=${projectId}`);
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/alert-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          ...formData,
        }),
      });

      if (res.ok) {
        setFormData({
          name: '',
          condition: 'error_rate_high',
          threshold: 5,
          duration: 60000,
          severity: 'high',
          channels: [],
        });
        setShowNewRuleForm(false);
        fetchRulesAndAlerts();
      }
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge',
          acknowledgedBy: 'user',
        }),
      });
      fetchRulesAndAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve' }),
      });
      fetchRulesAndAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Alert Management</h1>
            <p className="mt-2 text-foreground/60">Configure alert rules and manage notifications</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-surface border border-border px-4 py-2 text-foreground hover:bg-surface/80 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Active Alerts */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-surface p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">Active Alerts</h2>
              </div>
              {alerts.filter((a) => a.status === 'active').length > 0 ? (
                <div className="space-y-3">
                  {alerts
                    .filter((a) => a.status === 'active')
                    .map((alert) => (
                      <div key={alert.id} className="rounded-lg bg-background p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{alert.title}</h3>
                            <p className="mt-1 text-sm text-foreground/60">{alert.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="px-3 py-1 rounded text-sm bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                            >
                              Acknowledge
                            </button>
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="px-3 py-1 rounded text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="py-8 text-center text-foreground/50">No active alerts</p>
              )}
            </div>
          </div>

          {/* New Rule Form */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <button
              onClick={() => setShowNewRuleForm(!showNewRuleForm)}
              className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
            >
              {showNewRuleForm ? 'Cancel' : 'Create Alert Rule'}
            </button>

            {showNewRuleForm && (
              <form onSubmit={handleCreateRule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm"
                    placeholder="e.g., High Error Rate"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm"
                  >
                    <option>error_rate_high</option>
                    <option>response_time_slow</option>
                    <option>memory_spike</option>
                    <option>multiple_failures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Rule'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
