# {module-name} - Use Cases

> **{Brief description of the module}**

**Total: X use cases (Y mutations, Z queries)**

---

## Mutations

### {entity-name}
| Use Case | Class | Description |
|----------|-------|-------------|
| create | `Create{Entity}UseCase` | Creates new {entity} |
| update | `Update{Entity}UseCase` | Updates existing {entity} |
| delete | `Delete{Entity}UseCase` | Deletes {entity} |

---

## Queries

### {entity-name}
| Use Case | Class | Description |
|----------|-------|-------------|
| get-by-id | `Get{Entity}ByIdUseCase` | Gets {entity} by ID |
| list | `List{Entities}UseCase` | Lists all {entities} |
| search | `Search{Entities}UseCase` | Searches {entities} |

---

## Orchestrators (if applicable)

| Orchestrator | Description |
|--------------|-------------|
| `{Name}Orchestrator` | Coordinates {workflow} |

---

## Status Types (if applicable)

```typescript
type {Entity}Status =
  | 'draft'
  | 'active'
  | 'completed'
  | 'cancelled';
```

---

## Factory Usage

```typescript
import { db } from '@rottay/core';
import { makeCreate{Entity}UseCase } from '@rottay/{module}/config/di';

const useCase = makeCreate{Entity}UseCase(db);
const result = await useCase.execute(input, context);
```
