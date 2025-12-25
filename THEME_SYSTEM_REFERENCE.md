# Theme System Implementation Reference

## DS-017, DS-018, DS-019 - Complete

### Quick Start

```typescript
// Import theme presets
import { 
  bithireTheme, 
  corporateTheme, 
  minimalTheme,
  getAvailableThemes 
} from '@es-rottay/designsystem-core';

// Import CSS variables
import '@es-rottay/designsystem-core/config/themes/foundation/variables/index.css';

// Get available themes
const themes = getAvailableThemes(); // ['bithire', 'corporate', 'minimal']
```

### Available Theme Presets

| Theme | Primary Color | Use Case | Font Family |
|-------|--------------|----------|-------------|
| **BitHire** | #0A66C2 | Recruiting platforms | Source Sans Pro |
| **Corporate** | #1E3A5F | Enterprise apps | Inter |
| **Minimal** | #37352F | Content-focused apps | Georgia |

### Theme Extension

```typescript
import { extendTheme } from '@es-rottay/designsystem-core';

const myTheme = extendTheme('bithire', {
  name: 'my-custom-theme',
  variables: {
    'color-primary': '#FF6B6B',
    'color-accent': '#4ECDC4',
  },
});
```

### Theme Merging

```typescript
import { mergeThemes } from '@es-rottay/designsystem-core';

const merged = mergeThemes(
  foundationTheme,
  { variables: { 'color-primary': '#custom' } }
);
```

### CSS Variables Available

#### Colors
- `--color-neutral-{50-900}`: Neutral color scale
- `--color-primary`: Primary brand color
- `--color-primary-hover`: Primary hover state
- `--color-accent`: Accent color
- `--color-success`, `--color-warning`, `--color-error`, `--color-info`: Semantic colors

#### Spacing
- `--spacing-{0-24}`: Spacing scale (0, 1-6, 8, 10, 12, 16, 20, 24)

#### Typography
- `--font-family-base`: Base font family
- `--font-family-heading`: Heading font family
- `--font-family-mono`: Monospace font family
- `--font-size-{xs-4xl}`: Font size scale
- `--font-weight-{normal,medium,semibold,bold}`: Font weights
- `--line-height-{tight,normal,relaxed}`: Line heights

#### Effects
- `--radius-{none,sm,md,lg,xl,2xl,full}`: Border radius scale
- `--shadow-{sm,md,lg,xl}`: Shadow presets
- `--transition-{fast,normal,slow}`: Transition speeds

#### Z-Index
- `--z-dropdown`: 1000
- `--z-sticky`: 1020
- `--z-fixed`: 1030
- `--z-modal-backdrop`: 1040
- `--z-modal`: 1050
- `--z-popover`: 1060
- `--z-tooltip`: 1070

### Dark Mode Support

```css
/* Automatically inverts neutral colors in dark mode */
[data-theme="dark"] .my-component {
  background: var(--color-neutral-900);
  color: var(--color-neutral-50);
}
```

### File Structure

```
packages/core/src/config/themes/
├── foundation/
│   ├── index.ts              # Foundation theme config
│   └── variables/
│       └── index.css         # CSS variables
├── presets/
│   ├── bithire/index.ts      # BitHire preset
│   ├── corporate/index.ts    # Corporate preset
│   ├── minimal/index.ts      # Minimal preset
│   └── index.ts              # Presets export
├── utils/
│   ├── extend/index.ts       # extendTheme()
│   ├── merge/index.ts        # mergeThemes()
│   └── index.ts              # Utils export
└── index.ts                  # Main export
```

### Integration with Titan Engine

Each theme preset includes Titan engine overrides:

```typescript
export const bithireTheme: ThemeConfig = {
  // ... other config
  engineOverrides: {
    titan: {
      token: {
        colorPrimary: '#0A66C2',
        borderRadius: 8,
        fontFamily: "'Source Sans Pro', -apple-system, sans-serif",
      },
    },
  },
};
```

### API Reference

#### Functions

- `getFoundationVariable(name: string): string | undefined`
  - Get a foundation theme variable by name

- `getThemePreset(name: string): ThemeConfig | undefined`
  - Get a theme preset by name

- `getAvailableThemes(): string[]`
  - Get list of all available theme names

- `extendTheme(base: ThemeConfig | string, overrides: Partial<ThemeConfig>): ThemeConfig`
  - Extend a theme with custom overrides

- `mergeThemes(...themes: Partial<ThemeConfig>[]): ThemeConfig`
  - Deep merge multiple theme configs

#### Constants

- `FOUNDATION_CSS_PATH`: Path to foundation CSS variables file
  - Value: `'./themes/foundation/variables/index.css'`

---

**Status**: ✅ Complete  
**Tasks**: DS-017, DS-018, DS-019  
**Files**: 10 (1 CSS, 9 TypeScript)  
**Lines of Code**: ~438 lines
