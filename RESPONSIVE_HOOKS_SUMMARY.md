# Responsive Hooks Implementation Summary

## Overview

Successfully implemented a complete **SSR-safe responsive hooks system** for the design system. This provides developers with powerful tools for building adaptive, responsive user interfaces.

---

## Implemented Hooks

### 1. `useMediaQuery` ✅

**Location:** `/packages/core/src/system/hooks/responsive/useMediaQuery/index.ts`

**Purpose:** Detect custom media queries in React components

**Features:**
- ✅ SSR-safe (returns `false` on server)
- ✅ Uses `window.matchMedia` API
- ✅ Support for modern browsers (addEventListener)
- ✅ Legacy browser support (Safari < 14 via addListener)
- ✅ Automatic event listener cleanup
- ✅ Memoized callbacks for performance

**Signature:**
```typescript
function useMediaQuery(query: string): boolean
```

**Example:**
```tsx
const isMobile = useMediaQuery('(max-width: 639px)');
const isDark = useMediaQuery('(prefers-color-scheme: dark)');
```

---

### 2. `useBreakpoints` ✅

**Location:** `/packages/core/src/system/hooks/responsive/useBreakpoints/index.ts`

**Purpose:** Convenient detection of common breakpoints and device capabilities

**Features:**
- ✅ Mobile detection (max-width: 639px)
- ✅ Tablet detection (640px - 1023px)
- ✅ Desktop detection (min-width: 1024px)
- ✅ Touch device detection
- ✅ Reduced motion preference detection
- ✅ Convenience flags (isMobileOrTablet, isTabletOrDesktop)

**Return Type:**
```typescript
interface UseBreakpointsResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  prefersReducedMotion: boolean;
  isMobileOrTablet: boolean;
  isTabletOrDesktop: boolean;
}
```

**Example:**
```tsx
const { isMobile, isDesktop, isTouchDevice } = useBreakpoints();
```

---

### 3. `useResponsiveValue` ✅

**Location:** `/packages/core/src/system/hooks/responsive/useResponsiveValue/index.ts`

**Purpose:** Get responsive values that change based on current breakpoint

**Features:**
- ✅ Mobile-first approach
- ✅ Tailwind CSS breakpoint compatibility
- ✅ Type-safe generic implementation
- ✅ Cascade from largest to smallest breakpoint
- ✅ Always falls back to `base` value

**Signature:**
```typescript
interface ResponsiveValueConfig<T> {
  base: T;
  sm?: T;    // 640px+
  md?: T;    // 768px+
  lg?: T;    // 1024px+
  xl?: T;    // 1280px+
  '2xl'?: T; // 1536px+
}

function useResponsiveValue<T>(values: ResponsiveValueConfig<T>): T
```

**Example:**
```tsx
const columns = useResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4 });
const gap = useResponsiveValue({ base: 8, md: 16, lg: 24 });
const layout = useResponsiveValue<'vertical' | 'horizontal'>({
  base: 'vertical',
  md: 'horizontal',
});
```

---

## File Structure

```
packages/core/src/system/hooks/responsive/
├── index.ts                          # Barrel export
├── README.md                         # Comprehensive documentation
├── EXAMPLES.tsx                      # 10 usage examples
├── useMediaQuery/
│   └── index.ts                      # Media query hook
├── useBreakpoints/
│   └── index.ts                      # Breakpoint detection hook
└── useResponsiveValue/
    └── index.ts                      # Responsive value hook
```

---

## Breakpoint System

Based on Tailwind CSS mobile-first breakpoints:

| Breakpoint | Min Width | Use Case |
|------------|-----------|----------|
| `base` | 0px | Mobile-first default |
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops, desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Extra large screens |

### Device Categories

- **Mobile**: `0px - 639px` (base)
- **Tablet**: `640px - 1023px` (sm/md)
- **Desktop**: `1024px+` (lg/xl/2xl)

---

## TypeScript Support

All hooks are fully typed with comprehensive TypeScript support:

### Exported Types

```typescript
// From useBreakpoints
export interface UseBreakpointsResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  prefersReducedMotion: boolean;
  isMobileOrTablet: boolean;
  isTabletOrDesktop: boolean;
}

// From useResponsiveValue
export interface ResponsiveValueConfig<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}
```

### Type Inference

