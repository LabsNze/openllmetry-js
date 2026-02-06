import { TraceSpan, Trace, LLMSpanAttributes } from "@/lib/tracing-core";

export function generateMockLLMTrace(): Trace {
  const traceId = generateId();
  const now = Date.now();

  const workflowStart = now - 5000;
  const llmStart = workflowStart + 500;
  const llmEnd = llmStart + 1500;
  const vectorDbStart = llmEnd + 200;
  const vectorDbEnd = vectorDbStart + 800;
  const workflowEnd = vectorDbEnd + 300;

  const spans: TraceSpan[] = [
    // Workflow span
    {
      id: generateId(),
      traceId,
      name: "workflow.process",
      kind: "INTERNAL",
      startTime: workflowStart,
      endTime: workflowEnd,
      duration: workflowEnd - workflowStart,
      status: { code: "OK" },
      attributes: {
        [LLMSpanAttributes.TRACELOOP_SPAN_KIND]: "workflow",
        [LLMSpanAttributes.TRACELOOP_WORKFLOW_NAME]: "customer_support",
        "service.name": "llm-app",
      },
      events: [],
      links: [],
    },
    // LLM span
    {
      id: generateId(),
      traceId,
      parentSpanId: generateId(),
      name: "anthropic.chat",
      kind: "INTERNAL",
      startTime: llmStart,
      endTime: llmEnd,
      duration: llmEnd - llmStart,
      status: { code: "OK" },
      attributes: {
        [LLMSpanAttributes.REQUEST_MODEL]: "claude-3-opus-20240229",
        [LLMSpanAttributes.RESPONSE_MODEL]: "claude-3-opus-20240229",
        [LLMSpanAttributes.REQUEST_TYPE]: "chat",
        [LLMSpanAttributes.USAGE_INPUT_TOKENS]: 245,
        [LLMSpanAttributes.USAGE_OUTPUT_TOKENS]: 128,
        [LLMSpanAttributes.USAGE_TOTAL_TOKENS]: 373,
        [`${LLMSpanAttributes.PROMPT}.0.role`]: "system",
        [`${LLMSpanAttributes.PROMPT}.0.content`]:
          "You are a helpful customer support assistant.",
        [`${LLMSpanAttributes.PROMPT}.1.role`]: "user",
        [`${LLMSpanAttributes.PROMPT}.1.content`]:
          "How do I reset my password?",
        [`${LLMSpanAttributes.COMPLETION}.0.role`]: "assistant",
        [`${LLMSpanAttributes.COMPLETION}.0.content`]:
          "To reset your password, please follow these steps...",
        [`${LLMSpanAttributes.COMPLETION}.0.finish_reason`]: "end_turn",
      },
      events: [],
      links: [],
    },
    // Vector DB span
    {
      id: generateId(),
      traceId,
      parentSpanId: generateId(),
      name: "pinecone.query",
      kind: "INTERNAL",
      startTime: vectorDbStart,
      endTime: vectorDbEnd,
      duration: vectorDbEnd - vectorDbStart,
      status: { code: "OK" },
      attributes: {
        [LLMSpanAttributes.VECTOR_DB_VENDOR]: "pinecone",
        [LLMSpanAttributes.VECTOR_DB_TABLE_NAME]: "documentation",
        [LLMSpanAttributes.VECTOR_DB_QUERY_TOP_K]: 5,
        "db.vector.query.result.matches_length": 3,
      },
      events: [
        {
          name: "db.query.embeddings",
          timestamp: vectorDbStart + 100,
          attributes: {
            "db.query.embeddings.vector": JSON.stringify(
              Array(1536)
                .fill(0)
                .map(() => Math.random())
            ),
          },
        },
        {
          name: "db.query.result",
          timestamp: vectorDbStart + 200,
          attributes: {
            "db.query.result.id": "doc-123",
            "db.query.result.score": 0.95,
            "db.query.result.metadata": JSON.stringify({
              source: "faq.md",
              section: "account",
            }),
          },
        },
      ],
      links: [],
    },
  ];

  return {
    traceId,
    spans,
    startTime: workflowStart,
    endTime: workflowEnd,
    duration: workflowEnd - workflowStart,
  };
}

export function generateMockTraces(count: number = 10): Trace[] {
  const traces: Trace[] = [];

  const models = [
    "gpt-4-turbo",
    "claude-3-opus-20240229",
    "gemini-2.0-flash",
  ];
  const vendors = ["anthropic", "openai", "google"];
  const workflows = [
    "customer_support",
    "content_generation",
    "data_analysis",
    "code_review",
  ];
  const statuses: ("OK" | "ERROR")[] = ["OK", "ERROR"];

  for (let i = 0; i < count; i++) {
    const traceId = generateId();
    const now = Date.now() - i * 30000; // Stagger traces by 30 seconds

    const isError = Math.random() > 0.8;
    const status = isError ? "ERROR" : "OK";

    const workflowStart = now - Math.random() * 5000;
    const llmStart = workflowStart + 500;
    const llmDuration = 1000 + Math.random() * 2000;
    const llmEnd = llmStart + llmDuration;

    const model = models[Math.floor(Math.random() * models.length)];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const workflow = workflows[Math.floor(Math.random() * workflows.length)];

    const inputTokens = 100 + Math.floor(Math.random() * 400);
    const outputTokens = 50 + Math.floor(Math.random() * 300);

    const spans: TraceSpan[] = [
      {
        id: generateId(),
        traceId,
        name: `workflow.${workflow}`,
        kind: "INTERNAL",
        startTime: workflowStart,
        endTime: llmEnd + 500,
        duration: llmEnd - workflowStart + 500,
        status: { code: status as "OK" | "ERROR", message: isError ? "Request failed" : undefined },
        attributes: {
          [LLMSpanAttributes.TRACELOOP_SPAN_KIND]: "workflow",
          [LLMSpanAttributes.TRACELOOP_WORKFLOW_NAME]: workflow,
          "service.name": "llm-dashboard",
          "service.version": "1.0.0",
        },
        events: [],
        links: [],
      },
      {
        id: generateId(),
        traceId,
        parentSpanId: generateId(),
        name: `${vendor}.chat`,
        kind: "INTERNAL",
        startTime: llmStart,
        endTime: llmEnd,
        duration: llmDuration,
        status: { code: status as "OK" | "ERROR" },
        attributes: {
          [LLMSpanAttributes.REQUEST_MODEL]: model,
          [LLMSpanAttributes.RESPONSE_MODEL]: model,
          [LLMSpanAttributes.REQUEST_TYPE]: "chat",
          [LLMSpanAttributes.USAGE_INPUT_TOKENS]: inputTokens,
          [LLMSpanAttributes.USAGE_OUTPUT_TOKENS]: outputTokens,
          [LLMSpanAttributes.USAGE_TOTAL_TOKENS]: inputTokens + outputTokens,
        },
        events: [],
        links: [],
      },
    ];

    traces.push({
      traceId,
      spans,
      startTime: workflowStart,
      endTime: llmEnd + 500,
      duration: llmEnd - workflowStart + 500,
    });
  }

  return traces;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}
