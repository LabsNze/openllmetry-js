# LLM Traces Dashboard Documentation

A production-ready Next.js/React web dashboard for monitoring LLM application traces. This dashboard extracts and adapts core functionality from the OpenLLMetry project to provide real-time visibility into LLM operations.

## Quick Start

### Installation

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### 1. Traces Dashboard (`/`)
Real-time monitoring of all LLM traces with filtering and search capabilities.

**Features:**
- Live trace list with auto-refresh every 5 seconds
- Filter by status (All, Success, Error)
- Detailed trace information on selection
- Span hierarchy visualization
- Token usage breakdown
- LLM call metrics

### 2. Metrics Dashboard (`/metrics`)
Aggregated analytics and performance insights across all traces.

**Metrics Displayed:**
- Total traces processed
- Success rate percentage
- Average trace duration
- Total tokens consumed
- Top LLM models used
- Top workflows by frequency
- Token distribution (input vs output)

### 3. Real-time Updates
- Automatic trace refresh every 5 seconds
- Live metrics calculation
- Status indicators for error detection

## Architecture

### File Structure

```
├── app/
│   ├── api/
│   │   └── traces/
│   │       ├── route.ts          # GET /api/traces - List traces
│   │       └── [id]/route.ts     # GET /api/traces/[id] - Get trace details
│   ├── layout.tsx                # Root layout with fonts and metadata
│   ├── globals.css               # Design system and tokens
│   ├── page.tsx                  # Traces dashboard
│   └── metrics/
│       └── page.tsx              # Metrics analytics page
├── components/
│   ├── navbar.tsx                # Navigation between pages
│   ├── trace-list.tsx            # Trace list component
│   └── trace-details.tsx         # Trace details viewer
├── lib/
│   ├── tracing-core.ts           # Core tracing types and utilities
│   └── mock-traces.ts            # Mock data generators
└── config files
```

### Core Modules

#### `lib/tracing-core.ts`

Extracted OpenLLMetry core functionality:

```typescript
// Key exports:
- TraceSpan          // Individual span in a trace
- Trace              // Collection of spans
- SpanEvent          // Events within spans
- LLMSpanAttributes  // Semantic conventions
- LLMSpan            // Helper class for LLM spans
- VectorDBSpan       // Helper class for vector DB spans
- SimpleTracer       // Basic tracer implementation
```

**LLM Span Attributes Include:**
- Model names (request/response)
- Token usage (input/output)
- Prompt and completion content
- Vector DB vendor and operations
- Traceloop workflow metadata

#### `lib/mock-traces.ts`

Generates realistic mock traces for testing:

```typescript
// Functions:
- generateMockTraces(count)      // Generate N realistic traces
- generateMockLLMTrace()         // Generate single detailed trace
```

Mock data includes:
- Multiple span types (workflow, LLM, vector DB)
- Varied LLM providers (OpenAI, Anthropic, Google)
- Random token counts
- Success and error scenarios
- Multiple workflows

## Design System

### Color Palette

```css
--background: 0 0% 100%;           /* White */
--foreground: 0 0% 3.6%;          /* Near black */
--surface: 0 0% 97%;              /* Light gray */
--primary: 0 0% 9%;               /* Dark gray/black */
--secondary: 217 91% 60%;          /* Blue */
--accent: 280 85% 65%;             /* Purple */
--destructive: 0 84.2% 60.2%;      /* Red */
```

### Typography

- **Headings**: Geist Sans (bold weights)
- **Body**: Geist Sans (regular weight)
- **Code**: Geist Mono (monospace)

### Layout Approach

- Mobile-first responsive design
- Flexbox for primary layouts
- Grid for multi-column layouts
- Tailwind CSS for styling

## API Endpoints

### List Traces
```
GET /api/traces?limit=20

Response:
{
  "traces": [
    {
      "traceId": "abc123...",
      "spans": [...],
      "startTime": 1704067200000,
      "endTime": 1704067205000,
      "duration": 5000
    }
  ],
  "total": 20
}
```

### Get Trace Details
```
GET /api/traces/[id]

Response:
{
  "traceId": "abc123...",
  "spans": [
    {
      "id": "span-1",
      "traceId": "abc123...",
      "name": "anthropic.chat",
      "kind": "INTERNAL",
      "startTime": 1704067200500,
      "endTime": 1704067202000,
      "duration": 1500,
      "status": { "code": "OK" },
      "attributes": {
        "gen_ai.request.model": "claude-3-opus-20240229",
        "gen_ai.usage.input_tokens": 245,
        "gen_ai.usage.output_tokens": 128
      },
      "events": [],
      "links": []
    }
  ],
  "startTime": 1704067200000,
  "endTime": 1704067205000,
  "duration": 5000
}
```

## Span Types and Attributes

### Workflow Spans
```typescript
{
  name: "workflow.process",
  attributes: {
    "traceloop.span.kind": "workflow",
    "traceloop.workflow.name": "customer_support",
    "service.name": "llm-app"
  }
}
```

