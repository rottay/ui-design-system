# Vertical Presets - Rottay Design System

> Last updated: 2026-03-23

## Overview

Verticals are industry-specific configuration presets that bundle together an engine preference, personality tokens, density, and surface defaults. Each Rottay application maps to a vertical preset, providing a single entry point for configuring the entire design system experience for that product domain.

**Source**: `ui-design-system/packages/core/src/runtime/verticals/registry.ts`

---

## Resolution Priority

Verticals sit in the middle of the configuration resolution chain:

```
DesignSystemProvider props (highest priority)
  > Tenant config
    > Vertical preset         <-- here
      > Product profile
        > Engine defaults (lowest priority)
```

Verticals are **optional**. The system works fine without one. `getVerticalPreset()` returns `undefined` for unknown keys, letting callers decide their own fallback strategy.

---

## Registered Verticals

### `evnto` - Event Management Platform

| Property | Value |
|----------|-------|
| **Engine** | `modern` |
| **Density** | `spacious` |
| **Default Product Profile** | `events.organizer` |
| **Features** | `events`, `ticketing`, `check-in`, `analytics` |
| **Suggested Palette** | Primary: `#FF6B35`, Secondary: `#EA580C`, Accent: `#06b6d4` |
| **List View** | `cards` |
| **Scheduler View** | `week` |

#### Personality

| Category | Key Settings |
|----------|-------------|
| **Animation** | Intensity `1.5`, entrance `bounce`, duration `500ms`, spring physics (tension 200, friction 18), hoverLift `4`, hoverScale `1.03`, staggerDelay `80ms`, pulseSpeed `fast`, skeleton `wave` |
| **Chart** | Animate on mount (`1200ms`), lineStyle `smooth`, showDots, gradientFill, tooltip `detailed` |
| **Typography** | Heading weight `heavier`, letter-spacing `-0.02em`, label style `capitalize` |
| **Accent** | Bar position `top`, thickness `4`, style `animated`, icon shape `circle`, badge `pill`, divider `dashed` |
| **Card** | Default elevation `md`, hover `lift-two`, no border, hoverTint enabled, padding `spacious` |

#### Token Overrides

| Token | Value |
|-------|-------|
| densityScale | `1.125` |
| borderRadius.sm | `10px` |
| borderRadius.md | `14px` |
| borderRadius.lg | `18px` |
| borderRadius.xl | `24px` |

---

### `bithire` - Tech Recruitment Platform

| Property | Value |
|----------|-------|
| **Engine** | `classic` |
| **Density** | `compact` |
| **Default Product Profile** | `recruiting.operator` |
| **Features** | `recruiting`, `candidates`, `interviews`, `offers` |
| **Suggested Palette** | Primary: `#0A66C2`, Secondary: `#004182`, Accent: `#7FC15E` |
| **List View** | `table` |
| **Scheduler View** | `week` |

#### Personality

| Category | Key Settings |
|----------|-------------|
| **Animation** | Intensity `0.4`, entrance `fade`, duration `150ms`, **no** spring physics, hoverLift `0`, hoverScale `1.0`, staggerDelay `30ms`, pulseSpeed `slow`, skeleton `pulse` |
| **Chart** | Animate on mount (`400ms`), lineStyle `sharp`, showDots, **no** gradientFill, tooltip `detailed` |
| **Typography** | Heading weight `heavier`, letter-spacing `-0.01em`, label style `uppercase` |
| **Accent** | Bar position `left`, thickness `3`, style `solid`, icon shape `circle`, badge `pill`, divider `solid` |
| **Card** | Default elevation `sm`, hover `lift-one`, border visible, no hoverTint, padding `compact` |

#### Token Overrides

| Token | Value |
|-------|-------|
| densityScale | `0.95` |

---

### `platform` - Admin Portal

| Property | Value |
|----------|-------|
| **Engine** | `classic` |
| **Density** | `comfortable` |
| **Default Product Profile** | `platform.admin` |
| **Features** | `admin`, `settings`, `users`, `billing` |
| **Suggested Palette** | Primary: `#6366F1` |
| **List View** | `table` |
| **Scheduler View** | `month` |

