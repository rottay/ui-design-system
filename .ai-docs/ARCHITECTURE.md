# Rottay Architecture - Reglas Obligatorias

> **Este documento define las reglas arquitecturales que TODOS los módulos deben seguir.**

---

## Arquitectura Base

- **Hexagonal Architecture** (Ports & Adapters)
- **Domain-Driven Design** (DDD)
- **CQRS** (Command Query Responsibility Segregation)

---

## 1. Result Pattern (NO Throws)

**NUNCA usar `throw` para errores de negocio.** Usar el Result Pattern.

> **REVIEW-2026:** Enforced across ALL 8 domain modules (510 use cases migrated).

```typescript
import { createSuccessResult, createErrorResult, type UseCaseResult } from '@rottay/core';

// Success
return createSuccessResult(entity);

// Error
return createErrorResult('PRODUCT/NOT_FOUND', 'Product not found', { id });

// Pattern matching
const result = await useCase.execute(input, context);
if (result.success) {
  // result.data disponible
} else {
  // result.error disponible (code, message, details)
}
```

**Base class variant (dm-payments and similar):** Modules using `BaseMutationUseCase` / `BaseQueryUseCase` call the inherited helpers instead:

```typescript
// Inside a use case extending BaseMutationUseCase or BaseQueryUseCase
return this.createSuccessResult(entity);
return this.createErrorResult('PAYMENT/FAILED', 'Payment processing failed', { transactionId });
```

---

## 2. Multi-Tenancy (OBLIGATORIO)

**TODA query DEBE filtrar por `tenantId`:**

```typescript
// En TODOS los repositorios
.where(and(
  eq(table.id, id),
  eq(table.tenantId, context.tenantId),  // OBLIGATORIO
  eq(table.isActive, true)               // Soft delete
))

// En TODOS los use cases
async execute(input: Input, context: TenantContext): Promise<UseCaseResult<Output>>
```

---

## 3. Audit Fields (OBLIGATORIO)

**TODA entidad DEBE tener estos campos:**

```typescript
interface Entity {
  readonly id: string;
  readonly tenantId: string;
  readonly companyId?: string;      // Opcional según entidad
  readonly isActive: boolean;        // Soft delete
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
  readonly updatedBy: string;
}
```

---

## 4. Soft Delete Only

**NUNCA hard delete. Siempre soft delete:**

```typescript
async softDelete(id: string, tenantId: string, userId: string): Promise<boolean> {
  const result = await this.db.update(products)
    .set({
      isActive: false,
      updatedAt: new Date(),
      updatedBy: userId,  // OBLIGATORIO para auditoría
    })
    .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
    .returning({ id: products.id });
  return result.length > 0;
}
```

---

## 5. Factory DI Pattern

**Factories SOLO en `config/di/`:**

```typescript
// CORRECTO: Factory en config/di/index.ts
export function makeCreateProductUseCase(repo: IProductRepository, logger: Logger) {
  return new CreateProductUseCase(repo, logger);
}

// INCORRECTO: Factory en application layer
// application/use-cases/mutations/product/create/index.ts - NO HACER
export function makeCreateProductUseCase(...) { }
```

---

## 6. Orden de Imports

```typescript
// 1. Node.js built-ins (si aplica)
import { readFile } from 'fs/promises';

// 2. Dependencias externas
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// 3. @rottay/core SIEMPRE PRIMERO de los internos
import { createSuccessResult, createErrorResult, ValidationError, logger } from '@rottay/core';

// 4. Otros @rottay/*
import { Product } from '@rottay/product';

// 5. Imports relativos del módulo actual (@/)
import { ProductRepositoryPort } from '@/application/ports';
import { Product } from '@/domain/entity/product';
```

---

## 7. Error Hierarchy

```
DomainError (base)
├── ValidationError       - Datos inválidos
├── NotFoundError        - Recurso no encontrado
├── ConflictError        - Conflicto de estado
├── TenantError          - Error de tenant
└── InfrastructureError  - Error de infraestructura
```

