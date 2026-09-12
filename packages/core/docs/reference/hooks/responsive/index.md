# Responsive Hooks

SSR-safe responsive behavior detection hooks for building adaptive user interfaces.

## Overview

ONE AUTHORITY. `useResponsive()` is the only place viewport state is derived:
it reads a shared external store through `useSyncExternalStore`, so the seven
`matchMedia` queries exist once per process no matter how many components ask.
Everything below is a projection of it.

1. **`useResponsive`** - the snapshot: device tier, active breakpoint, pointer,
   orientation, reduced motion, virtual-keyboard inset
2. **`useBreakpoints`** - the device-tier flags (mobile/tablet/desktop)
3. **`useResponsiveValue`** - a `ResponsiveValue` resolved at the current step
4. **`usePhoneBreakpoint`** - the phone flag alone
5. **`useMediaQuery`** - an arbitrary NON-viewport query (preference, pointer)

With a `ResponsiveProvider` in the tree the context answers, because it is the
only value carrying the request's `ssrViewport` hint and the virtual-keyboard
inset. Without one the shared store answers, so a provider-less consumer reports
the real viewport instead of degrading to a phone.

All hooks are **SSR-safe**: a request that declared no viewport hint gets the
mobile-first baseline.

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
import { useMediaQuery } from '@rottay/design-system';

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
import { useBreakpoints } from '@rottay/design-system';

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

Resolve a `ResponsiveValue` at the current breakpoint.

```typescript
type ResponsiveValue<T> = T | {
  base?: T; xs?: T;            // 0px (aliases of each other; `phone` too)
  sm?: T;                       // 640px+  (alias: `tablet`)
  md?: T;                       // 768px+
  lg?: T;                       // 1024px+ (alias: `desktop`)
  xl?: T;                       // 1280px+
  '2xl'?: T;                    // 1536px+
};

function useResponsiveValue<T>(values: ResponsiveValue<T> | undefined): T | undefined
```

ONE CONTRACT. `ResponsiveValue` is the same type the layout primitives accept on
`padding`, `gap`, `columns` and every other responsive prop, and the same one
`generateResponsiveCSS` projects to CSS channels. The hook used to declare a
`ResponsiveValueConfig` of its own — `base` required, no `xs`, no device
aliases — which is the second vocabulary this replaced.

**Breakpoint Cascade:**

Mobile-first: the answer is the value declared at the active breakpoint, or at
the nearest declared step below it. `undefined` means the ladder declares
nothing at or below that step — which is a real answer, not a failure: it is how
`{ lg: 4 }` says "no columns below 1024px".

**Examples:**

```tsx
import { useResponsiveValue } from '@rottay/design-system';

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
  // `base` is declared, so the ladder always answers; `?? 'small'` is the
  // honest floor for a ladder that might not.
  const imageSize = useResponsiveValue({
    base: 'small',
    md: 'medium',
    lg: 'large',
  }) ?? 'small';

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

- **`useResponsive`**: answers the request's `ssrViewport` hint, or the
  mobile-first baseline when the request declared nothing
- **`useBreakpoints`** / **`usePhoneBreakpoint`**: the same snapshot, projected
- **`useResponsiveValue`**: the value declared at that step, or below it
- **`useMediaQuery`**: returns `false` on server

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

- Public React hook facade: `packages/core/src/infrastructure/runtime/facade/react-hooks/`
- Theming: `packages/core/src/infrastructure/runtime/theming/`
- Design Tokens: `packages/core/src/foundation/tokens/`

---

## Where the CSS half lives

A responsive PROP is not resolved in JavaScript at all. `generateResponsiveCSS`
projects it onto governed channels — one `--_ds-rsp-*` custom property per
declared breakpoint plus a `data-ds-responsive` token list — and one static
sheet (`foundation/tokens/css/foundation/responsive/channels`) owns every
`@media` prelude. `Show`, `Hide` and `ResponsiveSlot` do the same for
visibility, against `foundation/tokens/css/foundation/responsive/visibility`.

Neither injects a `<style>` element per instance, so a strict CSP cannot drop
them and the cascade can rank them.

---

## Adaptation: postures and the `adapt` slot

A layout-sensitive family does not read breakpoints. It accepts `adapt` —
per-posture deltas the application declares — and resolves it with
`useAdaptation` (`src/infrastructure/runtime/adaptation`).

| Axis | Postures | Resolved from |
|---|---|---|
| viewport | `phone`, `tablet`, `desktop` | `useResponsive()`: the request's `ssrViewport` hint on the server, the shared store in the browser |
| container | `compact`, `regular`, `expanded` | one `ResizeObserver` on the family's own box, on the tenant's container ladder (`responsive.posture`) |

```tsx
const { posture, adaptation, postureAttribute } = useAdaptation(adapt, {
  base: FAMILY_BASE,
  defaults: FAMILY_DEFAULTS,
  containerRef: rootRef,
});
return <div ref={rootRef} data-posture={postureAttribute}>…</div>;
```

Layers apply in a fixed order: the family base, the family's own posture
defaults, then the application's `adapt`; inside each source the container
entry applies after the viewport entry. `data-posture` is a token list —
`desktop compact` once the box is measured — so a skin selects
`[data-posture~='compact']`. Attach `containerRef` only where the family's
structure changes with its box; visual-only changes belong to the family's
named `@container` queries.

`PatternDataTable` is the reference implementation:
`adapt={{ phone: { columns: { keep: ['name', 'status', 'owner'] }, presentation: 'cards' } }}`.
The declared families and the gate that holds them to the slot are
`LAYOUT_SENSITIVE_FAMILIES` and `scripts/check/family-cut/adapt-slot`.
