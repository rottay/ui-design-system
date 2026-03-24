# @rottay/core

> **El paquete más importante de todo Rottay.**
>
> Antes de crear cualquier tipo, error, utilidad o patrón, verifica si ya existe aquí.

---

## Ubicación

```
platform/packages/core/
```

---

## Exports Principales (~450)

El paquete exporta todo desde `index.ts`. Las categorías principales son:

| Categoría | Descripción | Link |
|-----------|-------------|------|
| **Types** | Tipos base, TenantContext, Result | [TYPES.md](./TYPES.md) |
| **Patterns** | Result pattern, Factory DI, Decorators | [PATTERNS.md](./PATTERNS.md) |
| **Exceptions** | Errores de dominio e infraestructura | [EXCEPTIONS.md](./EXCEPTIONS.md) |

---

## Quick Reference

### Result Pattern

```typescript
import { success, error, type UseCaseResult } from '@rottay/core';

// En use cases
async execute(input: Input, context: TenantContext): Promise<UseCaseResult<Output>> {
  if (!valid) {
    return error(new ValidationError('Invalid input'));
  }
  return success(result);
}
```

#### Result Pattern Helpers (REVIEW-2026)

`createSuccessResult(data)` and `createErrorResult(code, message, details?)` are convenience
constructors exported from `@rottay/core`. They return a `UseCaseResult<T>` with the shape
`{ success, data?, error?, metadata? }`.

```typescript
import { createSuccessResult, createErrorResult } from '@rottay/core';

// Success
return createSuccessResult({ user, token });

// Error
return createErrorResult('VALIDATION_FAILED', 'Email is required', { field: 'email' });
```

**File:** `platform/packages/core/domain/types/application/use-cases/result.ts`

As of REVIEW-2026, all 8 domain modules (510 use cases) have been migrated to use these helpers.

### Errores

```typescript
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  TenantError
} from '@rottay/core';

// Uso
return error(new NotFoundError('Product', id));
```

### TenantContext

```typescript
import { type TenantContext } from '@rottay/core';

// Siempre requerido en use cases
async execute(input: Input, context: TenantContext): Promise<UseCaseResult<Output>>
```

### Logger

```typescript
import { logger } from '@rottay/core';

logger.info('Operation completed', { productId, tenantId: context.tenantId });
logger.error('Operation failed', { error: err.message });
```

### Database

```typescript
import { db, pool, sql } from '@rottay/core';

// Queries con Drizzle
const result = await db.select().from(products).where(eq(products.id, id));
```

### Cache

```typescript
import { getRedisClient } from '@rottay/core';

const redis = getRedisClient();
await redis.set(key, value, { ex: 3600 });
```

### Utilities

```typescript
import {
  generateUUID,
  withAuditFields,
  createPaginatedResponse
} from '@rottay/core';

const id = generateUUID();
const entity = withAuditFields({ name: 'Test' }, context);
const response = createPaginatedResponse(items, total, page, limit);
```

### EventBus (Domain Events)

Sistema unificado de eventos de dominio con dos modos de entrega:
- **persistent**: BullMQ queue para delivery confiable con retry (compliance, payments)
- **fire-and-forget**: Redis Pub/Sub para eventos real-time (cache invalidation, UI updates)

```typescript
import { publishEvent, getEventBus, type DomainEvent } from '@rottay/core';

// API Simple - publicar evento con contexto
await publishEvent('payments.payment.created', {
  paymentId: payment.id,
  amount: payment.amount,
  currency: 'USD',
}, ctx);

// Suscribirse a eventos
const eventBus = getEventBus();
eventBus.subscribe('payments.*', async (event) => {
  console.log('Payment event:', event.eventType, event.payload);
});

// Para persistent delivery (compliance, audit)
await publishEvent('compliance.kyc.completed', payload, ctx, {
  deliveryMode: 'persistent',
  priority: 1,
});
```

**Event Naming Convention**: `module.aggregate.action`
- Ejemplos: `payments.payment.created`, `identity.user.registered`, `auth.session.created`

#### DomainEvent Type

```typescript
interface DomainEvent {
  eventId: string;            // UUID
  eventType: string;          // module.aggregate.action
  version: string;            // semver (e.g. "1.0.0")
  aggregateId: string;
  aggregateType: string;
  payload: Record<string, unknown>;
  metadata: {
    tenantId: string;
    userId: string;
    companyId: string;
    correlationId: string;
    causationId: string;
    source: string;
    idempotencyKey: string;
    priority: number;
  };
  occurredAt: string;         // ISO 8601 timestamp
}
```

### Event Routing Architecture

After publishing to the main EventBus (`domain-events` queue), `publishEvent()` automatically
routes events to specialized worker queues via the EventRouter:

```
publishEvent() --> EventBus (domain-events queue)
                         |
                   EventRouter.route()
                         |
          +--------------+--------------+--------------+
          v              v              v              v
  compliance-events  communications-events  search-events  realtime-events
          |              |              |              |
  ComplianceWorker  CommsWorker    SearchWorker  RealtimeWorkerManager
```

The EventRouter uses the `EVENT_REGISTRY` (354 configured events) to determine which
specialized queues each event should be routed to. Routing is best-effort: failures
are logged but do not block the main publish flow.

**EVENT_REGISTRY Routing Categories:**

| Category | Queue | Trigger |
|----------|-------|---------|
| `compliance` | `compliance-events` | `compliance: true` in event config |
| `notifications` | `communications-events` | `notifications` config present |
| `webhooks` | `communications-events` | `webhooks` config present |
| `search` | `search-events` | Search indexing config present |
| `realtime` | `realtime-events` | `realtime: true` in event config |

**Key Files:**
- `core/infrastructure/events/publish-event.ts` - Main publish API; calls `EventRouter.route()` after publishing to `domain-events`. Validates payloads against registered schemas before publishing.
- `core/infrastructure/events/event-router.ts` - EventRouter class. Routes to 4 queues: compliance-events, communications-events, search-events, realtime-events.
- `core/infrastructure/events/event-registry.ts` - EVENT_REGISTRY (354 events). Extracted from event-router.ts for maintainability.
- `core/infrastructure/events/publish-only.ts` - Strict publish API that throws on unregistered events (no more silent drops).
- `core/infrastructure/events/event-bus.ts` - BullMQ + Redis Pub/Sub EventBus
- `core/infrastructure/events/realtime-worker-manager.ts` - RealtimeWorkerManager (consumes from `realtime-events`, broadcasts via Redis Pub/Sub)
- `core/infrastructure/events/dlq-monitor.ts` - DLQMonitor (consumes from `domain-events-dlq`, alerting + replay)
- `core/infrastructure/events/event-schemas.ts` - 25 payload schemas for event validation
- `core/infrastructure/events/queue-metrics-collector.ts` - QueueMetricsCollector (throughput, latency, error rates)

### RealtimeWorkerManager (REVIEW-2026 Phase 5)

Consumes from the `realtime-events` BullMQ queue and broadcasts events to connected clients via Redis Pub/Sub on channels following the pattern `realtime:{tenantId}:{channel}`.

```typescript
// Channel pattern
realtime:{tenantId}:{channel}

// Example: a recruiting event for tenant "acme"
realtime:acme:recruiting.candidate.applied
```

This replaces the previous approach where realtime events were published directly via Redis Pub/Sub from the EventRouter. Events now flow through a dedicated BullMQ queue for reliable delivery before being broadcast.

### DLQMonitor (REVIEW-2026 Phase 5)

Monitors the `domain-events-dlq` (Dead Letter Queue) and provides operational tools for failed event management:

| Feature | Description |
|---------|-------------|
| **Alerting** | Threshold-based alerting with cooldown to prevent alert storms |
| **Replay** | `replayEvent(eventId)` re-publishes a single failed event; `replayAll()` replays all DLQ entries |
| **Purge** | Clears DLQ entries after review |
| **Stats** | DLQ depth, failure rates, most common error types |

```typescript
import { getDLQMonitor } from '@rottay/core';

const dlq = getDLQMonitor();
const stats = await dlq.getStats();        // { depth, failureRate, topErrors }
await dlq.replayEvent(eventId);            // Replay single event
await dlq.replayAll();                     // Replay all DLQ events
await dlq.purge();                         // Clear DLQ
```

### Event Schema Validation (REVIEW-2026 Phase 5)

25 payload schemas are registered for critical event types across auth, identity, tenancy, recruiting, and payments modules. `publishEvent()` validates payloads against these schemas before publishing.

- **Non-blocking, warn-only**: Schema validation failures log a warning but do NOT prevent the event from being published. This ensures validation can be rolled out incrementally without breaking existing flows.
- Schemas are registered in `core/infrastructure/events/event-schemas.ts`.

```typescript
// publishEvent() now validates automatically
await publishEvent('auth.session.created', payload, ctx);
// If payload does not match the registered schema for auth.session.created,
// a warning is logged but the event is still published.
```

### QueueMetricsCollector (REVIEW-2026 Phase 5)

Collects operational metrics for all event queues (domain-events, compliance-events, communications-events, search-events, realtime-events):

| Metric | Description |
|--------|-------------|
| **Throughput** | Events processed per second per queue |
| **Latency** | Average, p95, and max processing latency per queue |
| **Error rates** | Failure percentage per queue |

The enhanced `healthCheck()` now includes queue metrics from QueueMetricsCollector alongside the existing Redis ping and job count checks.