**Formato de código de error:** `MODULE/ERROR_CODE`
- Ejemplo: `PRODUCT/NOT_FOUND`, `BAR/ORDER_CANCELED`

---

## 8. Estructura de Módulos

```
dm-{name}/
├── domain/                    # Lógica de negocio pura
│   ├── entity/               # Entidades del dominio
│   ├── errors/               # Errores específicos
│   ├── types/                # Tipos (commands, queries)
│   ├── services/             # Servicios de dominio
│   └── value-objects/        # Value objects
│
├── application/              # Casos de uso
│   ├── ports/               # Puertos (interfaces)
│   │   └── interfaces/
│   │       ├── repositories/
│   │       └── services/
│   ├── services/            # Orchestrators
│   └── use-cases/
│       ├── mutations/       # Operaciones de escritura
│       └── queries/         # Operaciones de lectura
│
├── adapters/                 # Implementaciones
│   ├── in/                  # HTTP controllers, DTOs
│   └── out/                 # Persistence, external services
│
├── config/di/               # Dependency injection
├── tests/                   # Tests
└── index.ts                 # Exports públicos
```

---

## 9. Naming Conventions

| Elemento | Patrón | Ejemplo |
|----------|--------|---------|
| Carpetas | kebab-case | `create-product/`, `get-by-id/` |
| Archivos | `index.ts` (SIEMPRE) | `domain/entity/product/index.ts` |
| Interfaces | PascalCase + Port | `ProductRepositoryPort` |
| Clases | PascalCase | `CreateProductUseCase` |
| Funciones | camelCase | `createProduct` |
| Factories | make* prefix | `makeCreateProductUseCase` |
| Constantes | UPPER_SNAKE | `MAX_ITEMS_PER_PAGE` |
| Enums | PascalCase | `ProductStatus` |
| DB Tables | snake_case | `products`, `bar_orders` |
| DB Columns | snake_case | `tenant_id`, `is_active` |
| Errores | MODULE/ERROR | `PRODUCT/NOT_FOUND` |

---

## 10. CQRS Pattern

```typescript
// Queries - Solo lectura, sin side effects
application/use-cases/queries/
├── get-by-id/
├── list/
└── search/

// Mutations - Escritura, con side effects
application/use-cases/mutations/
├── create/
├── update/
└── delete/
```

---

## 11. Import Rules

```typescript
// CORRECTO: Desde barrel exports
import { Product, CreateProductUseCase } from '@rottay/product';

// INCORRECTO: Rutas internas
import { Product } from '@rottay/product/adapters/persistence/schemas';

// CORRECTO: Interno con @/
import { Product } from '@/domain/entity/product';
```

---

## 12. Testing Patterns

| Tipo | Archivo | Base de datos | Mocks |
|------|---------|---------------|-------|
| Unit | `*.test.ts` | No | Sí para todo externo |
| Integration | `*.integration.test.ts` | Real test DB | Solo externos |
| E2E | `*.e2e.test.ts` | Real test DB | Solo externos |

---

## 13. Git Commit Rules

```
Conventional Commits:
feat: nueva funcionalidad
fix: corrección de bug
refactor: refactorización
docs: documentación
test: tests
chore: tareas de mantenimiento

NO incluir "Co-Authored-By" en commits
```

---

## Checklist Pre-Commit

- [ ] ¿Filtra por `tenantId` en todas las queries?
- [ ] ¿Usa Result Pattern en lugar de throw?
- [ ] ¿Tiene audit fields en nuevas entidades?
- [ ] ¿Factories solo en `config/di/`?
- [ ] ¿Imports de @rottay/core primero?
- [ ] ¿Nombres siguen las convenciones?

---

## 14. API Routes - Use Cases Only

**API routes MUST use Use Cases from `@rottay/*` modules, NOT direct database calls.**

```typescript
// CORRECT - Use Case Pattern
import { makeListUsersUseCase } from '@rottay/identity';

async function handler(request: TenantRequest) {
  const useCase = makeListUsersUseCase();
  const result = await useCase.execute(
    { tenantId: request.tenantContext.tenantId },
    request.securityContext
  );
  return NextResponse.json({ success: true, data: result });
}

// INCORRECT - Direct DB Access (violates architecture)
import { db } from '@/lib/db/client';

async function handler(request: TenantRequest) {
  const users = await db.select().from(users); // DON'T DO THIS
}
```