#### Personality

| Category | Key Settings |
|----------|-------------|
| **Animation** | Intensity `0.4`, entrance `fade`, duration `180ms`, **no** spring physics, hoverLift `1`, hoverScale `1.0`, staggerDelay `24ms`, pulseSpeed `normal`, skeleton `shimmer` |
| **Chart** | Animate on mount (`720ms`), lineStyle `sharp`, showDots, **no** gradientFill, tooltip `detailed` |
| **Typography** | Heading weight `normal`, letter-spacing `-0.015em`, label style `sentence` |
| **Accent** | Bar position `top`, thickness `3`, style `solid`, icon shape `rounded`, badge `rounded`, divider `solid` |
| **Card** | Default elevation `sm`, hover `lift-one`, border visible, no hoverTint, padding `normal` |

#### Token Overrides

None (uses engine defaults).

---

## Comparative Summary

| Dimension | Evnto | BitHire | Platform |
|-----------|-------|---------|----------|
| Engine | modern | classic | classic |
| Density | spacious (1.125x) | compact (0.95x) | comfortable (1.0x) |
| Animation intensity | 1.5 (high) | 0.4 (low) | 0.4 (low) |
| Entrance effect | bounce | fade | fade |
| Spring physics | Yes | No | No |
| Gradients/Glass | Yes | No | No |
| Border visible | No | Yes | Yes |
| List default | Cards | Table | Table |
| Label style | capitalize | UPPERCASE | Sentence case |
| Card elevation | md + lift-two | sm + lift-one | sm + lift-one |

---

## VerticalPreset Type

```typescript
interface VerticalPreset {
  key: VerticalKey;
  label: string;
  description?: string;
  engine: EngineName;
  density: 'compact' | 'comfortable' | 'spacious';
  personality: PersonalityTokens;
  tokenOverrides?: TenantTokenOverrides;
  defaultProductProfile: ProductProfileKey;
  features: string[];
  surfaceDefaults: {
    listView: 'table' | 'cards';
    density: 'compact' | 'comfortable' | 'spacious';
    schedulerView?: 'month' | 'week' | 'day';
  };
  suggestedPalette?: {
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}
```

### VerticalKey

Open-ended string union so product teams can register custom verticals:

```typescript
type VerticalKey = 'evnto' | 'bithire' | 'platform' | (string & {});
```

---

## API

| Function | Returns | Description |
|----------|---------|-------------|
| `getVerticalPreset(key)` | `VerticalPreset | undefined` | Resolve a vertical by key. Returns `undefined` for unknown keys. |
| `VERTICAL_REGISTRY` | `Record<string, VerticalPreset>` | The full registry object. |

---

## Usage in DesignSystemProvider

```tsx
// By key (resolved from VERTICAL_REGISTRY)
<DesignSystemProvider vertical="evnto" />

// By inline object (for custom verticals)
<DesignSystemProvider vertical={{ key: 'nightlife', engine: 'modern', ... }} />

// From tenant config (runtime-driven)
// If tenantConfig.vertical is set, it is used automatically
<DesignSystemProvider tenantConfig={config} />
```

The provider resolves the vertical, then uses it for:
1. **Engine selection**: `resolvedVertical.engine` (unless `forceEngine` or `tenantConfig.engine` overrides)
2. **Product profile default**: `resolvedVertical.defaultProductProfile` (unless explicit `productProfile` prop)
3. **Personality tokens**: Merged between `DEFAULT_PERSONALITY` and product profile personality in `useTokens`

---

## File Reference

| File | Purpose |
|------|---------|
| `runtime/verticals/registry.ts` | `VERTICAL_REGISTRY`, `getVerticalPreset()` |
| `runtime/verticals/types.ts` | `VerticalKey`, `VerticalPreset` type definitions |
| `runtime/verticals/index.ts` | Barrel exports |
