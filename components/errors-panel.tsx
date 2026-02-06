'use client';

import { ErrorEvent } from '@/lib/error-monitor';
import { useState } from 'react';

interface ErrorsPanelProps {
  errors: ErrorEvent[];
}

export default function ErrorsPanel({ errors }: ErrorsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'error':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-3">
      {errors.slice(0, 15).map((error) => (
        <div
          key={error.id}
          className="rounded-lg border border-border bg-background p-4 hover:bg-background/80 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpandedId(expandedId === error.id ? null : error.id)}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(error.severity)}`}>
                  {error.type}
                </span>
                <span className="text-xs bg-surface px-2 py-1 rounded text-foreground/70">
                  {error.environment}
                </span>
              </div>
              <h4 className="font-semibold text-foreground line-clamp-2">{error.message}</h4>
              <div className="mt-2 flex items-center gap-4 text-xs text-foreground/50">
                <span>{new Date(error.timestamp).toLocaleTimeString()}</span>
                {error.userId && <span>User: {error.userId}</span>}
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <span className="text-xs bg-surface px-2 py-1 rounded font-medium text-foreground/70">
                #{error.id.slice(-8)}
              </span>
              <span className="text-xs text-foreground/50">
                {error.frequency}x
              </span>
            </div>
          </div>

          {expandedId === error.id && (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {error.stack && (
                <div>
                  <p className="text-xs font-semibold text-foreground/70 mb-2">Stack Trace</p>
                  <pre className="rounded bg-background p-2 text-xs text-foreground/60 overflow-x-auto max-h-32 overflow-y-auto font-mono">
                    {error.stack}
                  </pre>
                </div>
              )}
              {Object.keys(error.context).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground/70 mb-2">Context</p>
                  <pre className="rounded bg-background p-2 text-xs text-foreground/60 font-mono overflow-x-auto">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </div>
              )}
              {error.breadcrumbs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground/70 mb-2">Breadcrumbs</p>
                  <div className="space-y-1 text-xs text-foreground/60">
                    {error.breadcrumbs.slice(-5).map((bc, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-foreground/40">{new Date(bc.timestamp).toLocaleTimeString()}</span>
                        <span className="text-foreground/50">{bc.category}:</span>
                        <span>{bc.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {errors.length > 15 && (
        <p className="py-4 text-center text-sm text-foreground/50">
          +{errors.length - 15} more errors
        </p>
      )}
    </div>
  );
}
