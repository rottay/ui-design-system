# Design System - Backlog

## Quick Status

| Area | Progress | Status |
|------|----------|--------|
| **Architecture** | done | showroom created |
| **Refactor** | 31/76 | Display done, Inputs 12/20, Feedback 5/11 |
| **Tests** | ~400/500 | Display + 12 Inputs + 5 Feedback done |
| **JSDoc** | ~50% | English, standardized |
| **Storybook** | 31/76 | Display + 12 Inputs + 5 Feedback done |
| **Build** | 100% | 7.58s |

---

## Architecture (Approved)

```
desing-system/
├── packages/
│   ├── core/                    # Librería + Storybook
│   │   ├── src/
│   │   │   ├── components/      # Con stories colocadas (**/stories/)
│   │   │   ├── system/
│   │   │   ├── tokens/
│   │   │   └── index.ts
│   │   ├── .storybook/          # Storybook config
│   │   ├── dist/                # .gitignore ✅
│   │   ├── storybook-static/    # .gitignore ✅
│   │   └── package.json         # @rottay/design-system
│   │
│   └── showroom/                # Next.js app (replaces dashboard)
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── [category]/[component]/page.tsx
│       ├── package.json         # @rottay/design-system-showroom
│       └── next.config.js
│
├── package.json                 # Workspace root
└── .gitignore
```

### Packages

| Package | Name | Purpose | Deploy |
|---------|------|---------|--------|
| `core/` | `@rottay/design-system` | Librería exportable | npm registry |
| `showroom/` | `@rottay/design-system-showroom` | App demo | Vercel |
| Storybook | (en core) | Docs componentes | Vercel/Chromatic |

### Architecture Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Add `storybook-static` to .gitignore | done |
| 2 | Rename package to `@rottay/design-system` | done |
| 3 | Update root package.json scripts | done |
| 4 | Delete `packages/dashboard/` | done |
| 5 | Create `packages/showroom/` with Next.js | done |
| 6 | Configure showroom to consume `@rottay/design-system` | done |

---

## Priority 1: Refactor to New Structure

> Migrate all 76 components to the approved structure (Avatar as template)

### Target Structure

```
Component/
├── base/index.tsx           # Base component with CSS variables
├── compound/index.ts        # Optional: SubComponent exports
├── engines/
│   ├── titan/index.tsx
│   ├── hermes/index.tsx
│   ├── apollo/index.tsx
│   └── index.ts
├── types/index.ts
├── stories/Component.stories.tsx
├── tests/Component.test.tsx
└── index.ts
```

### Display (17 components)

| # | Component | Refactor | Tests | JSDoc | Story | Notes |
|---|-----------|----------|-------|-------|-------|-------|
| 1 | Avatar | done | done | pending | done | Reference template |
| 2 | Badge | done | done | done | done | 38 tests passing |
| 3 | Card | done | done | done | done | 42 tests, 4 compounds |
| 4 | Image | done | done | done | done | 19 tests, 2 compounds |
| 5 | Tag | done | done | done | done | 35 tests, Tag.Group |
| 6 | Tooltip | done | done | done | done | 38 tests, 2 compounds |
| 7 | Typography | done | done | done | done | 73 tests, 3 compounds |
| 8 | Table | pending | pending | pending | pending | Complex |
| 9 | Calendar | pending | pending | pending | pending | TS errors |
| 10 | List | pending | pending | pending | pending | TS errors |
| 11 | Empty | done | done | done | done | 19 tests |
| 12 | Statistic | done | done | done | done | 32 tests, Countdown |
| 13 | Carousel | done | done | done | done | 22 tests, Item |
| 14 | Descriptions | done | done | done | done | 25 tests, Item |
| 15 | Timeline | done | done | done | done | 21 tests, Item |
| 16 | Tree | done | done | done | done | 16 tests, TreeNode |
| 17 | QRCode | done | done | done | done | 28 tests |

### Inputs (20 components)

| # | Component | Refactor | Tests | JSDoc | Story | Notes |
|---|-----------|----------|-------|-------|-------|-------|
| 1 | Button | done | done | done | done | 28 tests, Button.Group |
| 2 | Input | done | done | done | done | 32 tests, Password/Search/TextArea |
| 3 | Select | done | done | done | done | 25 tests, Option/OptGroup |
| 4 | Checkbox | done | done | done | done | 22 tests, Checkbox.Group |
| 5 | Radio | done | done | done | done | 19 tests, Radio.Group |
| 6 | Toggle | done | done | done | done | 22 tests, with labels |
| 7 | Textarea | done | done | done | done | 24 tests, autoSize |
| 8 | Switch | done | done | done | done | 18 tests, labels |
| 9 | InputNumber | done | done | done | done | 28 tests, controls |
| 10 | Form | done | done | done | done | 20 tests, Item/List |
| 11 | DatePicker | done | done | done | done | 24 tests, RangePicker |
| 12 | TimePicker | pending | pending | pending | pending | Has RangePicker, TS errors |
| 13 | AutoComplete | pending | pending | pending | pending | |
| 14 | Cascader | pending | pending | pending | pending | |
| 15 | TreeSelect | pending | pending | pending | pending | |
| 16 | Mentions | pending | pending | pending | pending | |
| 17 | Transfer | pending | pending | pending | pending | |
| 18 | ColorPicker | pending | pending | pending | pending | |
| 19 | Slider | done | done | done | done | 25 tests, range/marks |
| 20 | Upload | pending | pending | pending | pending | Has Dragger |

