# @rottay/core - Patterns

> **Patrones obligatorios implementados en @rottay/core**

---

## 1. Result Pattern

**NUNCA usar throw para errores de negocio.**

### Funciones

```typescript
import { success, error } from '@rottay/core';

// Éxito
return success(data);

// Error
return error(new ValidationError('Invalid input'));
```

### Uso en Use Cases

```typescript
import { success, error, type UseCaseResult } from '@rottay/core';

class CreateProductUseCase {
  async execute(
    input: CreateProductCommand,
    context: TenantContext
  ): Promise<UseCaseResult<Product>> {

    // Validación
    if (!input.name) {
      return error(new ValidationError('Name is required'));
    }

    // Verificar existencia
    const existing = await this.repo.findByName(input.name, context.tenantId);
    if (existing) {
      return error(new ConflictError('Product', 'name', input.name));
    }

    // Crear
    const product = await this.repo.create({
      ...input,
      tenantId: context.tenantId,
      createdBy: context.userId,
      updatedBy: context.userId,
    });

    return success(product);
  }
}
```

### Pattern Matching

```typescript
const result = await useCase.execute(input, context);

if (result.success) {
  // result.data disponible (tipo T)
  return res.json(result.data);
} else {
  // result.error disponible (tipo DomainError)
  return res.status(400).json({ error: result.error.message });
}
```

---

## 2. Factory DI Pattern

**Factories SOLO en `config/di/`.**

### Estructura

```
dm-{module}/
├── config/
│   └── di/
│       └── index.ts    # TODAS las factories aquí
```

### Definición de Factory

```typescript
// config/di/index.ts
import { type Database } from '@rottay/core';
import { CreateProductUseCase } from '@/application/use-cases/mutations/product/create';
import { ProductRepository } from '@/adapters/out/persistence/repositories/product';

export function makeCreateProductUseCase(db: Database) {
  const repository = new ProductRepository(db);
  return new CreateProductUseCase(repository);
}

export function makeProductRepository(db: Database) {
  return new ProductRepository(db);
}
```

### Uso en Controllers

```typescript
// adapters/in/controllers/product/index.ts
import { db } from '@rottay/core';
import { makeCreateProductUseCase } from '@/config/di';

export class ProductController {
  async create(req: Request, res: Response) {
    const useCase = makeCreateProductUseCase(db);
    const result = await useCase.execute(req.body, req.context);
    // ...
  }
}
```

---

## 3. Repository Pattern

### Port (Interface)

```typescript
// application/ports/interfaces/repositories/product/index.ts
import { type TenantContext, type UseCaseResult } from '@rottay/core';

export interface ProductRepositoryPort {
  findById(id: string, tenantId: string): Promise<Product | null>;
  findByTenant(tenantId: string): Promise<Product[]>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product | null>;
  softDelete(id: string, tenantId: string, userId: string): Promise<boolean>;
}
```

### Adapter (Implementation)

```typescript
// adapters/out/persistence/repositories/product/index.ts
import { eq, and } from 'drizzle-orm';
import { type Database } from '@rottay/core';
import { products } from '@/adapters/out/persistence/schemas/products';
import { type ProductRepositoryPort } from '@/application/ports/interfaces/repositories/product';

export class ProductRepository implements ProductRepositoryPort {
  constructor(private readonly db: Database) {}

  async findById(id: string, tenantId: string): Promise<Product | null> {
    const result = await this.db.select()
      .from(products)
      .where(and(
        eq(products.id, id),
        eq(products.tenantId, tenantId),  // OBLIGATORIO
        eq(products.isActive, true)        // Soft delete
      ))
      .limit(1);

    return result[0] ?? null;
  }

  async softDelete(id: string, tenantId: string, userId: string): Promise<boolean> {
    const result = await this.db.update(products)
      .set({
        isActive: false,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(and(
        eq(products.id, id),
        eq(products.tenantId, tenantId)
      ))
      .returning({ id: products.id });

    return result.length > 0;
  }
}
```

---

## 4. Decorator Pattern

Decorators para cross-cutting concerns.

### @Audit

```typescript
import { Audit } from '@rottay/core';

class CreateProductUseCase {
  @Audit({ action: 'product.create', entityType: 'Product' })
  async execute(input: Input, context: TenantContext) {
    // Automáticamente registra en audit log
  }
}
```

### @Authorize

```typescript
import { Authorize } from '@rottay/core';

class DeleteProductUseCase {
  @Authorize({ permissions: ['products:delete'] })
  async execute(input: Input, context: TenantContext) {
    // Verifica permisos antes de ejecutar
  }
}
```

### @Cache

```typescript
import { Cache } from '@rottay/core';

class GetProductUseCase {
  @Cache({ ttl: 300, key: 'product:{id}' })
  async execute(input: Input, context: TenantContext) {
    // Cachea resultado por 5 minutos
  }
}
```

### @Transactional

```typescript
import { Transactional } from '@rottay/core';

class TransferFundsUseCase {
  @Transactional()
  async execute(input: Input, context: TenantContext) {
    // Todo en una transacción, rollback automático si falla
  }
}
```

### @RateLimit

```typescript
import { RateLimit } from '@rottay/core';

class SendEmailUseCase {
  @RateLimit({ limit: 100, window: 60 }) // 100 por minuto
  async execute(input: Input, context: TenantContext) {
    // Rate limited
  }
}
```

### @Retry

```typescript
import { Retry } from '@rottay/core';

class CallExternalApiUseCase {
  @Retry({ attempts: 3, delay: 1000 })
  async execute(input: Input, context: TenantContext) {
    // Reintenta hasta 3 veces con 1s de delay
  }
}
```

