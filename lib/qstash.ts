import { Client } from "@upstash/qstash";

export const qstashClient = new Client({
  baseUrl: process.env.QSTASH_URL!,
  token: process.env.QSTASH_TOKEN!,
});

export type QStashPayload =
  | { type: "send-alert"; alertId: string; channels: string[] }
  | { type: "process-error"; errorId: string; stackTrace: string }
  | { type: "aggregate-metrics"; timeWindow: number }
  | { type: "acknowledge-alert"; alertId: string; userId: string }
  | { type: "resolve-alert"; alertId: string; userId: string; message: string };

export async function publishJob(payload: QStashPayload) {
  if (!process.env.QSTASH_URL || !process.env.QSTASH_TOKEN) {
    console.warn("[v0] QStash not configured, skipping job publish");
    return null;
  }

  try {
    const messageId = await qstashClient.publishJSON({
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/queue/process`,
      body: payload,
    });
    return messageId;
  } catch (error) {
    console.error("[v0] Failed to publish QStash job:", error);
    throw error;
  }
}
