"use client";

import { useEffect, useState } from "react";
import { Trace } from "@/lib/tracing-core";
import Navbar from "@/components/navbar";

interface MetricsData {
  totalTraces: number;
  successTraces: number;
  errorTraces: number;
  averageDuration: number;
  totalTokensUsed: number;
  topModels: Array<{ model: string; count: number }>;
  topWorkflows: Array<{ name: string; count: number }>;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("1h");

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/traces?limit=50");
      const data = await response.json();
      const traces: Trace[] = data.traces || [];

      const calculated = calculateMetrics(traces);
      setMetrics(calculated);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      setLoading(false);
    }
  };

  const calculateMetrics = (traces: Trace[]): MetricsData => {
    const totalTraces = traces.length;
    const successTraces = traces.filter((t) =>
      t.spans.every((s) => s.status.code !== "ERROR")
    ).length;
    const errorTraces = totalTraces - successTraces;

    const durations = traces.map((t) => t.duration);
    const averageDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    const modelCounts: Record<string, number> = {};
    const workflowCounts: Record<string, number> = {};
    let totalTokens = 0;

    traces.forEach((trace) => {
      trace.spans.forEach((span) => {
        const model = span.attributes["gen_ai.request.model"];
        if (model) {
          modelCounts[model as string] = (modelCounts[model as string] || 0) + 1;
        }

        const workflow = span.attributes["traceloop.workflow.name"];
        if (workflow) {
          workflowCounts[workflow as string] =
            (workflowCounts[workflow as string] || 0) + 1;
        }

        const inputTokens =
          (span.attributes["gen_ai.usage.input_tokens"] as number) || 0;
        const outputTokens =
          (span.attributes["gen_ai.usage.output_tokens"] as number) || 0;
        totalTokens += inputTokens + outputTokens;
      });
    });

    const topModels = Object.entries(modelCounts)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topWorkflows = Object.entries(workflowCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTraces,
      successTraces,
      errorTraces,
      averageDuration,
      totalTokensUsed: totalTokens,
      topModels,
      topWorkflows,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const successRate = metrics.totalTraces > 0
    ? Math.round((metrics.successTraces / metrics.totalTraces) * 100)
    : 0;
  const errorRate = 100 - successRate;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            LLM Metrics Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aggregated analytics and performance insights
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Time Range Selector */}
        <div className="mb-8 flex gap-2">
          {(["1h", "24h", "7d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard label="Total Traces" value={metrics.totalTraces} />
          <MetricCard label="Success Rate" value={`${successRate}%`} />
          <MetricCard label="Avg Duration" value={`${metrics.averageDuration}ms`} />
          <MetricCard label="Total Tokens" value={metrics.totalTokensUsed.toLocaleString()} />
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Success/Error Breakdown */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Trace Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-600 font-medium">Successful</span>
                  <span className="text-foreground font-semibold">{metrics.successTraces}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-600 font-medium">Errors</span>
                  <span className="text-foreground font-semibold">{metrics.errorTraces}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${errorRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Token Usage */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Token Usage</h2>
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-600 mb-2">
                {(metrics.totalTokensUsed / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-muted-foreground">total tokens consumed</p>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.totalTraces > 0
                  ? Math.round(metrics.totalTokensUsed / metrics.totalTraces)
                  : 0} tokens per trace
              </p>
            </div>
          </div>
        </div>

        {/* Top Models and Workflows */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Models */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Models</h2>
            {metrics.topModels.length > 0 ? (
              <div className="space-y-3">
                {metrics.topModels.map((model, index) => (
                  <div key={model.model} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {model.model}
                      </code>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {model.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No model data</p>
            )}
          </div>

          {/* Top Workflows */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Workflows</h2>
            {metrics.topWorkflows.length > 0 ? (
              <div className="space-y-3">
                {metrics.topWorkflows.map((workflow, index) => (
                  <div key={workflow.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {workflow.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {workflow.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No workflow data</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
