import { z } from 'zod';
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// --- Components / Schemas ---

export const ErrorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    error: z.string(),
    details: z.any().optional(),
  })
);

export const ScoreBreakdownItemSchema = registry.register(
  'ScoreBreakdownItem',
  z.object({
    label: z.string(),
    points: z.number(),
    max: z.number(),
    note: z.string(),
  })
);

export const CodexScoreSchema = registry.register(
  'CodexScore',
  z.object({
    score: z.number().min(0).max(100),
    breakdown: z.array(ScoreBreakdownItemSchema),
  })
);

export const ItemSchema = registry.register(
  'Item',
  z.object({
    id: z.number().int(),
    name: z.string(),
    brand: z.string().nullable().optional(),
    price: z.union([z.number(), z.string()]),
    currency: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
    category_id: z.number().int().optional().nullable(),
    specs: z.record(z.string(), z.any()).optional().nullable(),
    status: z.string().optional().nullable(),
    source_url: z.string().optional().nullable(),
    last_verified_at: z.string().optional().nullable(),
    created_at: z.string().optional().nullable(),
    codexScore: CodexScoreSchema.optional(),
  })
);

export const BrandCountSchema = registry.register(
  'BrandCount',
  z.object({
    name: z.string().optional(),
    brand: z.string().optional(),
    count: z.number().int(),
  })
);

export const PriceHistorySchema = registry.register(
  'PriceHistory',
  z.object({
    id: z.number().int().optional(),
    item_id: z.number().int(),
    price: z.number(),
    recorded_at: z.string(),
  })
);

export const ChatMessageSchema = registry.register(
  'ChatMessage',
  z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })
);

export const ChatRequestSchema = registry.register(
  'ChatRequest',
  z.object({
    message: z.string().min(1).max(2000),
    context: z.record(z.string(), z.any()).optional().nullable(),
    history: z.array(ChatMessageSchema).max(8).optional(),
  })
);

export const ChatResponseSchema = registry.register(
  'ChatResponse',
  z.object({
    reply: z.string(),
  })
);

export const RecommendRequestSchema = registry.register(
  'RecommendRequest',
  z.object({
    budget: z.number().positive().optional(),
    priorities: z.array(z.string()).max(3).optional(),
    freeText: z.string().max(500).optional(),
  })
);

export const PickItemSchema = registry.register(
  'PickItem',
  ItemSchema.extend({
    reason: z.string().optional(),
  })
);

export const RecommendResponseSchema = registry.register(
  'RecommendResponse',
  z.object({
    picks: z.array(PickItemSchema),
    reasoning: z.string(),
  })
);

export const ExplainRequestSchema = registry.register(
  'ExplainRequest',
  z.object({
    key: z.string().min(1).max(40),
    value: z.string().min(1).max(120),
  })
);

export const ExplainResponseSchema = registry.register(
  'ExplainResponse',
  z.object({
    explanation: z.string(),
    cached: z.boolean(),
  })
);

export const WatchlistUpsertRequestSchema = registry.register(
  'WatchlistUpsertRequest',
  z.object({
    itemId: z.union([z.number().int().positive(), z.string()]),
    targetPrice: z.union([z.number().positive(), z.string()]).optional().nullable(),
  })
);

export const WatchlistItemSchema = registry.register(
  'WatchlistItem',
  z.object({
    userId: z.string(),
    itemId: z.number().int(),
    targetPrice: z.number().nullable().optional(),
    notifiedAt: z.string().nullable().optional(),
    createdAt: z.string(),
    item: z.any().nullable().optional(),
    name: z.string(),
    brand: z.string(),
    price: z.number(),
  })
);

// --- Path Registrations ---

