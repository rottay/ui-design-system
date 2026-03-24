# dm-template

> **Reference Template Module - Hexagonal Architecture Starter**

---

## Purpose

`dm-template` is the reference implementation for creating new domain modules. It demonstrates the standard hexagonal architecture pattern used across all `dm-*` modules in the Rottay monorepo.

## Package

- **Name**: `@rottay/template`
- **Location**: `/dm-template/`
- **Vertical**: Reference (not deployed)

## Architecture

```
dm-template/
  application/
    use-cases/
      mutations/
        product/
          create/index.ts
          update/index.ts
          delete/index.ts
      queries/
        product/
          get/index.ts
          list/index.ts
          search/index.ts
    ports/
      interfaces/
        repositories/
  domain/
    entities/
    types/
  adapters/
    out/
      repositories/
  config/
    di/
      repositories/index.ts
      use-cases/
        mutations/index.ts
        queries/index.ts
        index.ts
      index.ts
  index.ts
```

## DI Pattern

All factories are zero-arg. Repository resolution uses `globalThis.__ROTTAY_TEMPLATE_DB__` singleton set via `setDatabase(db)` at startup.

```typescript
import { makeCreateProductUseCase } from '@rottay/template';

const useCase = makeCreateProductUseCase(); // zero-arg
const result = await useCase.execute(input, context);
```

## Stats

- **Use Cases**: 6 (3 mutations, 3 queries)
- **Factories**: 6 (100% zero-arg coverage)
- **Entities**: 1 (Product)

## Related

- [USE-CASES.md](./USE-CASES.md) - All use cases
- [ENTITIES.md](./ENTITIES.md) - Domain entities