**Reasons:**
- Use Cases contain business logic validation
- Audit logging happens at Use Case level
- Easier to test
- Decouples API from database schema

**See Also:** [Architecture Audit 2026-01](./docs/ARCHITECTURE-AUDIT-2026-01.md)

---

## 15. Super Admin Checks - JWT Only

**Super Admin status MUST be determined solely from JWT claims.**

```typescript
// CORRECT
const userIsSuperAdmin = request.user.isSuperAdmin;

// INCORRECT - Email domain fallback (security risk)
const userIsSuperAdmin = request.user.isSuperAdmin ||
  (request.user.email ? isSuperAdminDomain(request.user.email) : false);
```

**Reason:** Email domains can be spoofed. JWT claims are cryptographically signed.

---

## 16. Event Routing (Domain Events)

**Events published via `publishEvent()` are automatically routed to specialized worker queues.**

> **REVIEW-2026:** EventRouter is now connected to the publish flow. `publishEvent()` in `core/infrastructure/events/publish-event.ts` calls `EventRouter.route()` after publishing, routing events to 4 specialized queues. ComplianceEventWorker now correctly consumes from `compliance-events` (was previously consuming from `domain-events`).
>
> **REVIEW-2026 Phase 5:** Event infrastructure enhanced with: (1) `realtime-events` as 4th routed queue consumed by RealtimeWorkerManager, which broadcasts via Redis Pub/Sub to `realtime:{tenantId}:{channel}`; (2) DLQMonitor actively monitors `domain-events-dlq` with threshold-based alerting (with cooldown), replay (`replayEvent`, `replayAll`), purge, and stats; (3) Event payload validation active for 25 critical event types across auth, identity, tenancy, recruiting, and payments -- non-blocking, warn-only; (4) QueueMetricsCollector tracks throughput, latency (avg, p95, max), and error rates per queue, integrated into `healthCheck()`.

```
publishEvent()  [core/infrastructure/events/publish-event.ts]
       |
       +--> EventBus (domain-events)
       |
       +--> EventRouter.route()
                   |
          +--------+--------+--------+
          v        v        v        v
  compliance   comms    search   realtime
   -events    -events   -events   -events
```

- The `EVENT_REGISTRY` (now in `core/infrastructure/events/event-registry.ts`) defines routing config for 354 events across all modules
- `publishEvent()` first publishes to the main `domain-events` bus, then calls `EventRouter.route()` to fan out to 4 queues. Publishing unregistered events now throws (via `publish-only.ts`) instead of silently dropping them
- `publishEvent()` validates payloads against 25 registered schemas (non-blocking, warn-only) before publishing
- Routing is best-effort: failures are logged but do not block the main publish flow
- Each specialized queue has a dedicated BullMQ worker (ComplianceWorker, CommunicationsWorker, SearchWorker, RealtimeWorkerManager)
- Workers consume ONLY from their specialized queue, NOT from `domain-events`
- DLQMonitor actively consumes from `domain-events-dlq`, providing alerting (threshold-based with cooldown), replay, purge, and stats
- QueueMetricsCollector tracks throughput, latency (avg, p95, max), and error rates per queue; integrated into `healthCheck()`

**Key rule:** Workers must consume from their assigned queue name:
- ComplianceEventWorker --> `compliance-events`
- CommunicationsWorker --> `communications-events`
- SearchWorker --> `search-events`
- RealtimeWorkerManager --> `realtime-events` (broadcasts via Redis Pub/Sub to `realtime:{tenantId}:{channel}`)

---

## 17. Package Dependency Rules

> **REVIEW-2026:** Self-referential package dependencies in `@rottay/auth` and `@rottay/tenancy` have been removed.

**A package MUST NOT depend on itself.** Self-referential dependencies (e.g., `@rottay/auth` listing `@rottay/auth` in its own `package.json` dependencies) cause circular resolution issues and must be avoided.