### Feedback (11 components)

| # | Component | Refactor | Tests | JSDoc | Story | Notes |
|---|-----------|----------|-------|-------|-------|-------|
| 1 | Alert | done | done | done | done | 20+ tests, Alert.Description |
| 2 | Spinner | done | done | done | done | 18+ tests, all sizes |
| 3 | Progress | done | done | done | done | 25 tests, Circle/Line compounds |
| 4 | Modal | done | done | done | done | 24+ tests, Header/Body/Footer |
| 5 | Toast | done | done | done | done | 25+ tests, Provider/useToast |
| 6 | Skeleton | in progress | in progress | in progress | in progress | Avatar, Text, Button compounds |
| 7 | Drawer | in progress | in progress | in progress | in progress | Header/Body/Footer, placements |
| 8 | Message | in progress | in progress | in progress | in progress | Provider, useMessage hook |
| 9 | Notification | in progress | in progress | in progress | in progress | Provider, useNotification hook |
| 10 | Result | in progress | in progress | in progress | in progress | Success/Error/Warning/Info compounds |
| 11 | Rate | pending | pending | pending | pending | |

### Layout (10 components)

| # | Component | Refactor | Tests | JSDoc | Story | Notes |
|---|-----------|----------|-------|-------|-------|-------|
| 1 | Box | pending | pending | pending | pending | |
| 2 | Stack | pending | pending | pending | pending | |
| 3 | Grid | pending | pending | pending | pending | |
| 4 | Divider | pending | pending | pending | pending | |
| 5 | Container | pending | pending | pending | pending | |
| 6 | Flex | pending | pending | pending | pending | |
| 7 | Space | pending | pending | pending | pending | |
| 8 | Layout | pending | pending | pending | pending | Has Header, Sider, Content, Footer |
| 9 | Splitter | pending | pending | pending | pending | Has Panel |
| 10 | Collapse | pending | pending | pending | pending | Has Panel |

### Navigation (12 components)

| # | Component | Refactor | Tests | JSDoc | Story | Notes |
|---|-----------|----------|-------|-------|-------|-------|
| 1 | Tabs | pending | pending | pending | pending | |
| 2 | Breadcrumb | pending | pending | pending | pending | |
| 3 | Pagination | pending | pending | pending | pending | |
| 4 | Menu | pending | pending | pending | pending | |
| 5 | Stepper | pending | pending | pending | pending | |
| 6 | Steps | pending | pending | pending | pending | |
| 7 | Affix | pending | pending | pending | pending | |
| 8 | Segmented | pending | pending | pending | pending | |
| 9 | BackTop | pending | pending | pending | pending | |
| 10 | Anchor | pending | pending | pending | pending | Has Link |
| 11 | FloatButton | pending | pending | pending | pending | Has Group, BackTop |
| 12 | Link | pending | pending | pending | pending | |

### Overlay (6 components)

| # | Component | Refactor | Tests | JSDoc | Story | Notes |
|---|-----------|----------|-------|-------|-------|-------|
| 1 | Modal | pending | pending | pending | pending | Overlay version |
| 2 | Dropdown | pending | pending | pending | pending | |
| 3 | Popover | pending | pending | pending | pending | |
| 4 | Popconfirm | pending | pending | pending | pending | |
| 5 | Tour | pending | pending | pending | pending | |
| 6 | Watermark | pending | pending | pending | pending | |

---

## Priority 2: Tests

### Fix Failing Tests

| # | Test File | Issue | Status |
|---|-----------|-------|--------|
| 1 | ThemeProvider.test.tsx | Timeout issues | pending |
| 2 | Various | 91 failing (57.8% pass rate) | pending |

### Test Coverage Goals

| Metric | Current | Target |
|--------|---------|--------|
| Pass rate | 57.8% | 95%+ |
| Components with tests | ~5 | 76 |
| Engine coverage | Partial | All 3 engines |

### Test Template

