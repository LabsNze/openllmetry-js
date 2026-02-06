"use client";

import { Trace, TraceSpan, LLMSpanAttributes } from "@/lib/tracing-core";
import { useState } from "react";

interface TraceDetailsProps {
  trace: Trace;
}

export default function TraceDetails({ trace }: TraceDetailsProps) {
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(
    new Set(trace.spans.map((s) => s.id))
  );

  const toggleSpan = (spanId: string) => {
    setExpandedSpans((prev) => {
      const next = new Set(prev);
      if (next.has(spanId)) {
        next.delete(spanId);
      } else {
        next.add(spanId);
      }
      return next;
    });
  };

  const getLLMMetrics = () => {
    const llmSpans = trace.spans.filter((s) =>
      s.attributes[LLMSpanAttributes.REQUEST_TYPE]
    );

    return {
      totalInputTokens: llmSpans.reduce(
        (sum, s) => sum + ((s.attributes[LLMSpanAttributes.USAGE_INPUT_TOKENS] as number) || 0),
        0
      ),
      totalOutputTokens: llmSpans.reduce(
        (sum, s) => sum + ((s.attributes[LLMSpanAttributes.USAGE_OUTPUT_TOKENS] as number) || 0),
        0
      ),
      llmCallCount: llmSpans.length,
    };
  };

  const metrics = getLLMMetrics();

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-muted-foreground mb-1">Duration</p>
          <p className="text-2xl font-bold text-foreground">{trace.duration}ms</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Tokens</p>
          <p className="text-2xl font-bold text-foreground">
            {metrics.totalInputTokens + metrics.totalOutputTokens}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-xs text-muted-foreground mb-1">LLM Calls</p>
          <p className="text-2xl font-bold text-foreground">{metrics.llmCallCount}</p>
        </div>
      </div>

      {/* Trace Info */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Trace Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trace ID:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {trace.traceId}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Spans:</span>
            <span className="font-medium">{trace.spans.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Time:</span>
            <span className="text-xs">
              {new Date(trace.startTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Spans Tree */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Spans</h3>
        <div className="space-y-2">
          {trace.spans.map((span) => (
            <SpanNode
              key={span.id}
              span={span}
              isExpanded={expandedSpans.has(span.id)}
              onToggle={() => toggleSpan(span.id)}
            />
          ))}
        </div>
      </div>

      {/* Token Breakdown */}
      {metrics.totalInputTokens > 0 && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Token Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Input Tokens</span>
                <span className="font-medium">{metrics.totalInputTokens}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${
                      (metrics.totalInputTokens /
                        (metrics.totalInputTokens + metrics.totalOutputTokens)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Output Tokens</span>
                <span className="font-medium">{metrics.totalOutputTokens}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${
                      (metrics.totalOutputTokens /
                        (metrics.totalInputTokens + metrics.totalOutputTokens)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpanNode({
  span,
  isExpanded,
  onToggle,
}: {
  span: TraceSpan;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasDetails =
    Object.keys(span.attributes).length > 0 || span.events.length > 0;

  const getStatusColor = (status: TraceSpan["status"]["code"]) => {
    switch (status) {
      case "OK":
        return "text-green-600";
      case "ERROR":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-start gap-2"
      >
        {hasDetails && (
          <span className="text-xs text-muted-foreground mt-0.5">
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        {!hasDetails && <span className="text-xs text-muted-foreground mt-0.5">•</span>}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-foreground">{span.name}</code>
            <span className={`text-xs font-medium ${getStatusColor(span.status.code)}`}>
              {span.status.code}
            </span>
            <span className="text-xs text-muted-foreground">{span.duration}ms</span>
          </div>
        </div>
      </button>

      {isExpanded && hasDetails && (
        <div className="border-t border-border bg-muted/30 px-3 py-2 text-xs space-y-2">
          {Object.keys(span.attributes).length > 0 && (
            <div>
              <p className="font-semibold text-foreground mb-1">Attributes:</p>
              <div className="space-y-1 ml-2">
                {Object.entries(span.attributes)
                  .slice(0, 5)
                  .map(([key, value]) => (
                    <div key={key} className="text-muted-foreground">
                      <code className="text-xs">{key}:</code>
                      <span className="ml-1">
                        {typeof value === "string"
                          ? value.length > 50
                            ? value.substring(0, 50) + "..."
                            : value
                          : typeof value === "number"
                            ? value
                            : "..."}
                      </span>
                    </div>
                  ))}
                {Object.keys(span.attributes).length > 5 && (
                  <div className="text-muted-foreground">
                    +{Object.keys(span.attributes).length - 5} more attributes
                  </div>
                )}
              </div>
            </div>
          )}
          {span.events.length > 0 && (
            <div>
              <p className="font-semibold text-foreground mb-1">Events ({span.events.length})</p>
              <div className="space-y-1 ml-2">
                {span.events.slice(0, 3).map((event, i) => (
                  <div key={i} className="text-muted-foreground">
                    <code className="text-xs">{event.name}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