- Internal imports within a package must use relative paths or `@/` aliases, never the package's own `@rottay/*` name.

---

## 18. Rate Limiting - Dev/Test Mode

> **REVIEW-2026:** Auth login rate limits in dev/test mode reduced from 100x production to 10x production.

| Environment | Per-IP/min | Per-User/min | Per-Tenant/hr |
|-------------|-----------|-------------|--------------|
| Production  | 5         | 10          | 100          |
| Dev/Test    | 50        | 100         | 1000         |

Previously dev/test was 500/1000/10000. The 10x multiplier provides enough headroom for testing while keeping limits realistic.

---

## 19. MDX Rendering (app-platform)

> **REVIEW-2026:** Docs rendering in app-platform now uses `next-mdx-remote/rsc`.

**MDX content MUST be rendered via `next-mdx-remote/rsc`**, not via `dangerouslySetInnerHTML` or client-side compilation.

```typescript
// CORRECT
import { MDXRemote } from 'next-mdx-remote/rsc';

export default function DocPage({ source }: { source: string }) {
  return <MDXRemote source={source} />;
}

// INCORRECT - Security risk, no component mapping
<div dangerouslySetInnerHTML={{ __html: compiledMdx }} />
```

---

## AI Token Economy

### Overview

The Rottay AI Token Economy is a multi-layer system for metering, pricing, and billing AI provider usage across all tenants.

**Core formula:**
```
rottayCost = providerCost * (1 + markupPercent/100) * multiplier * (1 - discountPercent/100)
tokens = rottayCost / tokenRate  (default: 1 token = $0.001 USD)
```

### Architecture Layers

| Layer | Module | Responsibility |
|-------|--------|---------------|
| Pricing Configuration | dm-ia-chat + app-platform | Super admin sets provider rates, markup, discounts (DB-driven, `ai_provider_pricing` + `ai_pricing_config` tables) |
| Cost Engine | dm-ia-chat | `CostCalculatorService` reads rates from DB, applies markup formula, converts USD to Rottay Tokens |
| Provider Settings | dm-ia-chat | `ProviderConfigSchema` with per-provider settings for dynamic UI generation |
| Normalized Output | dm-ia-chat | `ConversationOutput` with `NormalizedTranscript` and `TranscriptTurn` for dm-scoring integration |
| Turn-Aware Scoring | dm-scoring | `Scorable.transcriptTurns`, `Evidence.turnIndex/turnRole` for speaker-attributed evidence |
| Token Wallet | dm-recruiter | `TeamTokenQuota`, `TeamTokenTransaction` -- reserve, consume, settle, refund |
| Token Purchase | dm-recruiter + dm-payments | Purchase tokens individually or as company pool, distribute to teams |
| Admin UI | app-platform | `/admin/ai-pricing` -- rates editor, markup config, token packages |
| Consumer UI | app-bithire | `/settings/billing` -- balance, purchase, distribute, transaction history; AI Studio integration with `QuotaWarning` + `CostEstimator` |

### Self-Hosted Free Tier

Rottay provides self-hosted AI providers on Hetzner GPU (GEX44):
- **TTS**: Qwen3-TTS-0.6B via vLLM (4 GB VRAM)
- **STT**: Faster-Whisper Large V3 Turbo INT8 (3.1 GB VRAM)
- **LLM**: Qwen3-8B AWQ via vLLM (6 GB VRAM)
- **Orchestration**: Pipecat (by Daily.co) via WebRTC

Provider codes: `rottay_tts`, `rottay_stt`, `rottay_voice`. These have $0 provider cost with a flat infra fee (~$0.02/min), resulting in ~14x cheaper interviews vs premium providers.

### Token Flow

```
Estimate -> Reserve -> Consume -> Settle (refund unused)
```

Transaction types: `allocation`, `consumption`, `reservation`, `release`, `transfer`, `adjustment`, `rollover`, `purchase`, `bonus`

### Role-Based Access

