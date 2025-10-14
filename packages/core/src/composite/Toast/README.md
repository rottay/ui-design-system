# Toast System

A complete, theme-aware toast notification system for displaying temporary messages to users.

## Features

- **5 Toast Types**: success, error, warning, info, loading
- **Theme-Aware Styling**: Automatically adapts to all 8 design system themes
- **Position Control**: 6 positions (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
- **Auto-Dismiss**: Configurable duration with visual progress bar
- **Actions**: Add buttons like "Undo" or "Retry"
- **Stacking**: Multiple toasts stack gracefully
- **Manual Control**: Dismiss individual toasts or all at once
- **Animations**: Smooth enter/exit animations
- **TypeScript**: Full type safety

## Installation

The Toast system is included in the design system core package:

```tsx
import { ToastProvider, useToast } from '@es-rottay/designsystem-core';
```

## Setup

Wrap your app with `ToastProvider` (typically alongside `ThemeProvider`):

```tsx
// app/layout.tsx or app/providers.tsx
import { ThemeProvider, ToastProvider } from '@es-rottay/designsystem-core';

export function Providers({ children }) {
  return (
    <ThemeProvider defaultTemplate="spotify">
      <ToastProvider defaultPosition="top-right" maxToasts={5}>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
```

### ToastProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultPosition` | `ToastPosition` | `'top-right'` | Default position for toasts |
| `maxToasts` | `number` | `5` | Maximum number of toasts to show at once |

## Basic Usage

Use the `useToast()` hook in any component:

```tsx
import { useToast } from '@es-rottay/designsystem-core';

function MyComponent() {
  const toast = useToast();

  return (
    <button onClick={() => toast.success('Success!')}>
      Show Toast
    </button>
  );
}
```

## API

### useToast() Returns

```typescript
{
  // Main method - full control
  toast: (options: ToastOptions) => string;

  // Shorthand methods
  success: (title: string, options?) => string;
  error: (title: string, options?) => string;
  warning: (title: string, options?) => string;
  info: (title: string, options?) => string;
  loading: (title: string, options?) => string; // duration: 0 by default

  // Control methods
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
```

### ToastOptions

```typescript
interface ToastOptions {
  id?: string;                    // Optional custom ID
  type?: ToastType;               // 'success' | 'error' | 'warning' | 'info' | 'loading'
  title?: string;                 // Main message
  description?: string;           // Additional details
  duration?: number;              // Auto-dismiss time in ms (0 = manual dismiss)
  action?: ToastAction;           // Action button
  closable?: boolean;             // Show close button (default: true)
  icon?: ReactNode;               // Custom icon (overrides type icon)
  position?: ToastPosition;       // Toast position
}

interface ToastAction {
  label: string;                  // Button text
  onClick: () => void;            // Button handler
}
```

## Examples

### Basic Toasts

```tsx
// Success
toast.success('File uploaded!');

// Error
toast.error('Upload failed');

// Warning
toast.warning('Connection unstable');

// Info
toast.info('New version available');

// Loading
toast.loading('Processing...');
```

### With Description

```tsx
toast.error('Upload failed', {
  description: 'Failed to upload file. Please check your connection and try again.',
});
```

### With Action Button

```tsx
toast.info('Message deleted', {
  description: 'The message has been moved to trash.',
  action: {
    label: 'Undo',
    onClick: () => {
      // Restore message
      toast.success('Message restored!');
    },
  },
});
```

### Custom Duration

```tsx
// Short duration (2 seconds)
toast.info('Quick message', { duration: 2000 });

// Long duration (10 seconds)
toast.warning('Important message', { duration: 10000 });

// Manual dismiss (duration: 0)
const id = toast.loading('Processing...', { duration: 0 });
// Later...
toast.dismiss(id);
```

### Different Positions

```tsx
toast.success('Top left', { position: 'top-left' });
toast.info('Top center', { position: 'top-center' });
toast.error('Bottom right', { position: 'bottom-right' });
```

### Manual Dismiss

```tsx
// Dismiss specific toast
const id = toast.loading('Loading...');
setTimeout(() => {
  toast.dismiss(id);
  toast.success('Done!');
}, 2000);

// Dismiss all toasts
toast.dismissAll();
```

### Complex Workflow

```tsx
async function uploadFile(file: File) {
  const loadingId = toast.loading('Uploading file...', {
    description: 'Please wait while we process your file.',
    duration: 0, // Don't auto-dismiss
  });

  try {
    await api.uploadFile(file);

    toast.dismiss(loadingId);
    toast.success('Upload complete!', {
      description: 'Your file has been successfully uploaded.',
      action: {
        label: 'View File',
        onClick: () => router.push('/files'),
      },
    });
  } catch (error) {
    toast.dismiss(loadingId);
    toast.error('Upload failed', {
      description: error.message,
      action: {
        label: 'Retry',
        onClick: () => uploadFile(file),
      },
    });
  }
}
```

## Theme-Specific Styles

The Toast component automatically adapts to your active theme:

### Spotify (Dark)
- Background: `#181818`
- Border Radius: `8px`
- Box Shadow: Deep, dramatic shadows
- Font Weight: Bold (600-700)
- Progress Bar: 3px height

### Stripe (Professional)
- Background: `#FFFFFF`
- Border Radius: `6px`
- Box Shadow: Subtle elevation
- Font Weight: Medium (500-600)
- Progress Bar: 2px height

### Notion (Minimal)
- Background: `#FFFFFF`
- Border Radius: `3px` (very square)
- Box Shadow: Signature Notion shadow
- Font Weight: Semi-bold (600)
- Progress Bar: 2px height

### Linear (Modern)
- Background: `#FFFFFF`
- Border Radius: `12px` (very rounded)
- Box Shadow: Subtle ring + shadow
- Font Weight: Medium (500-600)
- Progress Bar: 2px height

## Best Practices

1. **Use Appropriate Types**: Match toast type to message severity
   - `success`: Confirmation of successful actions
   - `error`: Critical errors that need attention
   - `warning`: Potential issues or warnings
   - `info`: General information or updates
   - `loading`: Ongoing processes

2. **Keep Messages Concise**: Titles should be brief (1-5 words), descriptions provide details

3. **Use Actions Wisely**: Only include actions that are immediately relevant (Undo, Retry, View)

4. **Don't Abuse Loading Toasts**: Always dismiss loading toasts (either manually or with success/error)

5. **Consider Position**:
   - `top-right`: Default, non-intrusive
   - `top-center`: Important messages
   - `bottom-*`: Less critical updates

6. **Limit Toasts**: Use `maxToasts` to prevent overwhelming users

## Accessibility

- **Keyboard Support**: Close button is keyboard accessible
- **ARIA Labels**: Proper semantic HTML structure
- **Color Contrast**: Icons and text meet WCAG standards
- **Motion**: Respects `prefers-reduced-motion` (animations are CSS-based)

## Technical Details

- **Portal Rendering**: Toasts render in a portal attached to `document.body`
- **Z-Index**: 9999 to appear above all content
- **Animation**: CSS keyframe animations for smooth transitions
- **Progress Bar**: Real-time visual countdown using intervals
- **Stack Management**: Automatic removal of oldest toasts when limit reached

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  ToastType,
  ToastPosition,
  ToastAction,
  ToastOptions,
  ToastContextValue,
} from '@es-rottay/designsystem-core';
```