```tsx
// Component/tests/Component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from '../';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component>Content</Component>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<Component size={size}>Test</Component>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Component engine={engine}>Test</Component>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

## Priority 3: Documentation (JSDoc + Comments)

### JSDoc Standards

```tsx
/**
 * A versatile button component that supports multiple variants, sizes, and states.
 *
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 *
 * @param props - The component props
 * @param props.variant - Visual style variant
 * @param props.size - Button size
 * @param props.disabled - Whether the button is disabled
 * @param props.loading - Shows loading spinner when true
 * @param props.engine - Rendering engine override
 * @returns The rendered button element
 */
```

### Inline Comments Standards

```tsx
// Engine selection: prioritize prop > context > default
const activeEngine = engine ?? contextEngine ?? 'titan';

// Calculate responsive size based on breakpoint
const computedSize = useResponsiveValue({ base: 'sm', md: size });
```

### Documentation Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Convert all Spanish comments to English | pending |
| 2 | Add JSDoc to all public component APIs | pending |
| 3 | Add JSDoc to all public hooks | pending |
| 4 | Add JSDoc to all utility functions | pending |
| 5 | Add inline comments for complex logic | pending |
| 6 | Document all type definitions | pending |

---

## Priority 4: Storybook

### Current State

| Metric | Value |
|--------|-------|
| Total stories | 8 |
| Colocated | 1 (Avatar) |
| Not colocated | 7 |

### Storybook Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Move existing stories to component folders | pending |
| 2 | Create stories for all 76 components | pending |
| 3 | Add engine switcher global control | pending |
| 4 | Add size/variant controls to all stories | pending |
| 5 | Add EngineComparison story to all components | pending |

### Story Template

```tsx
// Component/stories/Component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Component } from '../';

const meta: Meta<typeof Component> = {
  title: 'Primitives/Category/Component',
  component: Component,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['primary', 'secondary', 'outline'] },
    engine: { control: 'select', options: ['titan', 'hermes', 'apollo'] },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: { size: 'md', variant: 'primary' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <Component key={size} size={size}>{size}</Component>
      ))}
    </div>
  ),
};

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {(['titan', 'hermes', 'apollo'] as const).map(engine => (
        <Component key={engine} engine={engine}>{engine}</Component>
      ))}
    </div>
  ),
};
```

---

## Priority 5: Additional Tasks

### Token System Refactor

| # | Task | Status |
|---|------|--------|
| 1 | Create `tokens/css/base/` structure | pending |
| 2 | Create `tokens/css/components/` structure | pending |
| 3 | Create `tokens/ts/` TypeScript mirrors | pending |
| 4 | Create `tokens/css/tenants/` structure | pending |
| 5 | Remove hardcoded SIZE_MAP from ~40 files | pending |
| 6 | Remove `/config/tokens/` duplicate | pending |

### TypeScript Fixes

| # | Component | Engine | Issue |
|---|-----------|--------|-------|
| 1 | Calendar | Titan | Type mismatch cellRender, locale |
| 2 | Table | All | Type mismatch columns, pagination |
| 3 | Message | Hermes | Unused variables |
| 4 | List | Titan, Hermes | Type mismatch |
| 5 | InputNumber | Titan | onStep callback |
| 6 | Switch | Titan | onClick event |
| 7 | TimePicker | Titan | Step intervals, refs |
| 8 | Form | Titan | Rules, FormList fields |

### Cleanup

| # | Task | Status |
|---|------|--------|
| 1 | Remove duplicate `display/Collapse/` (use `layout/Collapse/`) | pending |
| 2 | Remove empty `/stories/` root folder | pending |
| 3 | Remove empty `/__tests__/` root folder | pending |
| 4 | Cleanup `/types/engine` vs `/types/engines` duplicate | pending |

### CI/CD

| # | Task | Status |
|---|------|--------|
| 1 | GitHub Actions for tests | pending |
| 2 | GitHub Actions for build | pending |
| 3 | GitHub Actions for Storybook deploy | pending |

---

## Excluded

| Feature | Reason |
|---------|--------|
| Dark mode | Not wanted |

---

## Commands Reference

```bash
npm run dev          # Dashboard (port 3000+)
npm run storybook    # Storybook (port 6006)
npm run build        # Build library (~7.5s)
npm test             # Run tests
```

---

## Reference Implementation

**Avatar** is the complete reference template:

```
packages/core/src/components/primitives/display/Avatar/
├── base/index.tsx           # Base with CSS variables
├── compound/                # Badge, Fallback, Group
├── engines/                 # titan, hermes, apollo
├── types/index.ts           # Type definitions
├── stories/Avatar.stories.tsx
├── tests/Avatar.test.tsx
└── index.ts                 # Main export
```

---

*Last updated: 2025-12-26*
*Total: 76 components*
