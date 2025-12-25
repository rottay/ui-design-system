# Restructured Primitives - Component List

## All Components (30 Total)

### Display (7 components)
1. **Avatar** ✓ (with compound: Group, Badge, Fallback)
   - types/, base/, engines/, compound/
2. **Badge** ✓
   - types/, base/, engines/, compound/
3. **Card** ✓ (with compound: Header, Body, Footer)
   - types/, base/, engines/, compound/
4. **Image** ✓
   - types/, base/, engines/, compound/
5. **Tag** ✓
   - types/, base/, engines/, compound/
6. **Tooltip** ✓
   - types/, base/, engines/, compound/
7. **Typography** ✓
   - types/, base/, engines/, compound/

### Feedback (7 components)
8. **Alert** ✓
   - types/, base/, engines/, compound/
9. **Drawer** ✓
   - types/, base/, engines/, compound/
10. **Modal** ✓
    - types/, base/, engines/, compound/
11. **Progress** ✓
    - types/, base/, engines/, compound/
12. **Skeleton** ⚠️ (structure only, engines pending)
    - types/, base/, engines/, compound/
13. **Spinner** ✓
    - types/, base/, engines/, compound/
14. **Toast** ⚠️ (structure only, engines pending)
    - types/, base/, engines/, compound/

### Inputs (7 components)
15. **Button** ✓ (with compound: Group, Icon)
    - types/, base/, engines/, compound/
16. **Checkbox** ⚠️ (structure only, engines pending)
    - types/, base/, engines/, compound/
17. **Input** ✓
    - types/, base/, engines/, compound/
18. **Radio** ⚠️ (structure only, engines pending)
    - types/, base/, engines/, compound/
19. **Select** ⚠️ (structure only, engines pending)
    - types/, base/, engines/, compound/
20. **Textarea** ✓
    - types/, base/, engines/, compound/
21. **Toggle** ⚠️ (structure only, engines pending)
    - types/, base/, engines/, compound/

### Layout (4 components)
22. **Box** ✓
    - types/, base/, engines/, compound/
23. **Divider** ✓
    - types/, base/, engines/, compound/
24. **Grid** ✓
    - types/, base/, engines/, compound/
25. **Stack** ✓
    - types/, base/, engines/, compound/

### Navigation (5 components - includes helper files)
26. **Breadcrumb** ✓
    - types/, base/, engines/, compound/
27. **Pagination** ✓
    - types/, base/, engines/, compound/
28. **Tabs** ✓
    - types/, base/, engines/, compound/

*Note: Navigation has 5 entries because it includes CHECKLIST.md, EXAMPLES.tsx, README.md, STRUCTURE.txt*
*Actual components: 3 (Breadcrumb, Pagination, Tabs)*

## Component Status Summary

✓ **Fully Implemented (20 components):**
- All have complete engines (titan.tsx, hermes.tsx, apollo.tsx)
- All have proper structure (types/, base/, engines/, compound/)
- Ready for use

⚠️ **Structure Complete, Engines Pending (7 components):**
- Skeleton, Toast (Feedback)
- Checkbox, Radio, Select, Toggle (Inputs)
- These have the correct folder structure but need engine implementations

## Compound Components (3 components)

### Avatar Compound Components
- **Avatar.Group** - Groups multiple avatars with overlap
- **Avatar.Badge** - Status badge overlay
- **Avatar.Fallback** - Fallback content on image failure

### Button Compound Components
- **Button.Group** - Group buttons with spacing
- **Button.Icon** - Icon-only button variant

### Card Compound Components
- **Card.Header** - Header with title/subtitle/extra
- **Card.Body** - Main content area
- **Card.Footer** - Footer with actions

## File Structure (Standard for All)

```
ComponentName/
├── types/
│   └── index.ts          ← Component types and defaults
├── base/
│   └── index.tsx         ← Base component with CSS variables
├── engines/
│   ├── titan.tsx         ← Ant Design implementation
│   ├── hermes.tsx        ← DaisyUI implementation
│   ├── apollo.tsx        ← Pure HTML/CSS implementation
│   └── index.ts          ← Engine barrel exports
├── compound/             ← Subcomponents (if any)
│   ├── SubComponent.tsx
│   └── index.ts
└── index.ts              ← Main export with createEngineComponent
```

## Export Pattern

All components export:
```typescript
// Types
export type { ComponentProps, ComponentSize, ComponentVariant }
export { COMPONENT_DEFAULTS }

// Base component
export { BaseComponent }

// Compound components (if any)
export { ComponentSubA, ComponentSubB }
export type { ComponentSubAProps, ComponentSubBProps }

// Engine-aware component
export const Component = Object.assign(
  createEngineComponent<ComponentProps>('Component', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    SubA: ComponentSubA,  // Only if compound components exist
    SubB: ComponentSubB,
  }
);
```

---

**Last Updated:** December 25, 2024
**Total Components:** 30
**Fully Implemented:** 20
**Structure Complete (Engines Pending):** 7
**With Compound Components:** 3 (Avatar, Button, Card)
