"use client";

import { Trace } from "@/lib/tracing-core";
import { formatDistanceToNow } from "date-fns";

interface TraceListProps {
  traces: Trace[];
  selectedTrace: Trace | null;
  onSelectTrace: (trace: Trace) => void;
}

export default function TraceList({
  traces,
  selectedTrace,
  onSelectTrace,
}: TraceListProps) {
  const getStatusColor = (trace: Trace) => {
    const hasError = trace.spans.some((s) => s.status.code === "ERROR");
    return hasError ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
  };

  const getStatusBadge = (trace: Trace) => {
    const hasError = trace.spans.some((s) => s.status.code === "ERROR");
    return hasError ? (
      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
        Error
      </span>
    ) : (
      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
        Success
      </span>
    );
  };

  const getWorkflowName = (trace: Trace) => {
    const workflowSpan = trace.spans.find((s) =>
      s.attributes["traceloop.workflow.name"]
    );
    return (workflowSpan?.attributes["traceloop.workflow.name"] as string) ||
      trace.spans[0]?.name ||
      "Unknown";
  };

  if (traces.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center">
        <p className="text-muted-foreground">No traces available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {traces.map((trace) => (
        <button
          key={trace.traceId}
          onClick={() => onSelectTrace(trace)}
          className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
            selectedTrace?.traceId === trace.traceId
              ? "border-primary bg-primary/10 ring-2 ring-primary"
              : `border-border bg-surface hover:border-primary/50 ${getStatusColor(trace)}`
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {getWorkflowName(trace)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {trace.traceId}
              </p>
            </div>
            {getStatusBadge(trace)}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{trace.spans.length} spans</span>
            <span>{trace.duration}ms</span>
          </div>
        </button>
      ))}
    </div>
  );
}
