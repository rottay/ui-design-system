# Engine Error Boundary Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               EngineProvider                         │   │
│  │  (engine: 'titan' | 'hermes' | 'apollo' | 'athena') │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │        EngineErrorBoundary                    │ │   │
│  │  │  - Catches loading errors                     │ │   │
│  │  │  - Provides fallback UI                       │ │   │
│  │  │  - Supports engine fallback                   │ │   │
│  │  │                                                │ │   │
│  │  │  ┌──────────────────────────────────────────┐ │ │   │
│  │  │  │         Suspense                         │ │ │   │
│  │  │  │  (Shows loading fallback)                │ │ │   │
│  │  │  │                                          │ │ │   │
│  │  │  │  ┌────────────────────────────────────┐ │ │ │   │
│  │  │  │  │     Engine Component Router       │ │ │ │   │
│  │  │  │  │  - Selects engine implementation  │ │ │ │   │
│  │  │  │  │  - Lazy loads component          │ │ │ │   │
│  │  │  │  │                                  │ │ │ │   │
│  │  │  │  │  Loads one of:                  │ │ │ │   │
│  │  │  │  │  ├─ titan/Button.tsx            │ │ │ │   │
│  │  │  │  │  ├─ hermes/Button.tsx           │ │ │ │   │
│  │  │  │  │  ├─ apollo/Button.tsx           │ │ │ │   │
│  │  │  │  │  └─ athena/Button.tsx           │ │ │ │   │
│  │  │  │  └────────────────────────────────────┘ │ │ │   │
│  │  │  └──────────────────────────────────────────┘ │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Error Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Normal Flow                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Component renders
                            │
                            ▼
                    Engine selected
                            │
                            ▼
                  Lazy load component
                            │
                ┌───────────┴───────────┐
                │                       │
            Success                   Error
                │                       │
                ▼                       ▼
        Render component    EngineErrorBoundary catches
                │                       │
                │           ┌───────────┴───────────┐
                │           │                       │
                │     fallbackRender           Default UI
                │       provided?                   │
                │           │                       │
                │       ┌───┴───┐                   │
                │     Yes      No                   │
                │       │       │                   │
                │       ▼       ▼                   ▼
                │   Custom   Show default     Show error
                │    Error   error UI         message
                │     UI         │                 │
                │       │        │                 │
                └───────┴────────┴─────────────────┘
                            │
                            ▼
                    User can reset/retry
```

## State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                  Error Boundary States                      │
└─────────────────────────────────────────────────────────────┘

  ┌─────────────┐
  │   INITIAL   │  hasError: false
  │             │  error: undefined
  └──────┬──────┘
         │
         │ Component throws error
         │
         ▼
  ┌─────────────┐
  │    ERROR    │  hasError: true
  │             │  error: Error object
  └──────┬──────┘
         │
         │ reset() called
         │
         ▼
  ┌─────────────┐
  │   INITIAL   │  hasError: false (back to start)
  │             │  error: undefined
  └─────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Props Flow                             │
└─────────────────────────────────────────────────────────────┘

  User Component
       │
       │ props
       ▼
  createEngineComponent(options)
       │
       │ {
       │   fallback?: ReactNode
       │   fallbackEngine?: EngineName
       │   onError?: (error, info) => void
       │ }
       ▼
  EngineErrorBoundary
       │
       ├─> fallbackEngine → Passed to fallback UI
       ├─> onError → Called on error
       └─> children → Wrapped component
            │
            ▼
         Suspense
            │
            │ fallback
            ▼
       Loading UI
            │
            ▼
      Engine Component
```

## Error Handling Scenarios

### Scenario 1: Network Failure
```
User requests component
       ↓
Engine tries to load bundle
       ↓
Network error (CDN down, offline, etc.)
       ↓
Error thrown during import()
       ↓
Error boundary catches
       ↓
Shows: "Failed to load component"
       ↓
Option: Retry with fallbackEngine
```

### Scenario 2: Missing Implementation
```
User requests Button with engine="titan"
       ↓
Factory tries: import('./titan/Button')
       ↓
File doesn't exist
       ↓
Module not found error
       ↓
Error boundary catches
       ↓
fallbackEngine="apollo" specified
       ↓
Retries with apollo engine
       ↓
Success or show error
```

### Scenario 3: Runtime Error
```
Component loads successfully
       ↓
Component executes (render)
       ↓
Runtime error in component code
       ↓
Error boundary catches
       ↓
Shows error UI
       ↓
onError callback logs to Sentry
       ↓
User can reset to retry
```

## Integration Points

