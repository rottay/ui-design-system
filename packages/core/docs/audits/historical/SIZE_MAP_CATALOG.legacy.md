# SIZE_MAP Catalog - Token Migration Reference

> Historical snapshot only. Paths, engine names, counts and migration status
> below describe the pre-refactor tree and are not current architecture. The
> live source of truth is `packages/core/src/ui/primitives/` plus the structural
> and token gates; this file is retained only as audit provenance.

This document catalogs all hardcoded SIZE_MAP constants in the design system that could potentially be migrated to CSS tokens.

## Overview

Total files with SIZE_MAP: **109 files**

These SIZE_MAP constants are currently used for:
- Component sizing (height, width, padding)
- Font sizes
- Icon sizes
- Border radii
- Spacing values

## Migration Status

- [ ] Not started - Constants are still hardcoded in TypeScript
- Future: Should be migrated to use CSS custom properties from the token system

---

## By Component Category

### Display Components

#### Badge
- **Location:** `components/primitives/display/Badge/types/index.ts`
- **Maps:** `SIZE_MAP`, `DOT_SIZE_MAP`
- **Used in:** base, engines (classic, modern, rustic)
- **Values:**
  - SIZE_MAP: `{ sm, md, lg }` with `minWidth`, `height`, `fontSize`
  - DOT_SIZE_MAP: `{ sm: 6, md: 8, lg: 10 }`

#### Tag
- **Location:** `components/primitives/display/Tag/types/index.ts`
- **Maps:** `SIZE_MAP`
- **Used in:** base, engines (rustic)
- **Values:** `{ sm, md, lg }` with `padding`, `fontSize`, `height`

#### Timeline
- **Location:** `types/primitives/display/Timeline/index.ts`
- **Maps:** `TIMELINE_SIZE_MAP`
- **Used in:** base, engines (rustic)
- **Values:** `dotSize`, `dotBorderWidth`, `itemPadding`, `dotOffset`, `lineWidth`

#### QRCode
- **Location:** `types/primitives/display/QRCode/index.ts`
- **Maps:** `SIZE_MAP`
- **Values:** `{ xs: 64, sm: 96, md: 128, lg: 160, xl: 200 }`

#### List
- **Location:** `types/primitives/display/List/index.ts`
- **Maps:** `LIST_SIZE_MAP`
- **Values:** `{ sm, md, lg }` with `padding`, `fontSize`

### Input Components

#### Button
- **Location:** `components/primitives/inputs/Button/types/index.ts`
- **Maps:** `SIZE_MAP`
- **Used in:** base, compound/Icon, engines (classic, rustic)
- **Engine-specific:** Titan has own `SIZE_MAP` mapping to Ant Design sizes

#### Input
- **Location:** `components/primitives/inputs/Input/types/index.ts`
- **Maps:** `SIZE_MAP`, `ANT_SIZE_MAP`, `DAISY_SIZE_MAP`
- **Used in:** base, compound/Addon, compound/TextArea, engines (classic, modern, rustic)
- **Values:**
  - SIZE_MAP: `{ sm, md, lg }` with `height`, `fontSize`, `padding`
  - ANT_SIZE_MAP: Maps to Ant Design size strings
  - DAISY_SIZE_MAP: Maps to DaisyUI size classes

#### Textarea
- **Location:** `components/primitives/inputs/Textarea/engines/*/index.tsx`
- **Maps:** Local `SIZE_MAP` in each engine
- **Note:** Each engine has its own SIZE_MAP definition

#### Select
- **Location:** `components/primitives/inputs/Select/types/index.ts`
- **Maps:** `SIZE_MAP`
- **Engine-specific:** `ANT_SIZE_MAP`, `DAISY_SIZE_MAP` in engines
- **Values:** `{ sm, md, lg }` with `height`, `fontSize`, `padding`

#### Checkbox
- **Location:** `components/primitives/inputs/Checkbox/types/index.ts`
- **Maps:** `SIZE_MAP`
- **Used in:** base, compound/Group, engines
- **Values:** `{ sm: 16, md: 20, lg: 24 }`

