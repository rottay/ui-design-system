# Responsive Hooks

SSR-safe responsive behavior detection hooks for building adaptive user interfaces.

## Overview

The responsive hooks system provides three powerful hooks for detecting and responding to viewport changes:

1. **`useMediaQuery`** - Custom media query detection
2. **`useBreakpoints`** - Common breakpoint detection (mobile/tablet/desktop)
3. **`useResponsiveValue`** - Responsive values based on current breakpoint

All hooks are **SSR-safe** and return sensible defaults when rendered on the server.

---

## Hooks

### `useMediaQuery`

Detect custom media queries in React components.

```typescript
function useMediaQuery(query: string): boolean
```

**Features:**
- ✅ SSR-safe (returns `false` on server)
- ✅ Uses `window.matchMedia` for optimal performance
- ✅ Supports modern and legacy browsers (Safari < 14)
- ✅ Automatically cleans up event listeners
- ✅ Memoized callbacks to prevent unnecessary re-renders

**Examples:**

```tsx
import { useMediaQuery } from '@es-rottay/designsystem-core';

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
      {isDark && <DarkModeIcon />}
    </div>
  );
}
```

---

### `useBreakpoints`

Convenient hook for detecting common breakpoints and device capabilities.

```typescript
interface UseBreakpointsResult {
  isMobile: boolean;          // max-width: 639px
  isTablet: boolean;          // 640px - 1023px
  isDesktop: boolean;         // min-width: 1024px
  isTouchDevice: boolean;     // Touch-capable device
  prefersReducedMotion: boolean;
  isMobileOrTablet: boolean;  // Convenience flag
  isTabletOrDesktop: boolean; // Convenience flag
}

function useBreakpoints(): UseBreakpointsResult
```

**Breakpoint System:**

Based on Tailwind CSS mobile-first breakpoints:
- **Mobile**: `0px - 639px`
- **Tablet**: `640px - 1023px` (sm)
- **Desktop**: `1024px+` (lg)

**Examples:**

```tsx
import { useBreakpoints } from '@es-rottay/designsystem-core';

function Navigation() {
  const {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    prefersReducedMotion,
  } = useBreakpoints();

  if (isMobile) {
    return <MobileNav />;
  }

  if (isTablet) {
    return <TabletNav />;
  }

  return (
    <DesktopNav
      enableAnimations={!prefersReducedMotion}
      optimizeForTouch={isTouchDevice}
    />
  );
}
```

```tsx
// Conditional rendering based on device
function Dashboard() {
  const { isMobileOrTablet, isDesktop } = useBreakpoints();

  return (
    <div>
      {isMobileOrTablet && <MobileDashboard />}
      {isDesktop && <FullDashboard />}
    </div>
  );
}
```

---

### `useResponsiveValue`

Get responsive values that change based on the current breakpoint.

```typescript
interface ResponsiveValueConfig<T> {
  base: T;   // Always applies (mobile-first)
  sm?: T;    // 640px+
  md?: T;    // 768px+
  lg?: T;    // 1024px+
  xl?: T;    // 1280px+
  '2xl'?: T; // 1536px+
}

function useResponsiveValue<T>(values: ResponsiveValueConfig<T>): T
```

**Breakpoint Cascade:**

The hook follows a mobile-first approach and returns the most specific value that matches:

1. Check `2xl` (1536px+)
2. Check `xl` (1280px+)
3. Check `lg` (1024px+)
4. Check `md` (768px+)
5. Check `sm` (640px+)
6. Fall back to `base`

**Examples:**

```tsx
import { useResponsiveValue } from '@es-rottay/designsystem-core';

// Responsive grid columns
function ProductGrid() {
  const columns = useResponsiveValue({
    base: 1,    // Mobile: 1 column
    sm: 2,      // Tablet: 2 columns
    md: 3,      // Desktop: 3 columns
    lg: 4,      // Large: 4 columns
  });

  return <Grid columns={columns}>{/* ... */}</Grid>;
}

// Responsive spacing
function Section() {
  const padding = useResponsiveValue({
    base: 16,   // Mobile: 16px
    md: 24,     // Tablet: 24px
    lg: 32,     // Desktop: 32px
  });

  return <div style={{ padding }}>{/* ... */}</div>;
}

// Responsive typography
function Heading() {
  const fontSize = useResponsiveValue({
    base: '24px',
    md: '32px',
    lg: '40px',
    xl: '48px',
  });

  return <h1 style={{ fontSize }}>Title</h1>;
}

// Complex responsive values
function Card() {
  const layout = useResponsiveValue<'vertical' | 'horizontal'>({
    base: 'vertical',
    md: 'horizontal',
  });

  const gap = useResponsiveValue({
    base: 8,
    md: 16,
    lg: 24,
  });

  return (
    <div className={layout === 'vertical' ? 'flex-col' : 'flex-row'} style={{ gap }}>
      {/* ... */}
    </div>
  );
}
```

