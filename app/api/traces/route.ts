import { generateMockTraces, generateMockLLMTrace } from "@/lib/mock-traces";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");

  const traces = generateMockTraces(limit);

  return Response.json({
    traces,
    total: traces.length,
  });
}