#### Radio
- **Location:** `components/primitives/inputs/Radio/types/index.ts`
- **Maps:** `SIZE_MAP`
- **Used in:** base, compound/Group, engines
- **Values:** `{ sm: 16, md: 20, lg: 24 }`

#### Toggle
- **Location:** `components/primitives/inputs/Toggle/types/index.ts`
- **Maps:** `SIZE_MAP`
- **Engine-specific:** `ANT_SIZE_MAP`, `DAISY_SIZE_MAP`
- **Values:** `{ sm, md, lg }` with `width`, `height`, `dot`

### Overlay Components

#### Modal
- **Location:** `components/primitives/overlay/Modal/types/index.ts`
- **Maps:** `SIZE_MAP`, `MAX_HEIGHT_MAP`, `PADDING_MAP`, `RADIUS_MAP`
- **Used in:** base, compound/CloseButton, engines
- **Values:**
  - SIZE_MAP: `{ xs: '320px', sm: '400px', md: '500px', lg: '700px', xl: '900px', full: '100%' }`

### Feedback Components

#### Modal (duplicate in feedback)
- **Location:** `components/primitives/feedback/Modal/engines/classic/index.tsx`
- **Maps:** Local `SIZE_MAP`
- **Note:** Appears to be a duplicate modal component

### Layout Components

#### Space
- **Location:** `components/primitives/layout/Space/index.ts`
- **Maps:** `SIZE_MAP`
- **Note:** Exported from layout index

### Navigation Components

#### Stepper
- **Location:** `components/primitives/navigation/Stepper/types/index.ts`
- **Maps:** Referenced SIZE_MAP
- **Used in:** compound/Step, engines

#### Pagination
- **Location:** `components/primitives/navigation/Pagination/engines/classic/index.tsx`
- **Maps:** Uses size mapping for Ant Design

#### Tabs
- **Location:** `components/primitives/navigation/Tabs/engines/classic/index.tsx`
- **Maps:** Uses size mapping for Ant Design

### Icons

#### BaseIcon
- **Location:** `icons/types/index.ts`
- **Maps:** `ICON_SIZE_MAP`
- **Values:** `{ xs: 12, sm: 16, md: 20, lg: 24, xl: 32, '2xl': 48 }`

### Feedback

#### Rate
- **Location:** `components/primitives/feedback/Rate/types/index.ts`
- **Maps:** SIZE_MAP referenced in exports
- **Used in:** base, engines

#### Drawer
- **Location:** `components/primitives/feedback/Drawer/engines/*/index.tsx`
- **Note:** May use size mappings

#### Spinner
- **Location:** `components/primitives/feedback/Spinner/types/index.ts`
- **Maps:** SIZE_MAP

---

## Recommended Migration Order

### Phase 1 - High Priority (Core Components)
1. Button - Most commonly used
2. Input - Forms foundation
3. Checkbox/Radio - Form controls
4. Modal - Overlay component
5. Badge - Common display component

### Phase 2 - Medium Priority
6. Select
7. Toggle
8. Tag
9. Textarea
10. Icons

### Phase 3 - Lower Priority
11. Timeline
12. QRCode
13. List
14. Space
15. Rate
16. Spinner

---

## Migration Approach

For each SIZE_MAP, the migration would involve:

1. **Create CSS tokens** in `foundation/tokens/css/presentation/components/{component}.css`:
   ```css
   :root {
     --ds-button-sm-height: 2rem;
     --ds-button-md-height: 2.5rem;
     --ds-button-lg-height: 3rem;
   }
   ```

2. **Update TypeScript** to reference CSS variables:
   ```typescript
   export const buttonSize = {
     sm: { height: 'var(--ds-button-sm-height)' },
     md: { height: 'var(--ds-button-md-height)' },
     lg: { height: 'var(--ds-button-lg-height)' },
   };
   ```

3. **Update components** to use the new token system

---

## Notes

- Some SIZE_MAPs are engine-specific (ANT_SIZE_MAP, DAISY_SIZE_MAP) and may need to remain as they map to external library APIs
- The token system already has component tokens for Avatar, Button, Input, Card, and Modal
- Migration should be done incrementally to avoid breaking changes

---

*Generated: 2025-12-27*
*This catalog is for reference during token migration planning.*
