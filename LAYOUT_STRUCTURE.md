# Layout Primitives Directory Structure

```
packages/core/src/components/primitives/layout/
│
├── index.ts                         # Barrel exports all layout components
│
├── box/                             # Generic container component
│   ├── core/
│   │   └── index.ts                # BoxProps, defaults, constants
│   ├── titan/
│   │   └── index.tsx               # Ant Design implementation
│   ├── hermes/
│   │   └── index.tsx               # DaisyUI implementation
│   ├── apollo/
│   │   └── index.tsx               # Pure HTML/CSS implementation
│   └── index.ts                    # Router with createEngineComponent
│
├── stack/                           # Flexbox stack layout
│   ├── core/
│   │   └── index.ts                # StackProps, types, defaults, maps
│   ├── titan/
│   │   └── index.tsx               # Ant Design implementation
│   ├── hermes/
│   │   └── index.tsx               # DaisyUI implementation
│   ├── apollo/
│   │   └── index.tsx               # Pure HTML/CSS implementation
│   └── index.ts                    # Router with createEngineComponent
│
├── grid/                            # CSS Grid layout
│   ├── core/
│   │   └── index.ts                # GridProps, types, defaults, maps
│   ├── titan/
│   │   └── index.tsx               # Ant Design implementation
│   ├── hermes/
│   │   └── index.tsx               # DaisyUI implementation
│   ├── apollo/
│   │   └── index.tsx               # Pure HTML/CSS implementation
│   └── index.ts                    # Router with createEngineComponent
│
└── divider/                         # Visual separator
    ├── core/
    │   └── index.ts                # DividerProps, types, defaults, maps
    ├── titan/
    │   └── index.tsx               # Ant Design implementation
    ├── hermes/
    │   └── index.tsx               # DaisyUI implementation
    ├── apollo/
    │   └── index.tsx               # Pure HTML/CSS implementation
    └── index.ts                    # Router with createEngineComponent
```

## File Count
- **4 components** (Box, Stack, Grid, Divider)
- **5 files per component** (core, titan, hermes, apollo, router)
- **1 barrel export** (layout/index.ts)
- **Total: 21 files**

## Export Chain

```
layout/index.ts
    ↓
    exports: Box, Stack, Grid, Divider
    ↓
primitives/index.ts
    ↓
    export * from './layout'
    ↓
components/index.ts (future)
    ↓
    export * from './primitives'
    ↓
@es-rottay/designsystem-core
```

## Component Props Summary

### Box
- `as`: Element type
- `padding`, `margin`: Spacing
- `display`, `position`: Layout
- `width`, `height`: Dimensions
- `background`: Background color
- `borderRadius`: Corner rounding

### Stack
- `direction`: vertical | horizontal
- `align`: start | center | end | stretch
- `justify`: start | center | end | between | around
- `spacing`: none | xs | sm | md | lg | xl
- `wrap`: boolean
- `divider`: boolean

### Grid
- `columns`: 1 | 2 | 3 | 4 | 5 | 6 | 12
- `gap`: none | xs | sm | md | lg | xl
- `rowGap`: none | xs | sm | md | lg | xl
- `columnGap`: none | xs | sm | md | lg | xl

### Divider
- `orientation`: horizontal | vertical
- `type`: solid | dashed | dotted
- `children`: ReactNode (text)
- `margin`: none | sm | md | lg
