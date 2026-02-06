import { generateMockTraces } from "@/lib/mock-traces";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const traces = generateMockTraces(50);
  const trace = traces.find((t) => t.traceId === id);

  if (!trace) {
    return Response.json(
      { error: "Trace not found" },
      { status: 404 }
    );
  }

  return Response.json(trace);
}
