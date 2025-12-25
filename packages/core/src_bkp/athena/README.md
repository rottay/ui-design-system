# Athena Engine

> **Status: TODO - Not Implemented**

## Overview

Athena is the extensible, "bring-your-own-library" engine. It allows clients to plug in their own UI library implementations while maintaining compatibility with the design system's component API.

## Use Cases

- **Migration scenarios**: Gradually migrate from one UI library to another
- **Custom requirements**: Use a specific UI library required by the client
- **Experimentation**: Test new UI libraries without full commitment
- **Hybrid apps**: Different parts of the app use different UI libraries

## Proposed Libraries to Support

### Tier 1 - High Priority

| Library | Bundle Size | Components | Notes |
|---------|-------------|------------|-------|
| **Radix UI** | ~50kb | 30+ | Unstyled, accessible primitives |
| **Headless UI** | ~20kb | 10+ | Tailwind Labs, fully accessible |
| **React Aria** | ~60kb | 40+ | Adobe, accessibility-first |
| **Shadcn/ui** | Varies | 40+ | Copy-paste components (Radix + Tailwind) |

### Tier 2 - Medium Priority

| Library | Bundle Size | Components | Notes |
|---------|-------------|------------|-------|
| **Chakra UI** | ~100kb | 50+ | Styled, accessible, themeable |
| **Mantine** | ~120kb | 100+ | Rich components, hooks library |
| **MUI (Material)** | ~150kb | 60+ | Material Design, enterprise |
| **NextUI** | ~80kb | 40+ | Beautiful, modern, Tailwind |

### Tier 3 - Low Priority

| Library | Bundle Size | Components | Notes |
|---------|-------------|------------|-------|
| **Ark UI** | ~40kb | 30+ | State machines, Chakra team |
| **Park UI** | ~30kb | 30+ | Ark UI + styling |
| **Catalyst** | ~25kb | 20+ | Tailwind Labs, Headless UI styled |
| **Tremor** | ~50kb | 20+ | Dashboard-focused |

## Implementation Plan

### Phase 1: Core Infrastructure

```typescript
// TODO: Create Athena provider that accepts custom implementations
interface AthenaConfig {
  implementations: Partial<Record<ComponentName, ComponentType<any>>>;
  fallbackEngine?: 'titan' | 'hermes' | 'apollo';
}

// TODO: Create registration system
function registerAthenaComponent<P>(
  name: ComponentName,
  component: ComponentType<P>
): void;
```

### Phase 2: Component Adapters

```typescript
// TODO: Create adapter interfaces for each component
interface ButtonAdapter {
  // Common props that all implementations must support
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

// TODO: Create prop mappers for each library
const radixButtonMapper = (props: ButtonAdapter) => ({
  // Map to Radix Button props
});
```

### Phase 3: Reference Implementations

```
athena/
├── adapters/
│   ├── radix/           # Radix UI adapter
│   ├── headless/        # Headless UI adapter
│   ├── chakra/          # Chakra UI adapter
│   └── shadcn/          # Shadcn/ui adapter
├── interfaces/          # Component interfaces
├── mappers/             # Prop mappers
└── index.ts
```

## Example Usage

```tsx
import { DesignSystemProvider } from '@es-rottay/designsystem-core';
import { radixImplementations } from '@es-rottay/designsystem-athena-radix';

function App() {
  return (
    <DesignSystemProvider
      engine="athena"
      athenaConfig={{
        implementations: radixImplementations,
        fallbackEngine: 'apollo',
      }}
    >
      <YourApp />
    </DesignSystemProvider>
  );
}
```

## TODO Checklist

- [ ] Create `AthenaProvider` component
- [ ] Define component interfaces for all 87 primitives
- [ ] Create prop mapper utilities
- [ ] Implement Radix UI adapter (Tier 1)
- [ ] Implement Headless UI adapter (Tier 1)
- [ ] Create documentation for custom adapters
- [ ] Add tests for adapter compatibility
- [ ] Create migration guide from Titan to Athena

## Contributing

When adding a new library adapter:

1. Create adapter folder in `athena/adapters/{library}/`
2. Implement all component interfaces
3. Create prop mappers for library-specific props
4. Add tests for each component
5. Update this README with the new library