---

## Usage Patterns

### Responsive Layout

```tsx
function ResponsiveLayout() {
  const columns = useResponsiveValue({ base: 1, md: 2, lg: 3 });
  const gap = useResponsiveValue({ base: 16, md: 24 });
  const { isMobile } = useBreakpoints();

  return (
    <div>
      {isMobile && <MobileHeader />}

      <Grid columns={columns} gap={gap}>
        <Card />
        <Card />
        <Card />
      </Grid>
    </div>
  );
}
```

### Conditional Features

```tsx
function App() {
  const { isTouchDevice, prefersReducedMotion } = useBreakpoints();

  return (
    <ThemeProvider
      animations={!prefersReducedMotion}
      touchOptimized={isTouchDevice}
    >
      <AppContent />
    </ThemeProvider>
  );
}
```

### Responsive Images

```tsx
function ResponsiveImage() {
  const imageSize = useResponsiveValue({
    base: 'small',
    md: 'medium',
    lg: 'large',
  });

  const imageSizes = {
    small: 'image-sm.jpg',
    medium: 'image-md.jpg',
    large: 'image-lg.jpg',
  };

  return <img src={imageSizes[imageSize]} alt="Responsive" />;
}
```

---

## SSR Considerations

All hooks are SSR-safe and handle server-side rendering correctly:

- **`useMediaQuery`**: Returns `false` on server
- **`useBreakpoints`**: Returns all `false` on server (except combinations)
- **`useResponsiveValue`**: Returns `base` value on server

This ensures:
1. No hydration mismatches
2. Sensible defaults for server-rendered content
3. Smooth client-side takeover

```tsx
// This is safe for SSR
function SafeComponent() {
  const isMobile = useMediaQuery('(max-width: 639px)');

  // On server: renders desktop view (isMobile = false)
  // On client: hydrates, then updates to correct view
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

---

## Performance

All hooks are optimized for performance:

1. **Memoized callbacks** - Prevent unnecessary re-renders
2. **Event listener cleanup** - Automatic cleanup on unmount
3. **Minimal re-renders** - Only update when media query actually changes
4. **Browser optimization** - Uses native `matchMedia` API

---

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Legacy Safari < 14 (via `addListener` fallback)
- ✅ SSR environments (Node.js)
- ✅ All major frameworks (Next.js, Remix, Gatsby)

---

## TypeScript Support

All hooks are fully typed with TypeScript:

```typescript
// Full type inference
const columns = useResponsiveValue({ base: 1, md: 2 }); // number
const layout = useResponsiveValue<'vertical' | 'horizontal'>({ base: 'vertical' });

// Type-safe breakpoint results
const { isMobile, isDesktop }: UseBreakpointsResult = useBreakpoints();
```

---

## API Reference

### Breakpoint Values

| Breakpoint | Min Width | Use Case |
|------------|-----------|----------|
| `base` | 0px | Mobile-first default |
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops, desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Extra large screens |

### Media Query Examples

```typescript
// Viewport
'(max-width: 639px)'           // Mobile
'(min-width: 1024px)'          // Desktop
'(orientation: landscape)'     // Landscape

// User Preferences
'(prefers-color-scheme: dark)' // Dark mode
'(prefers-reduced-motion: reduce)' // Reduced motion

// Device Capabilities
'(hover: none)'                // No hover support
'(pointer: coarse)'            // Touch input
```

---

## Related

- [System Hooks](/packages/core/src/system/hooks/README.md)
- [Theme System](/packages/core/src/system/providers/theme/README.md)
- [Design Tokens](/packages/core/src/system/tokens/README.md)