```typescript
// Automatic type inference
const columns = useResponsiveValue({ base: 1, md: 2 }); // number

// Generic type parameter
const layout = useResponsiveValue<'vertical' | 'horizontal'>({
  base: 'vertical',
  md: 'horizontal',
}); // 'vertical' | 'horizontal'
```

---

## Export Chain

### 1. Hook-level exports
```typescript
// packages/core/src/system/hooks/responsive/useMediaQuery/index.ts
export function useMediaQuery(query: string): boolean;

// packages/core/src/system/hooks/responsive/useBreakpoints/index.ts
export function useBreakpoints(): UseBreakpointsResult;
export interface UseBreakpointsResult;

// packages/core/src/system/hooks/responsive/useResponsiveValue/index.ts
export function useResponsiveValue<T>(values: ResponsiveValueConfig<T>): T;
export interface ResponsiveValueConfig<T>;
```

### 2. Responsive barrel export
```typescript
// packages/core/src/system/hooks/responsive/index.ts
export { useMediaQuery } from './useMediaQuery';
export { useBreakpoints, UseBreakpointsResult } from './useBreakpoints';
export { useResponsiveValue, ResponsiveValueConfig } from './useResponsiveValue';
```

### 3. Hooks barrel export
```typescript
// packages/core/src/system/hooks/index.ts
export {
  useMediaQuery,
  useBreakpoints,
  useResponsiveValue,
} from './responsive';
export type {
  UseBreakpointsResult,
  ResponsiveValueConfig,
} from './responsive';
```

### 4. System barrel export
```typescript
// packages/core/src/system/index.ts
export * from './hooks';
```

### 5. Package root export
```typescript
// packages/core/src/index.ts
export * from './system';
```

---

## Usage from Consumer Apps

```typescript
// Import from package
import {
  useMediaQuery,
  useBreakpoints,
  useResponsiveValue,
  UseBreakpointsResult,
  ResponsiveValueConfig,
} from '@es-rottay/designsystem-core';

// Use in components
function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const { isDesktop } = useBreakpoints();
  const columns = useResponsiveValue({ base: 1, md: 2, lg: 3 });

  return <Grid columns={columns}>...</Grid>;
}
```

---

## Documentation Files

### 1. **README.md** (9.5 KB)
- Complete API documentation
- All hooks explained with examples
- Usage patterns and best practices
- SSR considerations
- Performance notes
- Browser support
- TypeScript support

### 2. **EXAMPLES.tsx** (6.8 KB)
- 10 comprehensive examples
- Real-world use cases
- Copy-paste ready code
- Examples include:
  1. Basic media query
  2. Breakpoint detection
  3. Responsive navigation
  4. Responsive grid
  5. Responsive typography
  6. Responsive layout
  7. Conditional features
  8. Responsive images
  9. Responsive dashboard
  10. Combined usage

---

## SSR Safety

All hooks are SSR-safe with sensible defaults:

| Hook | Server Behavior | Client Behavior |
|------|----------------|-----------------|
| `useMediaQuery` | Returns `false` | Detects actual media query |
| `useBreakpoints` | All flags `false` | Detects actual breakpoints |
| `useResponsiveValue` | Returns `base` value | Returns breakpoint-specific value |

**Benefits:**
- ✅ No hydration mismatches
- ✅ Sensible defaults for SSR
- ✅ Smooth client-side takeover
- ✅ Works with Next.js, Remix, Gatsby

---

## Performance Optimizations

### 1. **Memoized Callbacks**
- Prevents unnecessary re-renders
- Stable function references

### 2. **Native Browser APIs**
- Uses `window.matchMedia` for optimal performance
- Browser-optimized event handling

### 3. **Automatic Cleanup**
- Event listeners removed on unmount
- No memory leaks

### 4. **Minimal Re-renders**
- Only updates when media query actually changes
- Efficient state management

---

## Browser Support

- ✅ **Modern Browsers**: Chrome, Firefox, Safari 14+, Edge
- ✅ **Legacy Safari**: Safari < 14 (via `addListener` fallback)
- ✅ **SSR**: Node.js environments
- ✅ **Frameworks**: Next.js, Remix, Gatsby, Create React App

---

## Testing

### Type Safety
- ✅ All hooks fully typed
- ✅ Generic type parameters work correctly
- ✅ Return types inferred properly
- ✅ No TypeScript errors

### Import/Export Chain
- ✅ All exports working correctly
- ✅ Types exported properly
- ✅ No circular dependencies
- ✅ Clean barrel exports

---

## Integration with Design System

