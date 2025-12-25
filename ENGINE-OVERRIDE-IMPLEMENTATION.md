# ENGINE-OVERRIDE-001 - Implementation Complete

## Summary
Successfully implemented the engine override functionality allowing individual components to override the global engine context via the `engine` prop.

## Changes Made

### 1. Type Definitions (`/packages/core/src/types/engine/index.ts`)
**Status:** ✅ Already correctly implemented

The `EngineAwareProps` interface already includes the `engine` prop:
```typescript
export interface EngineAwareProps {
  /**
   * Engine de UI a usar para este componente.
   * Si no se especifica, usa el engine del EngineProvider más cercano.
   * @default 'titan'
   */
  engine?: EngineName;
}
```

The `EngineName` type includes all 4 engines:
```typescript
export type EngineName = 'titan' | 'hermes' | 'apollo' | 'athena';
```

### 2. Engine Factory (`/packages/core/src/system/engines/factory/index.tsx`)
**Status:** ✅ Modified successfully

Updated the `EngineRouter` component to respect the `engine` prop override:

```typescript
const EngineRouter = (props: P & { engine?: EngineName }) => {
  const context = useEngineContext();
  // Allow engine prop to override context engine
  const activeEngine = props.engine || context.engine;
  const Component = components[activeEngine];

  // Remove engine prop before passing to implementation
  const { engine: _, ...componentProps } = props;

  return (
    <EngineErrorBoundary
      fallbackEngine={fallbackEngine}
      onError={onError}
    >
      <Suspense fallback={fallback}>
        <Component {...(componentProps as any)} />
      </Suspense>
    </EngineErrorBoundary>
  );
};
```

**Key improvements:**
- Added `engine?: EngineName` to the props signature
- Uses `props.engine || context.engine` to allow prop override
- Strips the `engine` prop before passing to the implementation to avoid prop pollution

### 3. Component Types (`/packages/core/src/types/components/index.ts`)
**Status:** ✅ Cleaned up

Removed duplicate `EngineAwareProps` definition to avoid conflicts. The canonical definition remains in `/packages/core/src/types/engine/index.ts`.

## Usage Examples

### Basic Usage (Using Context Engine)
```tsx
import { EngineProvider } from '@es-rottay/designsystem-core';
import { Button } from '@es-rottay/designsystem-core';

function App() {
  return (
    <EngineProvider defaultEngine="titan">
      {/* Uses titan engine from context */}
      <Button>Click me</Button>
    </EngineProvider>
  );
}
```

### Override Individual Component
```tsx
import { EngineProvider } from '@es-rottay/designsystem-core';
import { Button } from '@es-rottay/designsystem-core';

function App() {
  return (
    <EngineProvider defaultEngine="titan">
      {/* Uses titan engine from context */}
      <Button>Titan Button</Button>

      {/* Overrides to use hermes engine */}
      <Button engine="hermes">Hermes Button</Button>

      {/* Overrides to use apollo engine */}
      <Button engine="apollo">Apollo Button</Button>

      {/* Overrides to use athena engine */}
      <Button engine="athena">Athena Button</Button>
    </EngineProvider>
  );
}
```

### Mixed Engines in One View
```tsx
function Dashboard() {
  return (
    <EngineProvider defaultEngine="titan">
      <div>
        {/* Header uses titan (from context) */}
        <Card>
          <Typography>Dashboard</Typography>
        </Card>

        {/* Action buttons use hermes for lightweight styling */}
        <Button engine="hermes" variant="primary">
          Save
        </Button>
        <Button engine="hermes" variant="secondary">
          Cancel
        </Button>

        {/* Data display uses apollo for accessibility */}
        <Table engine="apollo" data={data} />
      </div>
    </EngineProvider>
  );
}
```

### Dynamic Engine Selection
```tsx
function CustomizableButton() {
  const [engine, setEngine] = useState<EngineName>('titan');

  return (
    <div>
      <select onChange={(e) => setEngine(e.target.value as EngineName)}>
        <option value="titan">Titan (Ant Design)</option>
        <option value="hermes">Hermes (DaisyUI)</option>
        <option value="apollo">Apollo (Vanilla)</option>
        <option value="athena">Athena (Custom)</option>
      </select>

      <Button engine={engine}>
        Click me with {engine} engine
      </Button>
    </div>
  );
}
```

## Technical Details

### How It Works

1. **Component Props Signature**: All engine-aware components extend `EngineAwareProps`, which includes the optional `engine` prop.

2. **Factory Router**: The `createEngineComponent` factory creates a router component that:
   - Reads the `engine` prop from component props
   - Falls back to context engine if prop is not provided
   - Loads the appropriate engine implementation
   - Strips the `engine` prop before passing to the implementation

3. **Type Safety**: TypeScript ensures:
   - Only valid engine names can be passed
   - The `engine` prop is optional everywhere
   - Auto-completion works in IDEs

### Engine Priority
```
Component prop engine > Context engine > Default ('titan')
```

### Performance Considerations

- **Lazy Loading**: Engine implementations are lazy-loaded only when needed
- **Suspense**: React Suspense handles loading states
- **Error Boundary**: `EngineErrorBoundary` catches and handles engine loading errors
- **Prop Cleanup**: The `engine` prop is stripped before passing to implementations, avoiding unnecessary re-renders

## Files Modified

1. ✅ `/packages/core/src/system/engines/factory/index.tsx` - Added engine override logic
2. ✅ `/packages/core/src/types/components/index.ts` - Cleaned up duplicate definitions
3. ✅ `/packages/core/src/types/engine/index.ts` - Already correct (includes 'athena')

## Testing

### Manual Testing
```tsx
// Test file (create in your app)
import { EngineProvider, Button, Card, Input } from '@es-rottay/designsystem-core';

export function EngineOverrideTest() {
  return (
    <EngineProvider defaultEngine="titan">
      <h1>Engine Override Test</h1>

      <section>
        <h2>Context Engine (Titan)</h2>
        <Button>Titan Button</Button>
        <Card>Titan Card</Card>
        <Input placeholder="Titan Input" />
      </section>

      <section>
        <h2>Hermes Override</h2>
        <Button engine="hermes">Hermes Button</Button>
        <Card engine="hermes">Hermes Card</Card>
        <Input engine="hermes" placeholder="Hermes Input" />
      </section>

      <section>
        <h2>Apollo Override</h2>
        <Button engine="apollo">Apollo Button</Button>
        <Card engine="apollo">Apollo Card</Card>
        <Input engine="apollo" placeholder="Apollo Input" />
      </section>

      <section>
        <h2>Athena Override</h2>
        <Button engine="athena">Athena Button</Button>
        <Card engine="athena">Athena Card</Card>
        <Input engine="athena" placeholder="Athena Input" />
      </section>
    </EngineProvider>
  );
}
```

## Benefits

1. **Flexibility**: Mix different engines in the same application
2. **Performance**: Use lighter engines (hermes/apollo) for specific components
3. **Compatibility**: Gradually migrate between engines
4. **Testing**: Easy to test components with different engines
5. **Accessibility**: Use apollo engine for accessible components
6. **Customization**: Use athena for fully custom implementations

## Next Steps

- ✅ Implementation complete
- ⏳ Add unit tests for engine override functionality
- ⏳ Update Storybook to showcase engine overrides
- ⏳ Document engine-specific props differences
- ⏳ Create migration guide for switching engines

---

**Status**: ✅ Complete
**Date**: 2025-12-25
**Task**: ENGINE-OVERRIDE-001