// GET /api/v1/items
registry.registerPath({
  method: 'get',
  path: '/api/v1/items',
  summary: 'List catalog items with explainable Codex score',
  parameters: [
    {
      name: 'category',
      in: 'query',
      required: false,
      schema: { type: 'integer' },
      description: 'Filter by category ID (e.g. 1 for Mobiles)',
    },
    {
      name: 'brand',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: 'Filter by manufacturer name (case-insensitive)',
    },
    {
      name: 'search',
      in: 'query',
      required: false,
      schema: { type: 'string' },
      description: 'Search device name, brand, or description',
    },
    {
      name: 'limit',
      in: 'query',
      required: false,
      schema: { type: 'integer', default: 100 },
    },
    {
      name: 'offset',
      in: 'query',
      required: false,
      schema: { type: 'integer', default: 0 },
    },
  ],
  responses: {
    200: {
      description: 'List of devices with calculated Codex score',
      content: {
        'application/json': {
          schema: z.array(ItemSchema),
        },
      },
    },
    500: {
      description: 'Server error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// GET /api/v1/items/brands
registry.registerPath({
  method: 'get',
  path: '/api/v1/items/brands',
  summary: 'List distinct brands and item counts',
  responses: {
    200: {
      description: 'Brand counts list',
      content: {
        'application/json': {
          schema: z.array(BrandCountSchema),
        },
      },
    },
  },
});

// GET /api/v1/items/{id}
registry.registerPath({
  method: 'get',
  path: '/api/v1/items/{id}',
  summary: 'Get item details and Codex score by ID',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'integer' },
    },
  ],
  responses: {
    200: {
      description: 'Single item with Codex score and breakdown',
      content: {
        'application/json': {
          schema: ItemSchema,
        },
      },
    },
    404: {
      description: 'Item not found',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// GET /api/v1/items/{id}/history
registry.registerPath({
  method: 'get',
  path: '/api/v1/items/{id}/history',
  summary: 'Get 12-week price history for an item',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'integer' },
    },
  ],
  responses: {
    200: {
      description: 'Chronological price points',
      content: {
        'application/json': {
          schema: z.array(PriceHistorySchema),
        },
      },
    },
  },
});

// POST /api/v1/ai/chat
registry.registerPath({
  method: 'post',
  path: '/api/v1/ai/chat',
  summary: 'Synchronous AI chat consultation',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ChatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'AI response message',
      content: {
        'application/json': {
          schema: ChatResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    429: {
      description: 'Rate limit exceeded (10 req/min)',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// POST /api/v1/ai/chat/stream
registry.registerPath({
  method: 'post',
  path: '/api/v1/ai/chat/stream',
  summary: 'Streaming AI chat consultation via Server-Sent Events (SSE)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ChatRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'SSE stream: data: {"token":"..."}\\n\\n ... data: [DONE]',
      content: {
        'text/event-stream': {
          schema: z.string(),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// POST /api/v1/ai/recommend
registry.registerPath({
  method: 'post',
  path: '/api/v1/ai/recommend',
  summary: 'AI device recommendation based on budget and priorities',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RecommendRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Ranked top-3 recommendations from catalog',
      content: {
        'application/json': {
          schema: RecommendResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// POST /api/v1/ai/explain
registry.registerPath({
  method: 'post',
  path: '/api/v1/ai/explain',
  summary: 'Plain-English explanation of technical specs (cached for 7 days)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ExplainRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Specification explanation',
      content: {
        'application/json': {
          schema: ExplainResponseSchema,
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// GET /api/v1/watchlist
registry.registerPath({
  method: 'get',
  path: '/api/v1/watchlist',
  summary: 'Get user watchlist items (Requires Supabase JWT Bearer)',
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'User watchlist items',
      content: {
        'application/json': {
          schema: z.array(WatchlistItemSchema),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// POST /api/v1/watchlist
registry.registerPath({
  method: 'post',
  path: '/api/v1/watchlist',
  summary: 'Upsert item to watchlist (Requires Supabase JWT Bearer)',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: WatchlistUpsertRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Watchlist updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.any(),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

// DELETE /api/v1/watchlist/{itemId}
registry.registerPath({
  method: 'delete',
  path: '/api/v1/watchlist/{itemId}',
  summary: 'Remove item from watchlist (Requires Supabase JWT Bearer)',
  security: [{ BearerAuth: [] }],
  parameters: [
    {
      name: 'itemId',
      in: 'path',
      required: true,
      schema: { type: 'integer' },
    },
  ],
  responses: {
    200: {
      description: 'Item removed',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Spec Codex API',
      version: '1.0.0',
      description:
        'RESTful API for the Spec Codex device knowledge catalog, explainable score engine, and Oracle AI reasoning.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
      {
        url: 'https://specpedia-api.onrender.com',
        description: 'Production Server',
      },
    ],
  });
}

export default generateOpenAPIDocument;
