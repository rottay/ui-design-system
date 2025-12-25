# ErrorBoundary Component

A React Error Boundary component that catches JavaScript errors anywhere in the component tree, logs those errors, and displays a fallback UI instead of crashing the entire application.

## Features

- **Error Catching**: Catches React errors in component tree using `componentDidCatch`
- **Custom Fallback**: Support for custom fallback components
- **Error Logging**: Optional `onError` callback for logging to external services
- **Reset Functionality**: "Try Again" button to reset error state
- **Theme-Aware**: Default fallback UI adapts to all 8 themes (Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel, Base)
- **Development Mode**: Displays error message and stack trace in development
- **TypeScript**: Full TypeScript support with type definitions

## Basic Usage

```tsx
import { ErrorBoundary } from '@es-rottay/designsystem-core';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

## With Custom Fallback

```tsx
import { ErrorBoundary } from '@es-rottay/designsystem-core';

function App() {
  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h1>Oops! Something broke</h1>
          <p>We're working on fixing this.</p>
        </div>
      }
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

## With Function Fallback

```tsx
import { ErrorBoundary } from '@es-rottay/designsystem-core';

function App() {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div>
          <h1>Error: {error.message}</h1>
          <button onClick={resetError}>Try Again</button>
        </div>
      )}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

## With Error Logging

```tsx
import { ErrorBoundary } from '@es-rottay/designsystem-core';

function App() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to external service (e.g., Sentry, LogRocket)
    console.error('Error caught by boundary:', error, errorInfo);

    // Send to analytics
    analytics.track('error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

## With Reset Callback

```tsx
import { ErrorBoundary } from '@es-rottay/designsystem-core';

function App() {
  const handleReset = () => {
    // Clean up state, reload data, etc.
    console.log('Error boundary reset');
    window.location.reload();
  };

  return (
    <ErrorBoundary onReset={handleReset}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

## Multiple Error Boundaries

You can nest multiple error boundaries to isolate errors:

```tsx
import { ErrorBoundary } from '@es-rottay/designsystem-core';

function App() {
  return (
    <ErrorBoundary>
      <Header />

      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>

      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>

      <Footer />
    </ErrorBoundary>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | Child components to wrap |
| `fallback` | `ReactNode \| ((error: Error, resetError: () => void) => ReactNode)` | `DefaultErrorFallback` | Custom fallback UI |
| `onError` | `(error: Error, errorInfo: React.ErrorInfo) => void` | - | Callback when error is caught |
| `onReset` | `() => void` | - | Callback when error is reset |
| `className` | `string` | - | CSS class for container |
| `style` | `React.CSSProperties` | - | Inline styles for container |

## Theme-Specific Styling

The default fallback UI automatically adapts to the current theme:

### Spotify Theme
- Background: `#121212` (dark)
- Border Radius: `8px`
- Box Shadow: `0 4px 12px rgba(0,0,0,0.4)`
- Icon Size: `64px`
- Title: `32px`, `fontWeight: 700`

### Stripe Theme
- Background: `#FAFAFA` (light)
- Border Radius: `6px`
- Box Shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Icon Size: `56px`
- Title: `28px`, `fontWeight: 600`

### Notion Theme
- Background: `#FFFFFF`
- Border Radius: `3px` (square)
- Box Shadow: Notion signature shadow
- Icon Size: `48px`
- Title: `26px`, `fontWeight: 700`

### Linear Theme
- Background: `#F9FAFB`
- Border Radius: `12px` (rounded)
- Box Shadow: `0 1px 2px rgba(0,0,0,0.05)`
- Icon Size: `64px`
- Title: `30px`, `fontWeight: 600`

## Development Mode

In development mode (`NODE_ENV === 'development'`), the default fallback displays:
- Error name and message
- Full stack trace
- Styled error details container

In production mode, error details are hidden for security.

## Testing Error Boundaries

Create a component that throws an error:

```tsx
function BuggyComponent() {
  throw new Error('I crashed!');
  return <div>Should not render</div>;
}

// Test it
function App() {
  return (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
}
```

## Best Practices

1. **Placement**: Place error boundaries at strategic locations (page level, feature level)
2. **Granularity**: Don't wrap the entire app in one boundary - isolate errors by feature
3. **Logging**: Always use `onError` to log errors to monitoring services
4. **User Experience**: Provide clear recovery actions in custom fallbacks
5. **Testing**: Test error boundaries with components that throw errors
6. **Production**: Ensure error details are hidden in production

## Notes

- Error boundaries only catch errors in **rendering**, **lifecycle methods**, and **constructors**
- They do **NOT** catch errors in:
  - Event handlers (use try-catch instead)
  - Asynchronous code (setTimeout, promises)
  - Server-side rendering
  - Errors thrown in the error boundary itself

## TypeScript

```typescript
import type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  DefaultErrorFallbackProps,
} from '@es-rottay/designsystem-core';
```
