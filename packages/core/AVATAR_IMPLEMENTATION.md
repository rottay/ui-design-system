# Avatar Component Implementation - Wave 2 (Agent I)

## Overview
Complete implementation of the Avatar primitive component following the new Rottay Design System architecture. This serves as the **TEMPLATE** for all other primitive components.

## Implementation Date
December 25, 2024

## Architecture Pattern

### Directory Structure
```
packages/core/src/components/primitives/display/Avatar/
├── types/index.ts          ← Re-exports from centralized types + SIZE_MAP
├── base/index.tsx          ← BaseAvatar using CSS variables
├── compound/
│   ├── Group/index.tsx     ← Avatar.Group
│   ├── Badge/index.tsx     ← Avatar.Badge
│   ├── Fallback/index.tsx  ← Avatar.Fallback
│   └── index.ts            ← Compound exports
├── engines/
│   ├── titan/index.tsx     ← Ant Design adapter
│   ├── hermes/index.tsx    ← DaisyUI/Tailwind adapter
│   ├── apollo/index.tsx    ← Headless pure HTML/CSS
│   └── index.ts            ← Engine exports
└── index.ts                ← Main export with createEngineComponent
```

## Key Features Implemented

### 1. CSS Variable Integration
All components use CSS variables from `/packages/core/src/tokens/src/components/avatar.css`:
- Size tokens: `--avatar-{size}-size`, `--avatar-{size}-font-size`
- Shape tokens: `--avatar-circle-radius`, `--avatar-square-radius`, `--avatar-rounded-radius`
- Variant tokens: `--avatar-{variant}-bg`, `--avatar-{variant}-color`
- Status tokens: `--avatar-status-{status}-color`
- Interaction tokens: `--avatar-hover-scale`, `--avatar-transition`

### 2. BaseAvatar Component
**File:** `base/index.tsx`

Features:
- ✅ Automatic initials generation from `name` or `alt` prop
- ✅ Image loading with error handling (`onError`, `onLoad` callbacks)
- ✅ Status indicators (online, offline, away, busy)
- ✅ Multiple variants (default, primary, secondary, success, warning, error, gradient)
- ✅ Multiple shapes (circle, square, rounded)
- ✅ Multiple sizes (xs, sm, md, lg, xl, 2xl, 3xl)
- ✅ Ring support with custom colors
- ✅ Border support
- ✅ Clickable with onClick handler
- ✅ Accessible with ARIA labels
- ✅ Smooth transitions and hover effects

### 3. Engine Implementations

#### Titan (Ant Design)
**File:** `engines/titan/index.tsx`

- Wraps Ant Design `Avatar` component
- Uses `Badge` component for status indicators
- Maps variants to Ant Design color schemes
- Supports all base Avatar props
- Handles image errors gracefully
- Generates initials automatically

#### Hermes (DaisyUI)
**File:** `engines/hermes/index.tsx`

- Uses DaisyUI classes: `avatar`, `mask-circle`, `mask-squircle`
- Variant color mapping: `bg-primary`, `bg-success`, etc.
- Status indicators with Tailwind classes
- Ring support with DaisyUI `ring` utilities
- Responsive with Tailwind's utility classes

#### Apollo (Pure HTML/CSS)
**File:** `engines/apollo/index.tsx`

- Pure React implementation (no dependencies)
- Inline styles using CSS variables
- Variant color mapping with fallbacks
- Status indicators positioned absolutely
- Full feature parity with Titan/Hermes
- Accessible and performant

### 4. Compound Components

#### Avatar.Group
**File:** `compound/Group/index.tsx`

Features:
- Groups multiple avatars with overlap
- `max` prop to limit displayed avatars
- Shows "+N" overflow counter
- Configurable spacing
- Reverse flex direction for visual stacking
- White borders between avatars

#### Avatar.Badge
**File:** `compound/Badge/index.tsx`

Features:
- Status badge overlay (online, offline, busy, away)
- Dot indicator style
- Color-coded status (green, gray, yellow, red)
- Positioned bottom-right with white border
- ARIA labels for accessibility

#### Avatar.Fallback
**File:** `compound/Fallback/index.tsx`

Features:
- Handles image loading errors
- Shows fallback content when image fails
- Automatic error detection with onError handler
- Customizable fallback (text, icon, component)

### 5. Type System

**File:** `types/index.ts`

Exports from centralized types:
```typescript
export type {
  AvatarProps,
  AvatarSize,        // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  AvatarVariant,     // 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient'
  AvatarShape,       // 'circle' | 'square' | 'rounded'
  AvatarStatus,      // 'online' | 'offline' | 'away' | 'busy'
  AvatarGroupProps,
  AvatarBadgeProps,
  AvatarFallbackProps,
  AvatarStatusConfig,
}
```

Constants:
```typescript
export const AVATAR_DEFAULTS = {
  size: 'md',
  shape: 'circle',
  variant: 'default',
  bordered: false,
  showZero: false,
  ring: false,
};

export const SIZE_MAP = {
  xs: 24,    // 1.5rem
  sm: 32,    // 2rem
  md: 40,    // 2.5rem (default)
  lg: 48,    // 3rem
  xl: 56,    // 3.5rem
  '2xl': 64, // 4rem
  '3xl': 96, // 6rem
};
```

## Usage Examples

### Basic Avatar
```tsx
import { Avatar } from '@es-rottay/designsystem-core';

// With image
<Avatar src="/user.jpg" alt="John Doe" size="lg" />

// With initials (auto-generated)
<Avatar name="John Doe" variant="primary" />

// With custom initials
<Avatar initials="JD" variant="success" shape="rounded" />

// With status
<Avatar src="/user.jpg" status="online" />
```

