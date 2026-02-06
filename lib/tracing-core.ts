/**
 * OpenLLMetry Tracing Core
 * Extracted and adapted from the openllmetry-js monorepo
 * Core tracing functionality for LLM applications
 */

export interface TraceSpan {
  id: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  kind: "INTERNAL" | "SERVER" | "CLIENT" | "PRODUCER" | "CONSUMER";
  startTime: number;
  endTime: number;
  duration: number;
  status: {
    code: "UNSET" | "OK" | "ERROR";
    message?: string;
  };
  attributes: Record<string, unknown>;
  events: SpanEvent[];
  links: SpanLink[];
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, unknown>;
}

export interface SpanLink {
  traceId: string;
  spanId: string;
  attributes?: Record<string, unknown>;
}

export interface Trace {
  traceId: string;
  spans: TraceSpan[];
  startTime: number;
  endTime: number;
  duration: number;
}

// LLM-specific attributes based on OpenLLMetry semantic conventions
export const LLMSpanAttributes = {
  // LLM attributes
  REQUEST_MODEL: "gen_ai.request.model",
  RESPONSE_MODEL: "gen_ai.response.model",
  REQUEST_TYPE: "llm.request.type",
  PROMPT: "gen_ai.prompt",
  COMPLETION: "gen_ai.completion",
  
  // Token usage
  USAGE_INPUT_TOKENS: "gen_ai.usage.input_tokens",
  USAGE_OUTPUT_TOKENS: "gen_ai.usage.output_tokens",
  USAGE_TOTAL_TOKENS: "llm.usage.total_tokens",
  USAGE_CACHE_CREATION_INPUT_TOKENS: "gen_ai.usage.cache_creation_input_tokens",
  USAGE_CACHE_READ_INPUT_TOKENS: "gen_ai.usage.cache_read_input_tokens",
  
  // Vector DB attributes
  VECTOR_DB_VENDOR: "db.system",
  VECTOR_DB_TABLE_NAME: "db.vector.table_name",
  VECTOR_DB_QUERY_TOP_K: "db.vector.query.top_k",
  
  // Traceloop-specific
  TRACELOOP_SPAN_KIND: "traceloop.span.kind",
  TRACELOOP_WORKFLOW_NAME: "traceloop.workflow.name",
  TRACELOOP_ENTITY_NAME: "traceloop.entity.name",
  TRACELOOP_ENTITY_INPUT: "traceloop.entity.input",
  TRACELOOP_ENTITY_OUTPUT: "traceloop.entity.output",
};

export class LLMSpan {
  private span: TraceSpan;

  constructor(span: TraceSpan) {
    this.span = span;
  }

  reportRequest({
    model,
    messages,
  }: {
    model: string;
    messages: {
      role: string;
      content?: string | unknown;
    }[];
  }) {
    this.span.attributes[LLMSpanAttributes.REQUEST_MODEL] = model;
    
    messages.forEach((message, index) => {
      this.span.attributes[`${LLMSpanAttributes.PROMPT}.${index}.role`] = message.role;
      this.span.attributes[`${LLMSpanAttributes.PROMPT}.${index}.content`] =
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content);
    });
  }

  reportResponse({
    model,
    usage,
    completions,
  }: {
    model: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    completions?: {
      finish_reason: string;
      message: {
        role: "system" | "user" | "assistant";
        content: string | null;
      };
    }[];
  }) {
    this.span.attributes[LLMSpanAttributes.RESPONSE_MODEL] = model;

    if (usage) {
      this.span.attributes[LLMSpanAttributes.USAGE_INPUT_TOKENS] = usage.prompt_tokens;
      this.span.attributes[LLMSpanAttributes.USAGE_OUTPUT_TOKENS] = usage.completion_tokens;
      this.span.attributes[LLMSpanAttributes.USAGE_TOTAL_TOKENS] = usage.total_tokens;
    }

    completions?.forEach((completion, index) => {
      this.span.attributes[`${LLMSpanAttributes.COMPLETION}.${index}.finish_reason`] =
        completion.finish_reason;
      this.span.attributes[`${LLMSpanAttributes.COMPLETION}.${index}.role`] =
        completion.message.role;
      this.span.attributes[`${LLMSpanAttributes.COMPLETION}.${index}.content`] =
        completion.message.content || "";
    });
  }

  getSpan(): TraceSpan {
    return this.span;
  }
}

export class VectorDBSpan {
  private span: TraceSpan;

  constructor(span: TraceSpan) {
    this.span = span;
  }

  reportQuery({ queryVector }: { queryVector: number[] }) {
    this.span.events.push({
      name: "db.query.embeddings",
      timestamp: Date.now(),
      attributes: {
        "db.query.embeddings.vector": JSON.stringify(queryVector),
      },
    });
  }

  reportResults({
    results,
  }: {
    results: {
      ids?: string;
      scores?: number;
      distances?: number;
      metadata?: Record<string, unknown>;
      vectors?: number[];
      documents?: string;
    }[];
  }) {
    results.forEach((result, index) => {
      this.span.events.push({
        name: "db.query.result",
        timestamp: Date.now(),
        attributes: {
          "db.query.result.id": result.ids,
          "db.query.result.score": result.scores,
          "db.query.result.distance": result.distances,
          "db.query.result.metadata": JSON.stringify(result.metadata),
          "db.query.result.vector": JSON.stringify(result.vectors),
          "db.query.result.document": result.documents,
        },
      });
    });
  }

  getSpan(): TraceSpan {
    return this.span;
  }
}

// Tracer implementation for creating and managing spans
export class SimpleTracer {
  private traces: Map<string, Trace> = new Map();
  private activeSpans: Map<string, TraceSpan> = new Map();

  startSpan(
    name: string,
    traceId: string = this.generateId(),
    parentSpanId?: string,
  ): TraceSpan {
    const span: TraceSpan = {
      id: this.generateId(),
      traceId,
      parentSpanId,
      name,
      kind: "INTERNAL",
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      status: { code: "UNSET" },
      attributes: {},
      events: [],
      links: [],
    };

    this.activeSpans.set(span.id, span);

    // Create or get trace
    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, {
        traceId,
        spans: [],
        startTime: span.startTime,
        endTime: 0,
        duration: 0,
      });
    }

    this.traces.get(traceId)!.spans.push(span);

    return span;
  }

  endSpan(spanId: string) {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.endTime = Date.now();
      span.duration = span.endTime - span.startTime;
      this.activeSpans.delete(spanId);
    }
  }

  getTraces(): Trace[] {
    return Array.from(this.traces.values()).map((trace) => ({
      ...trace,
      endTime: Math.max(...trace.spans.map((s) => s.endTime || s.startTime)),
      duration: Math.max(...trace.spans.map((s) => s.endTime || s.startTime)) - trace.startTime,
    }));
  }

  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  clearTraces() {
    this.traces.clear();
    this.activeSpans.clear();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

export const tracer = new SimpleTracer();