### 1. Factory Integration
```typescript
// packages/core/src/system/engines/factory/index.tsx

export function createEngineComponent<P>(
  displayName: string,
  loaders: EngineLoaders<P>,
  options: CreateEngineComponentOptions = {}
) {
  // Extract error boundary options
  const { fallbackEngine, onError } = options;

  return (props: P) => (
    <EngineErrorBoundary
      fallbackEngine={fallbackEngine}
      onError={onError}
    >
      <Suspense fallback={options.fallback}>
        <Component {...props} />
      </Suspense>
    </EngineErrorBoundary>
  );
}
```

### 2. Component Usage
```typescript
// User creates a component
export const Button = createEngineComponent<ButtonProps>('Button', {
  titan: () => import('./titan'),
  hermes: () => import('./hermes'),
  apollo: () => import('./apollo'),
}, {
  // Error boundary automatically applied
  fallbackEngine: 'apollo',
  onError: (error) => console.error(error),
});
```

### 3. Error Monitoring Integration
```typescript
// App-level configuration
const monitoringConfig = {
  onError: (error: Error, errorInfo: ErrorInfo) => {
    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Send to custom analytics
    analytics.track('engine_load_error', {
      error: error.message,
      stack: error.stack,
    });
  },
};

// Use in component creation
export const Button = createEngineComponent('Button', loaders, {
  onError: monitoringConfig.onError,
});
```

## Lifecycle Methods

### getDerivedStateFromError
```typescript
static getDerivedStateFromError(error: Error): State {
  // Called during render phase
  // Must be pure (no side effects)
  // Returns new state
  return { hasError: true, error };
}
```

### componentDidCatch
```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Called during commit phase
  // Can have side effects
  // Used for logging
  console.error('[EngineErrorBoundary] Engine loading failed:', error);
  this.props.onError?.(error, errorInfo);
}
```

### reset
```typescript
reset = () => {
  // User-initiated reset
  // Clears error state
  // Re-renders children
  this.setState({ hasError: false, error: undefined });
};
```

## Performance Characteristics

### Normal Operation
- **Overhead:** Minimal (just component wrapper)
- **Re-renders:** Only when children change
- **Memory:** Single state object

### Error State
- **Overhead:** Renders fallback UI instead of children
- **Re-renders:** Only on reset
- **Memory:** Stores error object until reset

### Reset Operation
- **Overhead:** Single state update
- **Re-renders:** Children re-mount
- **Memory:** Error object garbage collected

## Type Safety

### Props Types
```typescript
interface EngineErrorBoundaryProps {
  children: ReactNode;
  fallbackEngine?: EngineName; // ← Typed to valid engines
  fallbackRender?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

### State Types
```typescript
interface State {
  hasError: boolean;
  error?: Error; // ← Optional until error occurs
}
```

### Factory Types
```typescript
interface CreateEngineComponentOptions {
  fallback?: React.ReactNode;
  athenaEnabled?: boolean;
  fallbackEngine?: EngineName; // ← Integrated into factory
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('EngineErrorBoundary', () => {
  it('renders children normally');
  it('catches errors and shows fallback UI');
  it('calls onError callback');
  it('resets error state on reset()');
  it('uses custom fallbackRender');
  it('shows fallbackEngine in message');
});
```

### Integration Tests
```typescript
describe('EngineErrorBoundary + Factory', () => {
  it('catches lazy loading errors');
  it('falls back to different engine');
  it('integrates with Suspense');
  it('works with Athena registry');
});
```

### E2E Tests
```typescript
describe('Error Boundary E2E', () => {
  it('handles network failures');
  it('handles missing modules');
  it('handles runtime errors');
  it('allows user retry');
});
```

## Monitoring & Observability

### Metrics to Track
- Error rate by engine
- Error rate by component
- Fallback engine usage
- Reset button clicks
- Time to error recovery

### Logging
```typescript
// Example error log structure
{
  timestamp: '2024-12-25T10:00:00Z',
  level: 'error',
  message: 'Engine loading failed',
  context: {
    engine: 'titan',
    component: 'Button',
    fallbackEngine: 'apollo',
    errorMessage: 'Network error',
    stack: '...'
  }
}
```

## Best Practices

1. **Always provide fallbackEngine** for critical components
2. **Use onError** to log to monitoring services
3. **Provide custom fallbackRender** for better UX
4. **Set fallbackEngine to 'apollo'** (most reliable)
5. **Don't catch errors silently** - always log
6. **Test error scenarios** in development
7. **Monitor error rates** in production

## Related Documentation

- [Factory README](../factory/README.md)
- [Athena README](../athena/README.md)
- [Engine System Overview](../README.md)
