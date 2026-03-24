# Domain Modules (dm-*)

> **Módulos de dominio - Lógica de negocio independiente por vertical**

---

## Ubicación

```
Rottay/
├── dm-recruiter/    # ATS - Applicant Tracking System
├── dm-scoring/      # LLM-as-Judge - Evaluación con IA
├── dm-ia-chat/      # Chat con inteligencia artificial
├── dm-events/       # Gestión de eventos y ticketing
├── dm-bar/          # Bar e inventario
├── dm-staff/        # Personal y scheduling
├── dm-payments/     # Procesamiento de pagos
├── dm-web3/         # NFTs, tokens, blockchain
└── dm-template/     # Template de referencia
```

---

## Resumen de Módulos

| Modulo | Use Cases | Factories | Entities | Orchestrators | Vertical |
|--------|-----------|-----------|----------|---------------|----------|
| [recruiter](./recruiter/USE-CASES.md) | 129 | 129 | 20 | 11 | BitHire |
| [ia-chat](./ia-chat/USE-CASES.md) | 140 | 140 | 9 | 3 | BitHire |
| [scoring](./scoring/USE-CASES.md) | 53 | 53 | 12 | 0 | BitHire |
| [events](./events/USE-CASES.md) | 83 | 83 | 35 | 0 | Evnto |
| [bar](./bar/USE-CASES.md) | 76 | 76 | 18 | 4 | Evnto |
| [staff](./staff/USE-CASES.md) | 70 | 70 | 8 | 0 | Evnto |
| [web3](./web3/USE-CASES.md) | 46 | 46 | 7 | 0 | Evnto |
| [payments](./payments/USE-CASES.md) | 20 | 20 | 4 | 8 | Evnto |
| [template](./template/USE-CASES.md) | 6 | 6 | 1 | 0 | Referencia |

**Total: 623 use cases, 623 zero-arg factories (100% coverage)**

---

## Asignación por Vertical

### BitHire (Recruiting)
- **dm-recruiter** - ATS completo con pipeline de candidatos
- **dm-scoring** - Evaluación de candidatos con LLM
- **dm-ia-chat** - Chat con IA para entrevistas y asistencia

### Evnto (Events & Ticketing)
- **dm-events** - Gestión de eventos, tickets, waitlists
- **dm-bar** - Bar, inventario, pedidos
- **dm-staff** - Personal, turnos, nómina
- **dm-payments** - Pagos, suscripciones, crypto
- **dm-web3** - NFTs, tokens, staking

---

## Estructura Común de Módulos

Todos los módulos siguen la misma arquitectura:

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
│   ├── services/            # Orchestrators
│   └── use-cases/
│       ├── mutations/       # Operaciones de escritura
│       └── queries/         # Operaciones de lectura
│
├── adapters/                 # Implementaciones
│   ├── in/                  # Controllers, DTOs
│   └── out/                 # Persistence, services
│
├── config/di/               # Factories (DI)
├── tests/                   # Tests
├── index.ts                 # Exports públicos
└── CLAUDE.md                # Guía del módulo
```

---

## Dependencias

Todos los domain modules dependen de `@rottay/core`:

```typescript
import {
  success,
  error,
  ValidationError,
  NotFoundError,
  type TenantContext,
  type UseCaseResult,
  logger,
  db,
} from '@rottay/core';
```

---

## Módulos con Orchestrators

Algunos módulos tienen orchestrators para coordinar workflows complejos:

| Módulo | Orchestrators |
|--------|---------------|
| recruiter | 11 (job-publishing, interview-scheduling, offer-management, etc.) |
| bar | 4 (order, inventory, pricing, purchase-order) |
| payments | 8 (payment, subscription, refund, payout, crypto, etc.) |
| ia-chat | 3 (fallback, provider-selection, session) |

---

## Template de Referencia

`dm-template` es el módulo de referencia para crear nuevos domain modules:

```typescript
// Estructura mínima de un use case
export class CreateProductUseCase {
  constructor(private readonly repo: ProductRepositoryPort) {}

  async execute(
    input: CreateProductCommand,
    context: TenantContext
  ): Promise<UseCaseResult<Product>> {
    // Validación
    // Lógica de negocio
    // Persistencia
    return success(product);
  }
}
```

Ver [dm-template/CLAUDE.md](/dm-template/CLAUDE.md) para guía completa.

---

## Session 2026-02-06 Changes

### ESLint v9 Migration (All Modules)

All domain modules have been migrated from legacy `.eslintrc.json` to ESLint v9 flat config (`eslint.config.js`). The old `.eslintrc.json` files have been deleted from every `dm-*` directory.

### Dead Code / Deprecation Cleanup

| Module | Items Removed |
|--------|--------------|
| dm-web3 | 21 deprecated re-export shims |
| dm-recruiter | Deprecated shims + 22 schema aliases, N+1 queries fixed |
| dm-scoring | Deprecated shims + 44 legacy type/schema aliases |
| dm-ia-chat | Deprecated shims + placeholder directories |
| dm-payments | 4 deprecated event type aliases |

### Infrastructure

- Dead monitoring configs deleted: `docker-compose.monitoring.yml`, OpenTelemetry configs, Prometheus configs
- Dependency versions pinned across all modules
- EVENT_REGISTRY expanded to 354 events (extracted to `event-registry.ts`)
- dm-payments webhook handler split (3,361 lines -> 5 focused files)
- dm-payments idempotency added (IdempotencyPort, IdempotencyService, wrapper)
