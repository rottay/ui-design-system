# dm-template - Entities

> **Reference Template Module - Domain Model**

---

## Product

The only entity in the template module. Serves as a reference for the standard entity pattern.

### Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (UUID) |
| `tenantId` | `string` | Tenant isolation |
| `name` | `string` | Product name |
| `description` | `string?` | Optional description |
| `price` | `number` | Price in cents |
| `status` | `'active' \| 'inactive'` | Product status |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |

### Repository Port

```typescript
interface IProductRepository {
  create(product: Product, context: TenantContext): Promise<Product>;
  update(product: Product, context: TenantContext): Promise<Product>;
  delete(id: string, context: TenantContext): Promise<void>;
  findById(id: string, context: TenantContext): Promise<Product | null>;
  findAll(context: TenantContext): Promise<Product[]>;
  search(criteria: SearchCriteria, context: TenantContext): Promise<Product[]>;
}
```