```typescript
import { getQueueMetricsCollector } from '@rottay/core';

const metrics = getQueueMetricsCollector();
const report = await metrics.getReport();
// { queues: { 'compliance-events': { throughput, latencyAvg, latencyP95, latencyMax, errorRate }, ... } }
```

### Worker Infrastructure

Domain event workers share common infrastructure built on BullMQ:

| Feature | Configuration |
|---------|---------------|
| Dead Letter Queue | `domain-events-dlq` (monitored by DLQMonitor) |
| Retry attempts | 3 (exponential backoff) |
| Idempotency | `jobId` = `event.eventId` (BullMQ deduplication) |
| Health check | Redis ping + queue job counts + QueueMetricsCollector metrics |

Workers (`ComplianceWorker`, `CommsWorker`, `SearchWorker`, `RealtimeWorkerManager`) consume
from their respective specialized queues. Failed jobs are retried up to 3 times with
exponential backoff before being moved to the DLQ. The DLQMonitor actively monitors the DLQ
with threshold-based alerting and provides replay/purge capabilities.

---

### Connection Pooling (2026-02-06)

The database module now supports configurable connection pooling via environment variables:

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `DATABASE_POOL_SIZE` | 10 | Maximum number of connections in the pool |
| `DATABASE_POOL_MIN` | 2 | Minimum idle connections |
| `DATABASE_POOL_IDLE_TIMEOUT` | 30000 | Idle connection timeout (ms) |
| `DATABASE_POOL_ACQUIRE_TIMEOUT` | 10000 | Max time to acquire a connection (ms) |

```typescript
import { getPoolStats } from '@rottay/core';

// Monitor pool health
const stats = getPoolStats();
// { total, idle, waiting, size, min, idleTimeout, acquireTimeout }
```

**Key file:** `core/infrastructure/database/pool.ts`

---

### Worker/Queue Separation (2026-02-06)

Workers and queue definitions are now separated for Turbopack compatibility. Queue declarations (which only define queue names and options) can be imported without pulling in BullMQ worker dependencies, enabling cleaner code splitting in Next.js builds.

---

### Resilience Infrastructure (2026-02-06 Audit)

#### Database Query Timeouts

All database connections enforce statement-level timeouts to prevent runaway queries:

| Timeout | Value | Configured In |
|---------|-------|---------------|
| `statement_timeout` | 30s | `pg.ts`, `neon.ts`, `router.ts` |
| `lock_timeout` | 10s | `pg.ts`, `neon.ts`, `router.ts` |
| `idle_in_transaction_session_timeout` | 60s | `pg.ts`, `neon.ts`, `router.ts` |

#### BullMQ Default Options

Standardized job and worker options applied across all BullMQ infrastructure:

- **DEFAULT_JOB_OPTIONS**: `attempts: 3`, exponential backoff (1s base), `removeOnComplete: 100`, `removeOnFail: 500`
- **DEFAULT_WORKER_OPTIONS**: `lockDuration: 30000` (30s), `stalledInterval: 15000` (15s)

#### Redis Circuit Breaker (ResilientRedisClient)

`ResilientRedisClient` wraps the standard Redis client with circuit breaker protection (closed/open/half_open states). When the circuit is open, cache operations fail fast and return `null` gracefully.

**Key files:** `core/infrastructure/cache/resilient-redis/`

```typescript
import { getResilientRedisClient } from '@rottay/core';

const redis = getResilientRedisClient();
// Automatically handles circuit breaking -- no code changes needed at call sites
```

#### DLQ Persistence (Write-Through Cache)

Failed events are now persisted to PostgreSQL via the `core_failed_events` table, in addition to the in-memory DLQ. On startup, the DLQ rehydrates from the database to prevent data loss across restarts.

**Key files:** `core/infrastructure/events/persistence/`

#### Health Check Endpoints

All 4 applications expose `/api/health` with standardized DB + Redis checks, uptime, and version info. Returns HTTP 200 (healthy) or HTTP 503 (degraded).

#### Structured Logging

65 `console.log` statements in `platform/core` have been replaced with structured logging via the `logger` from `@rottay/core`, including context (tenantId, correlationId, module).

Additionally, 103 `console.*` statements in `app-platform` have been replaced with structured loggers. New logger namespaces added in app-platform: `identity`, `tenancy`, `permissions`, `navigation`, `featureFlags`.

---

## Estructura del Paquete

