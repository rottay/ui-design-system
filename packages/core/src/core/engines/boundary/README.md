# Engine Error Boundary

**Status:** ✅ Implemented (ERROR-BOUNDARY-001)

## Overview

The `EngineErrorBoundary` component provides robust error handling for engine component loading failures. It wraps engine-aware components to catch loading errors and provide fallback UI with optional fallback engine support.

## Architecture

```
┌─────────────────────────────────────┐
│   EngineErrorBoundary (Wrapper)    │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │    Suspense (Loading)         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Engine Component       │  │  │
│  │  │  (classic/modern/rustic)│  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         │
         ├─ On Error → Show fallback UI
         ├─ With fallbackEngine → Retry with different engine
         └─ With onError → Log to monitoring service
```

## Features

- ✅ **Error catching** - Catches errors during component lazy loading
- ✅ **Fallback UI** - Displays user-friendly error messages
- ✅ **Custom fallback render** - Supports custom error UI
- ✅ **Fallback engine** - Option to retry with a different engine
- ✅ **Error callbacks** - Hooks for error logging/monitoring
- ✅ **Reset functionality** - Allows retry after error

## Implementation

### Files

1. **`EngineErrorBoundary.tsx`** - Error boundary component (React class component)
2. **`index.ts`** - Exports for the boundary module

### Integration Points

The error boundary is integrated into the factory:

**`src/system/engines/factory/index.tsx`**
```tsx
// Every createEngineComponent wraps with EngineErrorBoundary
return (
  <EngineErrorBoundary
    fallbackEngine={fallbackEngine}
    onError={onError}
  >
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  </EngineErrorBoundary>
);
```

## Usage

### Basic Usage

```tsx
import { EngineErrorBoundary } from '@rottay/design-system';

function App() {
  return (
    <EngineErrorBoundary>
      <Button>Click me</Button>
    </EngineErrorBoundary>
  );
}
```

### With Fallback Engine

```tsx
<EngineErrorBoundary fallbackEngine="rustic">
  <Button engine="classic">Click me</Button>
</EngineErrorBoundary>
```

If Titan fails to load, it will automatically fall back to Apollo engine.

### With Error Logging

```tsx
<EngineErrorBoundary
  onError={(error, errorInfo) => {
    // Send to monitoring service
    console.error('Engine loading failed:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }}
>
  <Button>Click me</Button>
</EngineErrorBoundary>
```

### With Custom Fallback UI

```tsx
<EngineErrorBoundary
  fallbackRender={(error, reset) => (
    <div className="error-card">
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <Button>Click me</Button>
</EngineErrorBoundary>
```

### Combined Example

```tsx
<EngineErrorBoundary
  fallbackEngine="rustic"
  onError={(error) => {
    logToSentry(error);
  }}
  fallbackRender={(error, reset) => (
    <Alert variant="error">
      <AlertTitle>Component Failed to Load</AlertTitle>
      <AlertDescription>
        {error.message}
      </AlertDescription>
      <Button onClick={reset}>Retry</Button>
    </Alert>
  )}
>
  <YourComponent />
</EngineErrorBoundary>
```

## API

### Props

```typescript
interface EngineErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;

  /** Fallback engine to try if primary fails */
  fallbackEngine?: EngineName; // 'classic' | 'modern' | 'rustic' | 'athena'

  /** Custom fallback UI render function */
  fallbackRender?: (error: Error, reset: () => void) => ReactNode;

  /** Error callback for logging/monitoring */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

### Methods

The error boundary provides a `reset()` method that can be called to clear the error state and re-render:

```tsx
fallbackRender={(error, reset) => (
  <button onClick={reset}>Retry</button>
)}
```

## Default Fallback UI

When no custom `fallbackRender` is provided, the default UI shows:

```
┌─────────────────────────────────────┐
│ ⚠ Engine Error: Failed to load     │
│   component.                        │
│   Attempting fallback to rustic...  │
│                                     │
│   Error message here                │
└─────────────────────────────────────┐
```

Styles:
- Background: `#fef2f2` (light red)
- Border: `1px solid #fecaca` (red)
- Text: `#dc2626` (dark red)
- Padding: `16px`
- Border radius: `4px`

## Error Scenarios

### 1. Network Failure
Engine bundle fails to download due to network issues.

**Solution:** Show retry button, log to monitoring

### 2. Module Not Found
Engine implementation doesn't exist for the component.

**Solution:** Fall back to a different engine (rustic as universal fallback)

### 3. Runtime Error in Engine Component
Bug in the engine implementation itself.

**Solution:** Catch error, show fallback UI, prevent app crash

### 4. Dependency Missing
Required dependency for engine not installed.

**Solution:** Fall back to minimal engine (rustic)

## Integration with createEngineComponent

The factory automatically wraps all engine components:

```tsx
export function createEngineComponent<P>(
  displayName: string,
  loaders: EngineLoaders<P>,
  options: CreateEngineComponentOptions = {}
) {
  const { fallbackEngine, onError } = options;

  return (props: P) => (
    <EngineErrorBoundary
      fallbackEngine={fallbackEngine}
      onError={onError}
    >
      <Suspense fallback={options.fallback}>
        <EngineComponent {...props} />
      </Suspense>
    </EngineErrorBoundary>
  );
}
```

## Configuration in Components

When creating engine components, you can configure error handling:

```tsx
export const Button = createEngineComponent<ButtonProps>('Button', {
  classic: () => import('./classic'),
  modern: () => import('./modern'),
  rustic: () => import('./rustic'),
}, {
  fallbackEngine: 'rustic', // Universal fallback
  onError: (error) => {
    console.error('[Button] Engine load failed:', error);
  },
});
```

## Testing

### Manual Testing

1. **Simulate Network Error:**
   ```tsx
   // Temporarily break import path
   classic: () => import('./classic-nonexistent'),
   ```

2. **Simulate Runtime Error:**
   ```tsx
   // Create buggy component
   const BuggyComponent = () => {
     throw new Error('Test error');
   };
   ```

3. **Test Fallback Engine:**
   ```tsx
   <EngineErrorBoundary fallbackEngine="rustic">
     <Component engine="nonexistent" />
   </EngineErrorBoundary>
   ```

### Unit Tests (TODO)

```tsx
describe('EngineErrorBoundary', () => {
  it('renders children when no error', () => {
    // Test normal rendering
  });

  it('shows fallback UI on error', () => {
    // Test error state
  });

  it('calls onError callback', () => {
    // Test error logging
  });

  it('resets error state', () => {
    // Test reset functionality
  });
});
```

## Future Enhancements

- [ ] **Retry logic with exponential backoff**
- [ ] **Error recovery strategies (reload page, clear cache)**
- [ ] **Integration with error monitoring services (Sentry, LogRocket)**
- [ ] **User-configurable error messages**
- [ ] **A/B testing different error UI variants**
- [ ] **Analytics tracking for error rates per engine**

## Related

- `createEngineComponent` - Factory that uses this boundary
- `EngineProvider` - Context for engine selection
- `Athena` - Pluggable engine system

## Changelog

### v1.0.0 (2024-12-25)
- ✅ Initial implementation
- ✅ Basic error catching
- ✅ Fallback engine support
- ✅ Custom fallback render
- ✅ Error callbacks
- ✅ Integration with factory
