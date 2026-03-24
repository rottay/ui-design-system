# dm-template - Use Cases

> **Reference Template Module**

**Total: 6 use cases (3 mutations, 3 queries) | 6 zero-arg factories (100% coverage)**

---

## Quick Index

### Mutations
- [Product](#product)

### Queries
- [Product Queries](#product-queries)

---

## Mutations

### Product

| Use Case | Factory | Description |
|----------|---------|-------------|
| `CreateProductUseCase` | `makeCreateProductUseCase()` | Create a new product |
| `UpdateProductUseCase` | `makeUpdateProductUseCase()` | Update an existing product |
| `DeleteProductUseCase` | `makeDeleteProductUseCase()` | Delete a product |

---

## Queries

### Product Queries

| Use Case | Factory | Description |
|----------|---------|-------------|
| `GetProductUseCase` | `makeGetProductUseCase()` | Get a product by ID |
| `ListProductUseCase` | `makeListProductUseCase()` | List products with pagination |
| `SearchProductsUseCase` | `makeSearchProductsUseCase()` | Search products by criteria |

---

## DI Pattern

All factories resolve dependencies internally:

```typescript
import { makeCreateProductUseCase } from '@rottay/template';

// Zero-arg: repository + logger resolved internally
const useCase = makeCreateProductUseCase();
const result = await useCase.execute({ name: 'Product A', price: 100 }, { tenantId });
```