| Role | Capabilities |
|------|-------------|
| Super Admin (app-platform) | Configure rates, markup, discounts, token packages |
| Tenant Admin (app-bithire) | Purchase company pool, distribute to teams, view all balances |
| Recruiter (app-bithire) | Purchase own tokens, view own balance, see cost estimates |

---

---

## 20. Connection Pooling (2026-02-06)

Database connections now use a configurable pool. Configuration via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_POOL_SIZE` | 10 | Max connections |
| `DATABASE_POOL_MIN` | 2 | Min idle connections |
| `DATABASE_POOL_IDLE_TIMEOUT` | 30000 | Idle timeout (ms) |
| `DATABASE_POOL_ACQUIRE_TIMEOUT` | 10000 | Acquire timeout (ms) |

Pool stats are available via `getPoolStats()` from `@rottay/core`.

---

## 21. Resilience Infrastructure (2026-02-06 Audit)

### Database Query Timeouts

All database connections enforce query-level timeouts to prevent runaway queries and connection starvation:

| Timeout | Value | Description |
|---------|-------|-------------|
| `statement_timeout` | 30s | Max execution time for any single SQL statement |
| `lock_timeout` | 10s | Max time to wait for a lock |
| `idle_in_transaction_session_timeout` | 60s | Max idle time within a transaction |

Configured in `core/infrastructure/database/pg.ts`, `neon.ts`, and `router.ts`.

### BullMQ Job/Worker Timeouts

All BullMQ workers and jobs enforce standardized timeouts via shared defaults:

```typescript
// DEFAULT_JOB_OPTIONS - applied to all job queues
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 100,
  removeOnFail: 500,
}

