import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import type { QStashPayload } from "@/lib/qstash";

async function handleSendAlert(payload: Extract<QStashPayload, { type: "send-alert" }>) {
  console.log("[v0] Sending alert notifications for:", payload.alertId);
  // Simulate sending to notification channels
  for (const channel of payload.channels) {
    console.log(`[v0] Would send notification via ${channel} for alert ${payload.alertId}`);
  }
  return { success: true, alertId: payload.alertId, channels: payload.channels.length };
}

async function handleProcessError(payload: Extract<QStashPayload, { type: "process-error" }>) {
  console.log("[v0] Processing error:", payload.errorId);
  // Simulate error processing and analysis
  const lines = payload.stackTrace.split("\n");
  const sourceFile = lines.find((l) => l.includes(".ts") || l.includes(".js"))?.match(/at.*\(([^:]+):/)?.[1] || "unknown";
  console.log(`[v0] Error from file: ${sourceFile}`);
  return { success: true, errorId: payload.errorId, sourceFile };
}

async function handleAggregateMetrics(payload: Extract<QStashPayload, { type: "aggregate-metrics" }>) {
  console.log("[v0] Aggregating metrics for window:", payload.timeWindow);
  // Simulate metrics aggregation
  return {
    success: true,
    window: payload.timeWindow,
    totalErrors: Math.floor(Math.random() * 100),
    totalAlerts: Math.floor(Math.random() * 50),
  };
}

async function handleAcknowledgeAlert(payload: Extract<QStashPayload, { type: "acknowledge-alert" }>) {
  console.log(`[v0] Alert ${payload.alertId} acknowledged by user ${payload.userId}`);
  return { success: true, alertId: payload.alertId, acknowledged: true };
}

async function handleResolveAlert(payload: Extract<QStashPayload, { type: "resolve-alert" }>) {
  console.log(`[v0] Alert ${payload.alertId} resolved by user ${payload.userId}`);
  console.log(`[v0] Resolution message: ${payload.message}`);
  return { success: true, alertId: payload.alertId, resolved: true };
}

export const POST = verifySignatureAppRouter(async (request: NextRequest) => {
  try {
    const body = (await request.json()) as QStashPayload;

    console.log("[v0] Processing queue job:", body.type);

    let result;

    switch (body.type) {
      case "send-alert":
        result = await handleSendAlert(body);
        break;
      case "process-error":
        result = await handleProcessError(body);
        break;
      case "aggregate-metrics":
        result = await handleAggregateMetrics(body);
        break;
      case "acknowledge-alert":
        result = await handleAcknowledgeAlert(body);
        break;
      case "resolve-alert":
        result = await handleResolveAlert(body);
        break;
      default:
        return NextResponse.json({ error: "Unknown job type" }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[v0] Queue processing error:", error);
    return NextResponse.json(
      { error: "Failed to process job", details: String(error) },
      { status: 500 }
    );
  }
});