---

## 5. Base Classes

### BaseUseCase

```typescript
import { BaseUseCase } from '@rottay/core';

export class CreateProductUseCase extends BaseUseCase<
  CreateProductCommand,
  Product
> {
  async execute(
    input: CreateProductCommand,
    context: TenantContext
  ): Promise<UseCaseResult<Product>> {
    // Implementación
  }
}
```

### BaseRepository

```typescript
import { BaseRepository } from '@rottay/core';

export class ProductRepository extends BaseRepository<Product> {
  // Hereda métodos comunes: findById, findAll, create, update, delete
}
```

### BaseController

```typescript
import { BaseController } from '@rottay/core';

export class ProductController extends BaseController {
  // Hereda helpers: ok(), created(), notFound(), badRequest(), etc.
}
```

---

## 6. Transformer Pattern

Para mapear entre capas.

```typescript
import { BaseTransformer, transformOrNull } from '@rottay/core';

export class ProductTransformer extends BaseTransformer<ProductEntity, ProductDTO> {
  transform(entity: ProductEntity): ProductDTO {
    return {
      id: entity.id,
      name: entity.name,
      price: entity.price,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}

// Uso
const transformer = new ProductTransformer();
const dto = transformer.transform(entity);
const dtoOrNull = transformOrNull(entity, transformer);
```

---

## 7. Pagination Pattern

```typescript
import { createPaginatedResponse, type PaginationInput } from '@rottay/core';

async listProducts(
  input: ListProductsQuery & PaginationInput,
  context: TenantContext
): Promise<UseCaseResult<PaginatedResult<Product>>> {
  const { page = 1, limit = 20 } = input;
  const offset = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.repo.findPaginated(context.tenantId, offset, limit),
    this.repo.count(context.tenantId),
  ]);

  return success(createPaginatedResponse(items, total, page, limit));
}
```

---

## 8. Validation Pattern

```typescript
import { Validators, ValidationError } from '@rottay/core';

class CreateProductUseCase {
  async execute(input: CreateProductCommand, context: TenantContext) {
    // Validar con Validators
    const errors = Validators.validate(input, {
      name: Validators.required().string().minLength(3).maxLength(100),
      price: Validators.required().number().positive(),
      sku: Validators.optional().string().pattern(/^[A-Z0-9-]+$/),
    });

    if (errors.length > 0) {
      return error(new ValidationError(errors));
    }

    // Continuar...
  }
}
```

---

## 9. Core Services

### Email Service

```typescript
import { emailService, getEmailService } from '@rottay/core';

// Enviar email de verificación
await emailService.sendEmailVerification(email, userId);

// Enviar reset de contraseña
await emailService.sendPasswordReset(email, resetToken);

// Enviar template genérico
await emailService.sendEmailTemplate('welcome', { name: 'John' });
```

### QR Service

```typescript
import { getQRService, QRSource, QRType } from '@rottay/core';

const qrService = getQRService();

// Generar QR
const result = await qrService.generate({
  source: 'events' as QRSource,
  type: 'ticket' as QRType,
  referenceId: ticketId,
  singleUse: true,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
}, context);

// Validar QR
const validation = await qrService.validate(code, context);
if (validation.success && validation.data.status === 'valid') {
  // QR válido
}
```

### JWT Service

```typescript
import { jwtService } from '@rottay/core';

// Generar token
const token = await jwtService.generate({
  sub: userId,
  tid: tenantId,
  roles: ['user'],
  permissions: ['read:products'],
});

// Verificar token
const result = await jwtService.verify(token);
if (result.valid) {
  const { payload } = result;
}

// Revocar token
await jwtService.revoke(jti, 'logout');
```

### Job Queue Service

```typescript
import { getQueueManager, QueueName } from '@rottay/core';

const queueManager = getQueueManager();

// Agregar job
const jobId = await queueManager.addJob(QueueName.EMAIL, {
  type: 'email',
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'John' },
}, {
  priority: 1,
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
});

// Ver estadísticas
const stats = await queueManager.getQueueStats(QueueName.EMAIL);
```

### PDF Service

```typescript
import { getPDFService } from '@rottay/core';

const pdfService = getPDFService();

// Generar PDF desde HTML
const result = await pdfService.generateFromHTML(htmlContent, {
  format: 'A4',
  orientation: 'portrait',
  margin: { top: '20mm', bottom: '20mm' },
});

if (result.success) {
  const buffer = result.data; // PDF buffer
}
```

### Rate Limiting

```typescript
import { getDefaultRateLimitProvider } from '@rottay/core';

const rateLimiter = getDefaultRateLimitProvider();

// Incrementar contador
const count = await rateLimiter.increment(`api:${tenantId}:${endpoint}`, 60);

// Verificar límite
if (count > 100) {
  throw new Error('Rate limit exceeded');
}
```

### DLP Service (Data Loss Prevention)

```typescript
import { createDataClassificationService } from '@rottay/core';

const dlpService = createDataClassificationService();

// Clasificar datos
const classification = dlpService.classify(userData);

// Detectar patrones sensibles
const patterns = dlpService.detectPatterns(text);

// Enmascarar datos sensibles
const masked = dlpService.maskData(rawData);
```

### Resilience Services

```typescript
import { CircuitBreaker, withRetry } from '@rottay/core';

// Circuit Breaker
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
});

const result = await breaker.execute(async () => {
  return await externalApiCall();
});

// Retry con backoff exponencial
const data = await withRetry(
  async () => await unreliableOperation(),
  { maxAttempts: 3, baseDelay: 1000 }
);
```