// DEFAULT_WORKER_OPTIONS - applied to all workers
{
  lockDuration: 30000,      // 30s lock before stalled
  stalledInterval: 15000,   // Check for stalled jobs every 15s
}
```

Applied across all workers: ComplianceWorker, CommunicationsWorker, SearchWorker, RealtimeWorkerManager.

### DLQ Persistence (Write-Through Cache)

Failed events are now persisted to PostgreSQL in addition to the in-memory DLQ:

- **Table**: `core_failed_events` -- stores failed event payloads, error messages, retry count, and timestamps
- **Pattern**: Write-through caching -- events are written to both the in-memory cache and PostgreSQL on failure
- **Recovery**: On startup, the DLQ rehydrates from the database to prevent data loss across restarts
- **Key files**: `core/infrastructure/events/persistence/`

### Redis Circuit Breaker

The `ResilientRedisClient` wraps the standard Redis client with circuit breaker protection:

| State | Behavior |
|-------|----------|
| `closed` | Normal operation, requests pass through to Redis |
| `open` | All requests fail fast without hitting Redis (after failure threshold exceeded) |
| `half_open` | Allows a probe request through; success closes, failure re-opens |

- **Location**: `core/infrastructure/cache/resilient-redis/`
- **Usage**: All cache operations automatically use the resilient client
- **Fallback**: When the circuit is open, cache misses return `null` gracefully (no thrown errors)

### Health Check Endpoints

All 4 applications (app-platform, app-bithire, app-evnto, app-website) expose `/api/health` endpoints with standardized checks:

```json
{
  "status": "healthy",
  "uptime": 12345,
  "version": "1.0.0",
  "checks": {
    "database": { "status": "healthy", "latency": 12 },
    "redis": { "status": "healthy", "latency": 3 }
  }
}
```

- DB check: executes `SELECT 1` with timeout
- Redis check: executes `PING` with timeout
- Returns HTTP 200 when healthy, HTTP 503 when degraded

### Structured Logging Migration

65 `console.log` statements in `platform/core` replaced with structured logging via the `logger` from `@rottay/core`. All log statements now include context (tenantId, correlationId, module) for observability.

103 `console.*` statements in `app-platform` replaced with structured loggers. New logger namespaces added: `identity`, `tenancy`, `permissions`, `navigation`, `featureFlags`.

---

## 22. Code Structure Improvements (2026-02-06 Audit)

### di.ts Split (app-platform)

The 5,434-line `di.ts` monolith in `app-platform` has been split into 10 focused modules:

| File | Responsibility |
|------|---------------|
| `src/app/lib/di/auth.ts` | Auth use case factories |
| `src/app/lib/di/identity.ts` | Identity use case factories |
| `src/app/lib/di/permissions.ts` | Permissions use case factories |
| `src/app/lib/di/tenancy.ts` | Tenancy use case factories |
| `src/app/lib/di/feature-flags.ts` | Feature flag use case factories |
| `src/app/lib/di/navigation.ts` | Navigation use case factories |
| `src/app/lib/di/app-services.ts` | App-level service factories |
| `src/app/lib/di/shared.ts` | Shared dependencies (db, redis, logger) |
| `src/app/lib/di/init.ts` | Initialization and bootstrapping |
| `src/app/lib/di/index.ts` | Barrel re-export |

### Event Router Registry Split

The `EVENT_REGISTRY` (354 events) has been extracted from `event-router.ts` into a dedicated `event-registry.ts` file for maintainability.

- **Before**: `event-router.ts` contained both routing logic and the full registry
- **After**: `event-registry.ts` contains the 354-event registry; `event-router.ts` imports and uses it

### dm-payments Webhook Split

The 3,361-line webhook handler in `dm-payments` has been split into 5 focused files:

| File | Responsibility |
|------|---------------|
| `stripe.ts` | Stripe webhook processing |
| `crypto.ts` | Crypto payment webhooks |
| `mercadopago.ts` | MercadoPago webhook processing |
| `moonpay.ts` | MoonPay webhook processing |
| `processor.ts` | Shared webhook processing logic |

### Idempotency in dm-payments

Payment, refund, and payout mutations are now wrapped with idempotency protection:

- **IdempotencyPort**: Interface for idempotency key storage and lookup
- **IdempotencyService**: Implementation using database-backed idempotency keys
- **Wrapper**: Decorates payment/refund/payout mutations to prevent duplicate processing
- **Behavior**: If an idempotency key has been seen before, the original result is returned without re-executing the mutation

---

## 23. Strict Event Publishing (2026-02-06)

`publishEvent()` via `publish-only.ts` now **throws** when an event type is not registered in the `EVENT_REGISTRY`. This replaces the previous behavior of silently dropping unregistered events. All event types must be registered before they can be published.

The registry has been expanded to 354 events (from the original 87, through 103+ in the initial audit, to 354 after the full audit pass across all modules).

---

## 24. platform/src/ Removed (2026-02-06)

The standalone API server that previously lived in `platform/src/` (429 routes) has been **deleted**. The `platform/` directory now contains **only** `packages/` (the shared `@rottay/*` modules).

**Before:**
```
platform/
├── src/           # Standalone API server (429 routes) -- DELETED
└── packages/      # @rottay/* modules (auth, identity, etc.)
```

**After:**
```
platform/
└── packages/      # @rottay/* modules (auth, identity, etc.)
```

**app-platform** (the Next.js application) is now the **sole API server** for all platform administration endpoints. There is no separate standalone backend.

---

## 25. app-platform Code Quality Hardening (2026-02-06)

Comprehensive code quality sweep across app-platform:

| Category | Change | Scope |
|----------|--------|-------|
| **Crypto security** | All `Math.random()` replaced with `crypto.randomUUID()` / `crypto.getRandomValues()` | 785+ instances |
| **Structured logging** | All `console.*` replaced with structured loggers | 103 instances |
| **Type safety** | All `as any` replaced with proper types | 82 -> 2 remaining |
| **Error handling** | `handleApiError` added to API routes | 180/184 routes covered |
| **File integrity** | Corrupted files repaired | 31 files |
| **Mock data removal** | Dashboard, sessions, security activity now use real DB queries | 3 sections |
| **Missing imports** | `randomUUID` imports fixed | 14 files |
| **Logger namespaces** | New loggers: identity, tenancy, permissions, navigation, featureFlags | 5 new namespaces |

---

## Related Documents

- [Architecture Audit 2026-01](./docs/ARCHITECTURE-AUDIT-2026-01.md) - Detailed audit of app-platform vs app-bithire