```
platform/packages/core/
├── domain/                    # Lógica de dominio pura
│   ├── constants/
│   ├── exceptions/           # DomainError, ValidationError, etc.
│   ├── services/             # Servicios de dominio
│   └── types/                # Tipos core
│
├── application/              # Capa de aplicación
│   ├── base/                 # BaseUseCase, BaseRepository, BaseController
│   ├── decorators/           # @Audit, @Authorize, @Cache, etc.
│   ├── ports/                # Puertos de infraestructura
│   ├── services/             # Servicios de aplicación
│   └── transformers/         # Transformadores de datos
│
├── infrastructure/           # Implementaciones técnicas
│   ├── auth/                 # JWT, sessions
│   ├── cache/                # Redis
│   │   └── resilient-redis/  # Circuit breaker wrapper (closed/open/half_open)
│   ├── database/             # PostgreSQL, Drizzle (with query timeouts)
│   ├── events/               # EventBus (BullMQ + Redis Pub/Sub)
│   │   └── persistence/      # DLQ persistence (core_failed_events table)
│   ├── jobs/                 # BullMQ job queues (with DEFAULT_JOB/WORKER_OPTIONS)
│   ├── middleware/           # HTTP middleware
│   ├── observability/        # Logging, metrics
│   └── tenant/               # Multi-tenancy
│
├── adapters/                 # Adaptadores in/out
│   ├── in/                   # HTTP, WebSocket
│   └── out/                  # External services
│
├── utils/                    # Utilidades
│   ├── context/
│   ├── database/
│   ├── http/
│   ├── json/
│   ├── mappers/
│   ├── string/
│   └── validation/
│
└── index.ts                  # Exports públicos
```

---

### AI Usage Metering (2026-03-09)

Lightweight service for tracking AI provider usage (tokens, cost, latency) per tenant. Records to
the existing `tenancy_usage_events` and `tenancy_usage_monthly` tables.

```typescript
import { trackAIUsage, estimateAICost, setAIMeteringPersistence } from '@rottay/core';
import type { AIUsageEvent, AIProvider, AIOperation } from '@rottay/core';

// 1. Wire up persistence during app init (instrumentation.ts)
import { UsageDatabaseAdapter } from '@rottay/tenancy';
const usageDb = new UsageDatabaseAdapter(db);
setAIMeteringPersistence({
  recordUsageEvent: (event) => usageDb.logUsageEvent(event),
  incrementMonthlyUsage: (tenantId, key, start, end, amount, limit) =>
    usageDb.incrementMonthlyUsage(tenantId, key, start, end, amount, limit),
});

// 2. Track usage after any AI call (fire-and-forget, never blocks)
await trackAIUsage({
  tenantId: context.tenantId,
  provider: 'openai',
  model: 'gpt-4o',
  operation: 'scoring.llm-judge',
  inputTokens: 1500,
  outputTokens: 800,
  latencyMs: 2300,
  userId: context.userId,
  resourceId: scorecardId,
  resourceType: 'scorecard',
});

// 3. Estimate cost for a model
const cost = estimateAICost('gpt-4o', 1500, 800); // USD
```

**Key file:** `core/application/services/ai-metering/index.ts`

| Export | Type | Description |
|--------|------|-------------|
| `trackAIUsage` | function | Record an AI usage event (fire-and-forget) |
| `estimateAICost` | function | Estimate USD cost from model + tokens |
| `setAIMeteringPersistence` | function | Wire up DB adapter during app init |
| `registerModelPricing` | function | Add custom model pricing at runtime |
| `getModelPricing` | function | Get the pricing table (for admin dashboards) |
| `AI_TOKENS_QUOTA_KEY` | const | `'aiTokensPerMonth'` -- the quota key used |

**Integrated in:** dm-scoring `BaseLLMJudgeAdapter` (both `score()` and `extractEvidence()`)

---

## Imports Correctos

```typescript
// CORRECTO: Desde @rottay/core
import { success, error, ValidationError, logger } from '@rottay/core';

// INCORRECTO: Rutas internas
import { ValidationError } from '@rottay/core/domain/exceptions';
```

---

## Dependencias de este Paquete

Todos los otros paquetes de Rottay dependen de `@rottay/core`:

```
@rottay/core  <──  @rottay/auth
              <──  @rottay/identity
              <──  @rottay/permissions
              <──  @rottay/tenancy
              <──  @rottay/compliance
              <──  @rottay/recruiter
              <──  @rottay/scoring
              <──  @rottay/events
              <──  @rottay/bar
              <──  @rottay/staff
              <──  @rottay/payments
              <──  @rottay/ia-chat
              <──  @rottay/web3
```

---

## Database Tables

Schema files located in `platform/packages/core/infrastructure/database/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| AuditLog | `core_audit_logs` | id, tenant_id, user_id, action, resource_type, resource_id, changes, ip_address, user_agent, created_at | Cross-module audit trail for compliance. |
| Webhook | `core_webhooks` | id, tenant_id, url, events, secret, is_active, created_at, updated_at | Tenant-configured webhook endpoints. |
| ProviderConfig | `core_provider_configs` | id, tenant_id, provider_id, config (encrypted), is_active, created_at, updated_at | Generic provider configuration store. |
| QRCode | `core_qr_codes` | id, tenant_id, company_id, type, data, metadata, expires_at, is_active, created_at | QR code generation and tracking. |
