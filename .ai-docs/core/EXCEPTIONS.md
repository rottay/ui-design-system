# @rottay/core - Exceptions

> **Sistema de errores de @rottay/core**

---

## Jerarquía de Errores

```
DomainError (base)
├── ValidationError           # Datos inválidos
├── NotFoundError            # Recurso no encontrado
├── ConflictError            # Conflicto de estado
├── TenantError              # Error de tenant
├── UnauthorizedError        # No autenticado
├── ForbiddenError           # Sin permisos
├── JsonParseError           # Error parsing JSON
└── InfrastructureError      # Error de infraestructura
    ├── DatabaseError
    ├── CacheError
    ├── ExternalServiceError
    ├── CircuitBreakerOpenError  # Circuit breaker abierto
    └── JobQueueError            # Error en cola de trabajos
```

---

## Formato de Código de Error

```
MODULE/ERROR_CODE
```

Ejemplos:
- `PRODUCT/NOT_FOUND`
- `BAR/ORDER_CANCELED`
- `SCORING/RUBRIC_PUBLISHED`
- `AUTH/INVALID_TOKEN`

---

## Errores de Dominio

### DomainError (Base)

```typescript
import { DomainError } from '@rottay/core';

class ProductNotFoundError extends DomainError {
  constructor(id: string) {
    super('PRODUCT/NOT_FOUND', `Product with id ${id} not found`);
  }
}
```

### ValidationError

Para datos de entrada inválidos.

```typescript
import { ValidationError } from '@rottay/core';

// Simple
return error(new ValidationError('Name is required'));

// Con campo
return error(new ValidationError('name', 'Name must be at least 3 characters'));

// Múltiples errores
return error(new ValidationError([
  { field: 'name', message: 'Name is required' },
  { field: 'price', message: 'Price must be positive' },
]));
```

### NotFoundError

Para recursos no encontrados.

```typescript
import { NotFoundError } from '@rottay/core';

// Básico
return error(new NotFoundError('Product', id));

// Con contexto
return error(new NotFoundError('Product', id, { tenantId: context.tenantId }));
```

### ConflictError

Para conflictos de estado o duplicados.

```typescript
import { ConflictError } from '@rottay/core';

// Duplicado
return error(new ConflictError('Product', 'name', 'This product name already exists'));

// Estado inválido
return error(new ConflictError('Order', 'status', 'Cannot cancel a completed order'));
```

### TenantError

Para errores de multi-tenancy.

```typescript
import { TenantError, MissingTenantContextError } from '@rottay/core';

// Tenant no encontrado
return error(new TenantError('Tenant not found'));

// Contexto faltante
return error(new MissingTenantContextError());
```

### UnauthorizedError

Para autenticación fallida.

```typescript
import { UnauthorizedError } from '@rottay/core';

return error(new UnauthorizedError('Invalid or expired token'));
```

### ForbiddenError

Para autorización fallida (sin permisos).

```typescript
import { ForbiddenError } from '@rottay/core';

return error(new ForbiddenError('products:delete', 'You do not have permission to delete products'));
```

---

## Errores de Infraestructura

### InfrastructureError (Base)

```typescript
import { InfrastructureError } from '@rottay/core';

class EmailServiceError extends InfrastructureError {
  constructor(message: string) {
    super('EMAIL/SERVICE_ERROR', message);
  }
}
```

### DatabaseError

```typescript
import { DatabaseError } from '@rottay/core';

return error(new DatabaseError('Connection timeout'));
```

### CacheError

```typescript
import { CacheError } from '@rottay/core';

return error(new CacheError('Redis connection failed'));
```

### ExternalServiceError

```typescript
import { ExternalServiceError } from '@rottay/core';

return error(new ExternalServiceError('Stripe', 'Payment processing failed'));
```

---

## Uso en Use Cases