### Avatar Group
```tsx
import { Avatar } from '@es-rottay/designsystem-core';

<Avatar.Group max={5}>
  <Avatar name="Alice Johnson" />
  <Avatar name="Bob Smith" />
  <Avatar name="Carol White" />
  <Avatar name="David Brown" />
  <Avatar name="Eve Davis" />
  <Avatar name="Frank Miller" />
</Avatar.Group>
// Shows 5 avatars + "+1" overflow
```

### Avatar with Badge
```tsx
<Avatar.Badge status="online">
  <Avatar src="/user.jpg" />
</Avatar.Badge>
```

### Avatar with Fallback
```tsx
<Avatar.Fallback
  src="/might-fail.jpg"
  alt="User"
  fallback={<span>👤</span>}
/>
```

### All Variants
```tsx
<Avatar name="Default" variant="default" />
<Avatar name="Primary" variant="primary" />
<Avatar name="Secondary" variant="secondary" />
<Avatar name="Success" variant="success" />
<Avatar name="Warning" variant="warning" />
<Avatar name="Error" variant="error" />
<Avatar name="Gradient" variant="gradient" />
```

### All Sizes
```tsx
<Avatar name="XS" size="xs" />
<Avatar name="SM" size="sm" />
<Avatar name="MD" size="md" />
<Avatar name="LG" size="lg" />
<Avatar name="XL" size="xl" />
<Avatar name="2XL" size="2xl" />
<Avatar name="3XL" size="3xl" />
```

### All Shapes
```tsx
<Avatar name="Circle" shape="circle" />
<Avatar name="Square" shape="square" />
<Avatar name="Rounded" shape="rounded" />
```

### Clickable Avatar
```tsx
<Avatar
  src="/user.jpg"
  onClick={() => console.log('Clicked!')}
  ring
  ringColor="#0066cc"
/>
```

## Engine-Specific Behavior

### Switching Engines
```tsx
import { Avatar } from '@es-rottay/designsystem-core';

// Use Titan (Ant Design) - default
<Avatar name="John" />

// Force Hermes (DaisyUI)
<Avatar name="John" engine="hermes" />

// Force Apollo (Pure CSS)
<Avatar name="John" engine="apollo" />
```

### Engine Context
```tsx
import { EngineProvider } from '@es-rottay/designsystem-core';

<EngineProvider engine="hermes">
  {/* All avatars use DaisyUI */}
  <Avatar name="User 1" />
  <Avatar name="User 2" />
</EngineProvider>
```

## Exports

From `packages/core/src/components/primitives/display/index.ts`:
```typescript
export {
  Avatar,
  AvatarGroup,
  AvatarBadge,
  AvatarFallback
} from './Avatar';

export type {
  AvatarProps,
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarVariant,
  AvatarGroupProps,
  AvatarBadgeProps,
  AvatarFallbackProps
} from './Avatar';
```

## Key Design Decisions

1. **Initials Generation**: Automatic extraction of first letter of first and last word
2. **Image Error Handling**: Built-in fallback to initials when image fails to load
3. **Status Indicators**: Positioned bottom-right with white border for visibility
4. **Compound Pattern**: Avatar.Group, Avatar.Badge, Avatar.Fallback for composition
5. **CSS Variables**: All sizing and colors use design tokens for consistency
6. **Engine Parity**: All three engines support the same features
7. **Accessibility**: ARIA labels, keyboard support (onClick), semantic HTML

## Testing Checklist

- [x] Component compiles without TypeScript errors
- [x] All three engines (titan/hermes/apollo) implemented
- [x] CSS variables properly referenced
- [x] Compound components (Group/Badge/Fallback) working
- [x] Exports from main index.ts
- [x] forwardRef implemented for all components
- [x] displayName set for React DevTools
- [x] 'use client' directive in all .tsx files
- [x] SIZE_MAP matches CSS token values

## Next Steps (Wave 2 Continuation)

This Avatar implementation serves as the template. Use it to implement:
1. Badge component (similar pattern)
2. Card component
3. Tag component
4. Tooltip component
5. Typography component
6. Image component

## Files Modified/Created

### Created
- `/packages/core/src/components/primitives/display/Avatar/types/index.ts`
- `/packages/core/src/components/primitives/display/Avatar/base/index.tsx`
- `/packages/core/src/components/primitives/display/Avatar/compound/Group/index.tsx`
- `/packages/core/src/components/primitives/display/Avatar/compound/Badge/index.tsx`
- `/packages/core/src/components/primitives/display/Avatar/compound/Fallback/index.tsx`
- `/packages/core/src/components/primitives/display/Avatar/compound/index.ts`
- `/packages/core/src/components/primitives/display/Avatar/engines/titan/index.tsx`
- `/packages/core/src/components/primitives/display/Avatar/engines/hermes/index.tsx`
- `/packages/core/src/components/primitives/display/Avatar/engines/apollo/index.tsx`
- `/packages/core/src/components/primitives/display/Avatar/engines/index.ts`
- `/packages/core/src/components/primitives/display/Avatar/index.ts`

### Modified
- `/packages/core/src/components/primitives/display/index.ts` - Updated Avatar exports with compound components

## References

- CSS Tokens: `/packages/core/src/tokens/src/components/avatar.css`
- Types: `/packages/core/src/types/primitives/display/Avatar/index.ts`
- Engine Factory: `/packages/core/src/system/engines/factory/index.tsx`
- Badge Reference: `/packages/core/src/components/primitives/display/Badge/`

---

**Status:** ✅ COMPLETE
**Template Quality:** HIGH - Ready for use as primitive component pattern
**Engine Coverage:** 100% (Titan ✅ | Hermes ✅ | Apollo ✅)