### LLM Spans
```typescript
{
  name: "anthropic.chat",
  attributes: {
    "gen_ai.request.model": "claude-3-opus-20240229",
    "gen_ai.response.model": "claude-3-opus-20240229",
    "llm.request.type": "chat",
    "gen_ai.usage.input_tokens": 245,
    "gen_ai.usage.output_tokens": 128,
    "gen_ai.usage.total_tokens": 373,
    "gen_ai.prompt.0.role": "user",
    "gen_ai.prompt.0.content": "Hello!",
    "gen_ai.completion.0.role": "assistant",
    "gen_ai.completion.0.content": "Hi there!",
    "gen_ai.completion.0.finish_reason": "end_turn"
  }
}
```

### Vector DB Spans
```typescript
{
  name: "pinecone.query",
  attributes: {
    "db.system": "pinecone",
    "db.vector.table_name": "documentation",
    "db.vector.query.top_k": 5,
    "db.vector.query.result.matches_length": 3
  },
  events: [
    {
      name: "db.query.embeddings",
      attributes: {
        "db.query.embeddings.vector": "[0.1, 0.2, ...]"
      }
    },
    {
      name: "db.query.result",
      attributes: {
        "db.query.result.id": "doc-123",
        "db.query.result.score": 0.95
      }
    }
  ]
}
```

## Using the Tracing Core

### Basic Usage

```typescript
import { SimpleTracer, LLMSpan } from "@/lib/tracing-core";

// Create tracer instance
const tracer = new SimpleTracer();

// Start a trace
const span = tracer.startSpan("my-operation");
const llmSpan = new LLMSpan(span);

// Report LLM request
llmSpan.reportRequest({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello" }]
});

// Report LLM response
llmSpan.reportResponse({
  model: "gpt-4",
  usage: {
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30
  },
  completions: [{
    finish_reason: "stop",
    message: {
      role: "assistant",
      content: "Hi!"
    }
  }]
});

// End span
tracer.endSpan(span.id);

// Get all traces
const traces = tracer.getTraces();
```

### Vector DB Tracking

```typescript
import { SimpleTracer, VectorDBSpan } from "@/lib/tracing-core";

const tracer = new SimpleTracer();
const span = tracer.startSpan("pinecone.query");
const dbSpan = new VectorDBSpan(span);

// Report query
dbSpan.reportQuery({
  queryVector: [0.1, 0.2, 0.3, ...]
});

// Report results
dbSpan.reportResults({
  results: [
    {
      ids: "doc-1",
      scores: 0.95,
      metadata: { source: "faq.md" }
    }
  ]
});

tracer.endSpan(span.id);
```

## Customization

### Adding Custom Metrics

Edit the `calculateMetrics` function in `app/metrics/page.tsx`:

```typescript
const calculateMetrics = (traces: Trace[]): MetricsData => {
  // Add your custom calculations
  const customMetric = traces.filter(...).length;
  
  return {
    ...existing metrics,
    customMetric
  };
};
```

### Styling Customization

1. **Colors**: Update CSS variables in `app/globals.css`
2. **Fonts**: Modify font imports in `app/layout.tsx`
3. **Components**: Edit component files in `components/`

### Adding New Visualizations

1. Create new component in `components/`
2. Import in page or dashboard
3. Use trace data to populate

Example:
```typescript
import { Trace } from "@/lib/tracing-core";

export function MyVisualization({ traces }: { traces: Trace[] }) {
  // Process trace data
  const data = traces.map(t => ({
    name: getWorkflowName(t),
    duration: t.duration
  }));

  return (
    <div>
      {data.map(item => (
        <div key={item.name}>{item.name}: {item.duration}ms</div>
      ))}
    </div>
  );
}
```

## Performance Considerations

- **Auto-refresh**: Traces refresh every 5 seconds (adjustable)
- **Pagination**: Currently loads up to 50 traces
- **Real-time Updates**: Uses client-side state management
- **Mock Data**: Generated on-demand (no database required)

## Integration with Real OpenLLMetry

To connect with actual OpenLLMetry SDK traces:

1. Replace mock data API with real trace collection
2. Update `/api/traces/route.ts` to fetch from OpenTelemetry collector
3. Implement trace persistence (database)
4. Add authentication/authorization

Example integration:
```typescript
// app/api/traces/route.ts
import { getCollectorTraces } from "@/lib/otel-collector";

export async function GET(request: Request) {
  const traces = await getCollectorTraces();
  return Response.json({ traces });
}
```

## Technologies

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **Utilities**: date-fns for date formatting
- **Standards**: OpenTelemetry semantic conventions

## Troubleshooting

### Traces not loading
- Check browser console for errors
- Verify API endpoint is responding
- Check `/api/traces` endpoint

### Styling issues
- Clear Next.js cache: `rm -rf .next`
- Rebuild Tailwind: included in dev server
- Check CSS variables in browser DevTools

### High memory usage
- Limit mock trace generation
- Implement pagination for large datasets
- Clear old traces periodically

## Contributing

Contributions welcome! Areas for improvement:
- Additional visualizations
- Real-time filtering
- Export functionality
- Advanced query builder
- Performance optimizations

## License

Apache License 2.0 - Extracted from OpenLLMetry project

## Resources

- [OpenLLMetry Docs](https://traceloop.com/docs)
- [OpenTelemetry Docs](https://opentelemetry.io/)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