```typescript
import {
  success,
  error,
  ValidationError,
  NotFoundError,
  ConflictError,
  type UseCaseResult
} from '@rottay/core';

class UpdateProductUseCase {
  async execute(
    input: UpdateProductCommand,
    context: TenantContext
  ): Promise<UseCaseResult<Product>> {

    // Validación
    if (!input.id) {
      return error(new ValidationError('id', 'Product ID is required'));
    }

    // Buscar
    const product = await this.repo.findById(input.id, context.tenantId);
    if (!product) {
      return error(new NotFoundError('Product', input.id));
    }

    // Verificar conflicto
    if (input.name) {
      const existing = await this.repo.findByName(input.name, context.tenantId);
      if (existing && existing.id !== input.id) {
        return error(new ConflictError('Product', 'name', input.name));
      }
    }

    // Actualizar
    const updated = await this.repo.update(input.id, {
      ...input,
      updatedBy: context.userId,
    });

    return success(updated);
  }
}
```

---

## Manejo en Controllers

```typescript
import { BaseController } from '@rottay/core';

class ProductController extends BaseController {
  async update(req: Request, res: Response) {
    const result = await this.useCase.execute(req.body, req.context);

    if (!result.success) {
      const { error } = result;

      if (error instanceof ValidationError) {
        return this.badRequest(res, error);
      }

      if (error instanceof NotFoundError) {
        return this.notFound(res, error);
      }

      if (error instanceof ConflictError) {
        return this.conflict(res, error);
      }

      if (error instanceof ForbiddenError) {
        return this.forbidden(res, error);
      }

      return this.internalError(res, error);
    }

    return this.ok(res, result.data);
  }
}
```

---

## Crear Errores Personalizados

```typescript
// domain/errors/index.ts
import { DomainError } from '@rottay/core';

export class ProductOutOfStockError extends DomainError {
  constructor(productId: string, requested: number, available: number) {
    super(
      'PRODUCT/OUT_OF_STOCK',
      `Product ${productId} has only ${available} units, but ${requested} were requested`
    );
    this.productId = productId;
    this.requested = requested;
    this.available = available;
  }

  readonly productId: string;
  readonly requested: number;
  readonly available: number;
}

export class OrderAlreadyPaidError extends DomainError {
  constructor(orderId: string) {
    super('ORDER/ALREADY_PAID', `Order ${orderId} has already been paid`);
    this.orderId = orderId;
  }

  readonly orderId: string;
}
```

---

## Errores Adicionales

### CircuitBreakerOpenError

Cuando el circuit breaker está abierto y no permite llamadas.

```typescript
import { CircuitBreakerOpenError, CircuitOpenError } from '@rottay/core';

// Se lanza automáticamente cuando el circuit breaker está abierto
try {
  await circuitBreaker.execute(() => externalCall());
} catch (err) {
  if (err instanceof CircuitOpenError) {
    // Circuit breaker está abierto, esperar antes de reintentar
    console.log('Service unavailable, circuit breaker is open');
  }
}
```

### JobQueueError

Para errores en el sistema de colas de trabajo.

```typescript
import { JobQueueError } from '@rottay/core';

return error(new JobQueueError('Failed to enqueue email job'));
```

### JsonParseError

Para errores de parsing de JSON.

```typescript
import { JsonParseError } from '@rottay/core';

try {
  const data = JSON.parse(rawInput);
} catch (err) {
  return error(new JsonParseError('Invalid JSON format', rawInput));
}
```

---

## Import

```typescript
import {
  // Base
  DomainError,
  InfrastructureError,

  // Domain errors
  ValidationError,
  NotFoundError,
  ConflictError,
  TenantError,
  MissingTenantContextError,
  UnauthorizedError,
  ForbiddenError,
  JsonParseError,

  // Infrastructure errors
  DatabaseError,
  CacheError,
  ExternalServiceError,
  CircuitBreakerOpenError,
  CircuitOpenError,
  JobQueueError,
} from '@rottay/core';
```
