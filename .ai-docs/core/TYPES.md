# @rottay/core - Types

> **Tipos principales exportados por @rottay/core**

---

## TenantContext

El tipo más importante. Requerido en TODOS los use cases.

```typescript
interface TenantContext {
  tenantId: string;           // ID del tenant actual
  userId: string;             // ID del usuario actual
  companyId?: string;         // ID de la empresa (opcional)
  roles: string[];            // Roles del usuario
  permissions: string[];      // Permisos específicos
  locale?: string;            // Idioma/región
  timezone?: string;          // Zona horaria
}
```

**Uso:**
```typescript
async execute(input: Input, context: TenantContext): Promise<UseCaseResult<Output>> {
  // context.tenantId SIEMPRE disponible
  const products = await this.repo.findByTenant(context.tenantId);
}
```

---

## UseCaseResult

Tipo para el Result Pattern.

```typescript
type UseCaseResult<T> =
  | { success: true; data: T }
  | { success: false; error: DomainError };
```

**Uso:**
```typescript
const result = await useCase.execute(input, context);
if (result.success) {
  console.log(result.data);  // T
} else {
  console.log(result.error); // DomainError
}
```

---

## PaginatedResult

Para respuestas paginadas.

```typescript
interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

**Uso:**
```typescript
import { createPaginatedResponse } from '@rottay/core';

const response = createPaginatedResponse(items, total, page, limit);
// response.data = items
// response.pagination = { page, limit, total, totalPages, hasNext, hasPrevious }
```

---

## AccessDecision

Para decisiones de autorización.

```typescript
interface AccessDecision {
  allowed: boolean;
  reason?: string;
  deniedPermissions?: string[];
}
```

---

## Entity Base Types

### BaseEntity

```typescript
interface BaseEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
  readonly updatedBy: string;
}
```

### WithCompany

```typescript
interface WithCompany {
  readonly companyId: string;
}
```

### WithTimestamps

```typescript
interface WithTimestamps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

---

## Command & Query Types

### BaseCommand

```typescript
interface BaseCommand {
  // Commands mutan estado
}
```

### BaseQuery

```typescript
interface BaseQuery {
  // Queries son solo lectura
}
```

### PaginationInput

```typescript
interface PaginationInput {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
}
```

### SortInput

```typescript
interface SortInput {
  field: string;
  direction: 'asc' | 'desc';
}
```

---

## Database Types

### DatabaseTransaction

```typescript
type DatabaseTransaction = typeof db;
```

### DatabaseSchema

```typescript
// Schemas disponibles
const platformSchema = 'platform';
const bithireSchema = 'bithire';
const evntoSchema = 'evnto';
const economySchema = 'economy';
```

---

## Provider Types

### ProviderConfig

```typescript
interface ProviderConfig {
  id: string;
  tenantId: string;
  category: ProviderCategory;
  provider: string;
  credentials: EncryptedCredentials;
  isActive: boolean;
  settings: Record<string, unknown>;
}
```

### ProviderCategory

```typescript
type ProviderCategory =
  | 'email'
  | 'sms'
  | 'push'
  | 'payment'
  | 'storage'
  | 'llm'
  | 'search';
```

---

## Webhook Types

### WebhookEvent

```typescript
interface WebhookEvent {
  id: string;
  type: string;
  tenantId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}
```

### WebhookDelivery

```typescript
interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  lastAttemptAt?: Date;
  response?: {
    statusCode: number;
    body: string;
  };
}
```

---

## Audit Types

### AuditLog

```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}
```

---

## Utility Types

### Nullable

```typescript
type Nullable<T> = T | null;
```

### Optional

```typescript
type Optional<T> = T | undefined;
```

### DeepPartial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

---

## Import Example

```typescript
import {
  type TenantContext,
  type UseCaseResult,
  type PaginatedResult,
  type BaseEntity,
  type PaginationInput,
  type SortInput,
  type AuditLog,
} from '@rottay/core';
```