The responsive hooks integrate seamlessly with the design system:

```typescript
import {
  useResponsiveValue,
  useBreakpoints,
  Box,
  Grid,
  Text,
} from '@es-rottay/designsystem-core';

function ResponsiveLayout() {
  const { isMobile } = useBreakpoints();
  const columns = useResponsiveValue({ base: 1, md: 2, lg: 3 });
  const spacing = useResponsiveValue({ base: 'sm', md: 'md', lg: 'lg' });

  return (
    <Box padding={spacing}>
      {isMobile ? <Text>Mobile View</Text> : <Text>Desktop View</Text>}
      <Grid columns={columns}>
        {/* Grid items */}
      </Grid>
    </Box>
  );
}
```

---

## Media Query Examples

### Viewport
```typescript
useMediaQuery('(max-width: 639px)')     // Mobile
useMediaQuery('(min-width: 1024px)')    // Desktop
useMediaQuery('(orientation: landscape)') // Landscape
```

### User Preferences
```typescript
useMediaQuery('(prefers-color-scheme: dark)')     // Dark mode
useMediaQuery('(prefers-reduced-motion: reduce)') // Reduced motion
useMediaQuery('(prefers-contrast: high)')         // High contrast
```

### Device Capabilities
```typescript
useMediaQuery('(hover: none)')       // No hover support
useMediaQuery('(pointer: coarse)')   // Touch input
useMediaQuery('(display-mode: standalone)') // PWA
```

---

## Common Patterns

### 1. Responsive Grid
```tsx
const columns = useResponsiveValue({ base: 1, md: 2, lg: 3 });
<Grid columns={columns}>{items}</Grid>
```

### 2. Conditional Rendering
```tsx
const { isMobile, isDesktop } = useBreakpoints();
{isMobile && <MobileNav />}
{isDesktop && <DesktopNav />}
```

### 3. Responsive Spacing
```tsx
const gap = useResponsiveValue({ base: 8, md: 16, lg: 24 });
<Stack gap={gap}>{children}</Stack>
```

### 4. Touch Optimization
```tsx
const { isTouchDevice } = useBreakpoints();
<Button size={isTouchDevice ? 'lg' : 'md'}>Click</Button>
```

### 5. Accessibility
```tsx
const { prefersReducedMotion } = useBreakpoints();
<Component animate={!prefersReducedMotion} />
```

---

## Future Enhancements

Potential additions for future versions:

1. **useContainerQuery** - Container queries support
2. **useOrientation** - Simplified orientation detection
3. **useViewportSize** - Viewport dimensions hook
4. **useResponsiveState** - Responsive state management
5. **useDevicePixelRatio** - High DPI detection

---

## Summary

### ✅ Completed Tasks

1. ✅ **useMediaQuery** - Custom media query detection
2. ✅ **useBreakpoints** - Common breakpoint detection
3. ✅ **useResponsiveValue** - Responsive values by breakpoint
4. ✅ **Barrel exports** - Clean export chain
5. ✅ **TypeScript types** - Full type safety
6. ✅ **SSR safety** - Server-side rendering support
7. ✅ **Documentation** - Comprehensive README
8. ✅ **Examples** - 10 real-world examples
9. ✅ **Performance** - Optimized implementation
10. ✅ **Browser support** - Modern + legacy browsers

### 📦 Deliverables

- **3 Hooks** - useMediaQuery, useBreakpoints, useResponsiveValue
- **2 Interfaces** - UseBreakpointsResult, ResponsiveValueConfig
- **6 Files** - 3 hook files, 1 barrel export, 1 README, 1 examples
- **100% TypeScript** - Fully typed implementation
- **100% SSR-safe** - Works in all environments
- **10 Examples** - Comprehensive usage demonstrations

---

## Import Paths

```typescript
// Recommended import (from package root)
import {
  useMediaQuery,
  useBreakpoints,
  useResponsiveValue,
} from '@es-rottay/designsystem-core';

// Also available via system
import {
  useMediaQuery,
  useBreakpoints,
  useResponsiveValue,
} from '@es-rottay/designsystem-core/system';

// Direct import (not recommended)
import { useMediaQuery } from '@es-rottay/designsystem-core/system/hooks/responsive';
```

---

**Status:** ✅ Complete and ready for use

**Documentation:** 📚 Comprehensive (README + Examples)

**Testing:** ✅ Type-checked and verified

**Integration:** ✅ Exported from package root
