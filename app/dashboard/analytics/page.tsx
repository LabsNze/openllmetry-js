'use client';

import Navbar from '@/components/navbar';
import RealTimeCharts from '@/components/real-time-charts';
import Link from 'next/link';
import { useState } from 'react';

export default function AnalyticsPage() {
  const [projectId] = useState('default-project');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Analytics & Insights</h1>
            <p className="mt-2 text-foreground/60">Real-time trends, error patterns, and system health</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-surface border border-border px-4 py-2 text-foreground hover:bg-surface/80 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Charts Section */}
        <RealTimeCharts projectId={projectId} />

        {/* Insights */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Key Insights</h3>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-500"></span>
                <span>Error rate has increased 15% in the last hour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                <span>TypeError is the most common error type (35% of errors)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-yellow-500"></span>
                <span>242 unique users affected by recent errors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                <span>Average response time increased to 450ms</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Recommendations</h3>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mr-2">→</span>
                <span>Review error logs in the &quot;Error Analysis&quot; section</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mr-2">→</span>
                <span>Set up alerts for TypeError when count exceeds 50</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mr-2">→</span>
                <span>Check database query performance during peak hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mr-2">→</span>
                <span>Consider scaling resources to handle traffic spikes</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
