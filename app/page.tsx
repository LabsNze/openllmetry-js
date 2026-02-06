"use client";

import { useEffect, useState } from "react";
import { Trace } from "@/lib/tracing-core";
import TraceList from "@/components/trace-list";
import TraceDetails from "@/components/trace-details";
import Navbar from "@/components/navbar";

export default function Dashboard() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  useEffect(() => {
    fetchTraces();
    const interval = setInterval(fetchTraces, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTraces = async () => {
    try {
      const response = await fetch("/api/traces?limit=20");
      const data = await response.json();
      setTraces(data.traces || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch traces:", error);
      setLoading(false);
    }
  };

  const filteredTraces = traces.filter((trace) => {
    if (filter === "success") {
      return trace.spans.every((s) => s.status.code !== "ERROR");
    }
    if (filter === "error") {
      return trace.spans.some((s) => s.status.code === "ERROR");
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            LLM Traces Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor and analyze LLM application traces powered by OpenLLMetry
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(["all", "success", "error"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f === "all"
                  ? `All (${filteredTraces.length})`
                  : f === "success"
                    ? `Success (${filteredTraces.filter((t) => t.spans.every((s) => s.status.code !== "ERROR")).length})`
                    : `Errors (${filteredTraces.filter((t) => t.spans.some((s) => s.status.code === "ERROR")).length})`}
              </button>
            ))}
          </div>
          <button
            onClick={fetchTraces}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading traces...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <TraceList
                traces={filteredTraces}
                selectedTrace={selectedTrace}
                onSelectTrace={setSelectedTrace}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedTrace ? (
                <TraceDetails trace={selectedTrace} />
              ) : (
                <div className="rounded-lg border border-border bg-surface p-12 text-center">
                  <p className="text-muted-foreground">
                    Select a trace to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
