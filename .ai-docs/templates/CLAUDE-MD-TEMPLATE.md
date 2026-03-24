# {Project Name} - CLAUDE.md Template

> **Copy this template to your project's CLAUDE.md file and fill in the details**

---

## {Project Name}

{Brief description of what this project/module does}

---

## AI Documentation

- **Catalog**: `/.ai-docs/CATALOG.md` - Start here for navigation
- **Architecture**: `/.ai-docs/ARCHITECTURE.md` - Mandatory patterns
- **Core**: `/.ai-docs/core/README.md` - @rottay/core reference

### This project uses:

```typescript
// Core (always first)
import { ... } from '@rottay/core';

// Platform modules (list which ones)
import { ... } from '@rottay/auth';
import { ... } from '@rottay/identity';

// Domain modules (list which ones - for apps)
import { ... } from '@rottay/dm-{module}';

// Design system (for frontend apps)
import { ... } from '@rottay/design-system';
```

---

## Project Structure

```
{project-name}/
├── domain/                    # Domain logic (if applicable)
│   ├── entity/
│   ├── errors/
│   └── types/
├── application/               # Use cases
│   ├── ports/
│   └── use-cases/
│       ├── mutations/
│       └── queries/
├── adapters/                  # Implementations
│   ├── in/
│   └── out/
├── config/di/                 # Factories
└── index.ts                   # Public exports
```

---

## Key Entities

List the main entities this project works with.

| Entity | Description |
|--------|-------------|
| {Entity1} | {Description} |
| {Entity2} | {Description} |

---

## Use Cases Documentation

See: `/.ai-docs/{module-type}/{module-name}/USE-CASES.md`

---

## Documentation Update Rule

When modifying a use case:
1. Update `/.ai-docs/{module-type}/{module-name}/USE-CASES.md`
2. Maintain the standard format from the template
