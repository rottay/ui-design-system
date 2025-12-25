# Responsive Hooks - Quick Reference

## Import

```tsx
import {
  useMediaQuery,
  useBreakpoints,
  useResponsiveValue,
} from '@es-rottay/designsystem-core';
```

---

## useMediaQuery

**Detect custom media queries**

```tsx
const matches = useMediaQuery(query: string): boolean
```

### Examples

```tsx
const isMobile = useMediaQuery('(max-width: 639px)');
const isDark = useMediaQuery('(prefers-color-scheme: dark)');
const isLandscape = useMediaQuery('(orientation: landscape)');
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
const isTouchDevice = useMediaQuery('(hover: none)');
```

---

## useBreakpoints

**Common breakpoint detection**

```tsx
const {
  isMobile,             // max-width: 639px
  isTablet,             // 640px - 1023px
  isDesktop,            // min-width: 1024px
  isTouchDevice,        // Touch-capable
  prefersReducedMotion, // Reduced motion preference
  isMobileOrTablet,     // Convenience flag
  isTabletOrDesktop,    // Convenience flag
} = useBreakpoints();
```

### Examples

```tsx
// Conditional rendering
{isMobile && <MobileNav />}
{isDesktop && <DesktopNav />}

// Conditional props
<Button size={isMobile ? 'sm' : 'lg'} />
<Card padding={isDesktop ? 24 : 16} />

// Touch optimization
<Component touchOptimized={isTouchDevice} />

// Accessibility
<Animation disabled={prefersReducedMotion} />
```

---

## useResponsiveValue

**Responsive values by breakpoint**

```tsx
const value = useResponsiveValue<T>({
  base: T,   // 0px+ (required)
  sm?: T,    // 640px+
  md?: T,    // 768px+
  lg?: T,    // 1024px+
  xl?: T,    // 1280px+
  '2xl'?: T, // 1536px+
}): T
```

### Examples

```tsx
// Responsive columns
const columns = useResponsiveValue({
  base: 1,
  sm: 2,
  md: 3,
  lg: 4,
});

// Responsive spacing
const gap = useResponsiveValue({
  base: 8,
  md: 16,
  lg: 24,
});

// Responsive typography
const fontSize = useResponsiveValue({
  base: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
});

// Responsive layout
const direction = useResponsiveValue<'column' | 'row'>({
  base: 'column',
  md: 'row',
});

// Responsive sizing
const size = useResponsiveValue<'sm' | 'md' | 'lg'>({
  base: 'sm',
  md: 'md',
  lg: 'lg',
});
```

---

## Breakpoint Values

| Breakpoint | Min Width | Device Type |
|------------|-----------|-------------|
| `base` | 0px | Mobile (default) |
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops, desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Extra large screens |

---

## Common Media Queries

### Viewport

```tsx
'(max-width: 639px)'        // Mobile
'(max-width: 767px)'        // Below tablet
'(min-width: 640px)'        // Tablet+
'(min-width: 1024px)'       // Desktop+
'(orientation: landscape)'  // Landscape
'(orientation: portrait)'   // Portrait
```

### User Preferences

```tsx
'(prefers-color-scheme: dark)'     // Dark mode
'(prefers-color-scheme: light)'    // Light mode
'(prefers-reduced-motion: reduce)' // Reduced motion
'(prefers-contrast: high)'         // High contrast
```

### Device Capabilities

```tsx
'(hover: none)'                // No hover (touch)
'(hover: hover)'               // Hover supported
'(pointer: coarse)'            // Touch input
'(pointer: fine)'              // Mouse/trackpad
'(display-mode: standalone)'   // PWA
```

---

## Usage Patterns

### Pattern 1: Responsive Grid

```tsx
const columns = useResponsiveValue({ base: 1, md: 2, lg: 3 });
const gap = useResponsiveValue({ base: 16, md: 24 });

<Grid columns={columns} gap={gap}>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</Grid>
```

### Pattern 2: Conditional Rendering

```tsx
const { isMobile, isDesktop } = useBreakpoints();

return (
  <>
    {isMobile && <MobileView />}
    {isDesktop && <DesktopView />}
  </>
);
```

### Pattern 3: Responsive Layout

```tsx
const direction = useResponsiveValue<'column' | 'row'>({
  base: 'column',
  md: 'row',
});
const padding = useResponsiveValue({ base: 16, md: 24, lg: 32 });

<Stack direction={direction} padding={padding}>
  <Sidebar />
  <MainContent />
</Stack>
```

### Pattern 4: Touch Optimization

```tsx
const { isTouchDevice } = useBreakpoints();

<Button
  size={isTouchDevice ? 'lg' : 'md'}
  padding={isTouchDevice ? '16px 24px' : '12px 20px'}
>
  Click Me
</Button>
```

### Pattern 5: Accessibility

```tsx
const { prefersReducedMotion } = useBreakpoints();

<Component
  animate={!prefersReducedMotion}
  transition={prefersReducedMotion ? 'none' : 'all 0.3s ease'}
/>
```

---

## TypeScript

### Type Inference

```tsx
// Automatically inferred as number
const columns = useResponsiveValue({ base: 1, md: 2 });

// Explicitly typed
const layout = useResponsiveValue<'vertical' | 'horizontal'>({
  base: 'vertical',
  md: 'horizontal',
});
```

### Type Exports

```tsx
import type {
  UseBreakpointsResult,
  ResponsiveValueConfig,
} from '@es-rottay/designsystem-core';

const breakpoints: UseBreakpointsResult = useBreakpoints();
const config: ResponsiveValueConfig<number> = { base: 1, md: 2 };
```

---

## SSR Safety

All hooks return safe defaults on the server:

- **useMediaQuery**: `false`
- **useBreakpoints**: All flags `false`
- **useResponsiveValue**: `base` value

```tsx
// Safe for SSR
const isMobile = useMediaQuery('(max-width: 639px)');
// Server: false
// Client: actual value

const columns = useResponsiveValue({ base: 1, md: 2, lg: 3 });
// Server: 1 (base)
// Client: actual value based on screen size
```

---

## Performance

✅ **Optimized:** Uses native `window.matchMedia`
✅ **Memoized:** Callbacks prevent unnecessary re-renders
✅ **Cleaned up:** Event listeners removed on unmount
✅ **Minimal:** Only re-renders when value actually changes

---

## Browser Support

✅ Modern browsers (Chrome, Firefox, Safari 14+, Edge)
✅ Legacy Safari < 14 (fallback support)
✅ SSR environments (Node.js)
✅ All major frameworks (Next.js, Remix, Gatsby)

---

## Common Combinations

```tsx
function MyComponent() {
  // Use all three hooks together
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  const { isMobile, isTouchDevice } = useBreakpoints();
  const spacing = useResponsiveValue({ base: 16, md: 24, lg: 32 });

  return (
    <Box
      padding={spacing}
      theme={isDark ? 'dark' : 'light'}
      touchOptimized={isTouchDevice}
    >
      {isMobile ? <MobileContent /> : <DesktopContent />}
    </Box>
  );
}
```

---

## Documentation

📚 **Full Docs:** [README.md](./README.md)
💡 **Examples:** [EXAMPLES.tsx](./EXAMPLES.tsx)
🔗 **Summary:** [RESPONSIVE_HOOKS_SUMMARY.md](/RESPONSIVE_HOOKS_SUMMARY.md)
