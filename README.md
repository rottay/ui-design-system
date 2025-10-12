# 🎨 Design System - Multi-Theme React Library

[![Version](https://img.shields.io/badge/version-0.1.5-blue.svg)](https://github.com/rottay/desing-system)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

A comprehensive **multi-theme design system** built on top of Ant Design with **87 components**, **8 pre-built themes**, and a complete **design token system**. Perfect for building consistent, theme-aware React applications.

![Phase 5 Complete](https://img.shields.io/badge/Phase%205-Complete-brightgreen.svg)

---

## ✨ Features

- 🎭 **8 Pre-built Themes** - Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel, Base
- 🧩 **87 Components** - 63 primitives + 13 composites + 11 layout patterns
- 🎨 **Design Token System** - Complete token library (colors, spacing, typography, effects, layout, animation)
- 🔄 **Theme Switching** - Runtime theme switching with localStorage persistence
- 📱 **Responsive** - Mobile-first design with responsive utilities
- 🎯 **TypeScript First** - Full type safety and IntelliSense support
- 📦 **Tree Shakeable** - ESM/CJS builds with optimal bundle size
- 📖 **Storybook** - Interactive component documentation
- 🚀 **Production Ready** - Used in real-world projects

---

## 📦 Installation

### Option 1: Local Development (Current)

```bash
# In your Next.js project
npm install file:../path/to/desing-system/packages/core
```

### Option 2: NPM/GitHub Packages (Coming Soon)

```bash
npm install @es-rottay/designsystem-core
# or
yarn add @es-rottay/designsystem-core
# or
pnpm add @es-rottay/designsystem-core
```

---

## 🚀 Quick Start

### Setup with Next.js App Router

```tsx
// app/providers.tsx
'use client';

import { ThemeProvider } from '@es-rottay/designsystem-core';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTemplate="spotify">
      {children}
    </ThemeProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Setup with Next.js Pages Router

```tsx
// pages/_app.tsx
import { ThemeProvider } from '@es-rottay/designsystem-core';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTemplate="spotify">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### Next.js Configuration

Add this to your `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@es-rottay/designsystem-core', 'antd'],
};

module.exports = nextConfig;
```

---

## 🎨 Usage Examples

### Using Primitive Components

```tsx
'use client';

import { Button, Input, Card, Badge } from '@es-rottay/designsystem-core';

export default function MyPage() {
  return (
    <Card>
      <Badge count={5}>
        <Button type="primary" size="large">
          Click Me
        </Button>
      </Badge>

      <Input
        placeholder="Enter your name"
        size="large"
      />
    </Card>
  );
}
```

### Using Composite Components

```tsx
'use client';

import {
  DashboardCard,
  PageHeader,
  UserMenu,
  NotificationCenter,
  SearchBar,
} from '@es-rottay/designsystem-core';
import { Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      {/* Header with navigation components */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SearchBar placeholder="Search..." />
        <div style={{ display: 'flex', gap: 16 }}>
          <NotificationCenter notifications={[]} />
          <UserMenu user={{ name: 'John Doe', email: 'john@example.com' }} />
        </div>
      </div>

      {/* Page header */}
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back!"
        breadcrumbs={[
          { title: 'Home' },
          { title: 'Dashboard' },
        ]}
      />

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <DashboardCard
          title="Total Users"
          value="2,350"
          trend={{ direction: 'up', value: 12.5 }}
          icon={<Users size={24} />}
          color="success"
        />

        <DashboardCard
          title="Revenue"
          value="$48,392"
          trend={{ direction: 'up', value: 8.2 }}
          icon={<TrendingUp size={24} />}
          color="primary"
        />
      </div>
    </>
  );
}
```

### Using Layout Patterns

```tsx
import {
  HStack,
  Center,
  Section,
  LayoutGrid,
  AspectRatio,
} from '@es-rottay/designsystem-core';

export default function LayoutExample() {
  return (
    <Section size="lg">
      {/* Horizontal stack with gap */}
      <HStack gap="md" align="center" justify="space-between">
        <h1>Title</h1>
        <button>Action</button>
      </HStack>

      {/* Responsive grid */}
      <LayoutGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
      </LayoutGrid>

      {/* Maintain aspect ratio */}
      <AspectRatio ratio="16/9">
        <img src="/banner.jpg" alt="Banner" />
      </AspectRatio>

      {/* Center content */}
      <Center>
        <button>Centered Button</button>
      </Center>
    </Section>
  );
}
```

### Using Design Tokens

```tsx
import {
  spacing,
  fontSize,
  shadows,
  borderRadius,
  transitions,
  themeColors,
} from '@es-rottay/designsystem-core';

const MyComponent = () => (
  <div
    style={{
      padding: spacing[16],
      fontSize: fontSize.lg,
      boxShadow: shadows.md,
      borderRadius: borderRadius.md,
      transition: transitions.all,
      backgroundColor: themeColors.spotify.primary,
    }}
  >
    Styled with design tokens
  </div>
);
```

### Theme Switching

```tsx
'use client';

import { useTheme, Button } from '@es-rottay/designsystem-core';

export function ThemeSwitcher() {
  const { template, setTemplate } = useTheme();

  return (
    <div>
      <p>Current theme: {template}</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onClick={() => setTemplate('spotify')}>Spotify</Button>
        <Button onClick={() => setTemplate('stripe')}>Stripe</Button>
        <Button onClick={() => setTemplate('airbnb')}>Airbnb</Button>
        <Button onClick={() => setTemplate('slack')}>Slack</Button>
        <Button onClick={() => setTemplate('notion')}>Notion</Button>
        <Button onClick={() => setTemplate('linear')}>Linear</Button>
        <Button onClick={() => setTemplate('vercel')}>Vercel</Button>
        <Button onClick={() => setTemplate('base')}>Base</Button>
      </div>
    </div>
  );
}
```

---

## 🎭 Available Themes

| Theme | Primary Color | Background | Border Radius | Style |
|-------|---------------|------------|---------------|-------|
| **Spotify** | `#1DB954` Green | `#121212` Dark | 8px | Bold, Dark |
| **Stripe** | `#635BFF` Violet | `#FAFAFA` Light | 6px | Professional |
| **Airbnb** | `#FF5A5F` Coral | `#FFFFFF` White | 8px | Friendly |
| **Slack** | `#611F69` Purple | `#FFFFFF` White | 4px | Sharp |
| **Notion** | `#000000` Black | `#FFFFFF` White | 3px | Minimal |
| **Linear** | `#5E6AD2` Blue | `#F9FAFB` Gray | 12px | Modern |
| **Vercel** | `#000000` Black | `#FAFAFA` Light | 8px | Clean |
| **Base** | `#1890ff` Blue | `#FFFFFF` White | 6px | Classic |

All themes are **fully functional** with automatic localStorage persistence.

---

## 📚 Component Library

### Primitive Components (63)

#### Display (17)
`Avatar`, `Badge`, `Calendar`, `Carousel`, `Collapse`, `Descriptions`, `Empty`, `Image`, `List`, `QRCode`, `Statistic`, `Table`, `Tag`, `Timeline`, `Tooltip`, `Tree`, `Typography`

#### Feedback (9)
`Alert`, `Drawer`, `Message`, `Modal`, `Notification`, `Progress`, `Result`, `Skeleton`, `Spin`

#### Inputs (17)
`AutoComplete`, `Cascader`, `Checkbox`, `ColorPicker`, `DatePicker`, `Form`, `Input`, `InputNumber`, `Mentions`, `Radio`, `Rate`, `Select`, `Slider`, `Switch`, `TimePicker`, `Transfer`, `Upload`

#### Layout (9)
`Card`, `Container`, `Divider`, `Flex`, `Grid`, `Layout`, `Space`, `Splitter`, `Stack`

#### Navigation (11)
`Affix`, `Anchor`, `BackTop`, `Breadcrumb`, `Button`, `FloatButton`, `Menu`, `Pagination`, `Segmented`, `Steps`, `Tabs`

### Composite Components (13)

Theme-aware complex components built from primitives:

1. **AuthLayout** - Authentication page layouts
2. **DashboardCard** - Stat cards with trends and icons
3. **DashboardLayout** - Complete dashboard layout with sidebar
4. **DataTable** - Table with search, filtering, and actions
5. **EmptyState** - Empty states (no-data, error, 404, etc.)
6. **FormBuilder** - Dynamic form generator from JSON schema
7. **PageHeader** - Page headers with breadcrumbs and actions
8. **SearchableSelect** - Select with search and debouncing
9. **UserMenu** ⭐ - User dropdown with avatar and menu
10. **SearchBar** ⭐ - Search with suggestions and shortcuts
11. **NotificationCenter** ⭐ - Notification dropdown with badges
12. **Sidebar** ⭐ - Collapsible navigation sidebar
13. **FileUploader** ⭐ - Drag & drop file upload

⭐ = New in Phase 5

### Layout Patterns (11)

Reusable layout components for common patterns:

`HStack`, `Center`, `Spacer`, `Wrap`, `LayoutGrid`, `Section`, `AspectRatio`, `Container`, `Stack`, `Flex`, `Divider`

### Design Tokens

Complete token system for building custom components:

- **Colors** - Neutral scales, semantic colors, theme palettes
- **Spacing** - 0-96 scale, named spacing, component spacing
- **Typography** - Font families, sizes, weights, line heights
- **Effects** - Shadows, border radius, opacity, blur
- **Layout** - Breakpoints, z-index, container sizes
- **Animation** - Durations, easings, transitions, keyframes

---

## 🛠️ Development

### Project Structure

```
desing-system/
├── packages/
│   ├── core/                    # Main library
│   │   ├── src/
│   │   │   ├── components/      # 63 primitive components
│   │   │   ├── composite/       # 13 composite components
│   │   │   ├── layout-patterns/ # 11 layout patterns
│   │   │   ├── tokens/          # Design token system
│   │   │   ├── themes/          # 8 theme configurations
│   │   │   ├── providers/       # ThemeProvider
│   │   │   ├── hooks/           # useTheme hook
│   │   │   └── icons/           # Icon system
│   │   ├── dist/                # Build output
│   │   └── .storybook/          # Storybook config
│   └── dashboard/               # Demo/showcase app
├── package.json
└── README.md
```

### Available Commands

```bash
# Development
npm run dev              # Start dashboard (port 3000)
npm run storybook        # Start Storybook (port 6006)

# Build
npm run build            # Build core library
npm run build:all        # Build all packages

# Testing
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Type Checking
npm run typecheck        # Check types in all packages
npm run typecheck:core   # Check types in core only
```

### Build Output

```bash
npm run build

# Output:
# ✓ dist/index.js     245.36 kB │ gzip: 49.05 kB  (ESM)
# ✓ dist/index.cjs    163.83 kB │ gzip: 40.95 kB  (CJS)
# ✓ dist/index.d.ts   TypeScript definitions
```

---

## 📖 Documentation

- **Storybook** - Interactive component docs (run `npm run storybook`)
- **Dashboard** - Live demos of all components (run `npm run dev`)
- **CLAUDE.md** - Detailed internal documentation
- **TypeScript** - Full type definitions included

---

## 🧪 Testing

The project uses **Vitest** + **Testing Library** for testing:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Current test coverage: 4 components (expanding to full coverage)

---

## 🎯 Roadmap

### ✅ Phase 1-5 (Complete)
- [x] 63 Primitive components
- [x] 13 Composite components
- [x] 11 Layout patterns
- [x] 8 Themes with persistence
- [x] Design token system
- [x] Icon system
- [x] Storybook documentation
- [x] Dashboard showcase
- [x] Build system (ESM + CJS)
- [x] Basic tests

### 🎯 Phase 6 (In Progress)
- [ ] Comprehensive test coverage
- [ ] Updated documentation
- [ ] NPM/GitHub Packages publishing
- [ ] CI/CD with GitHub Actions
- [ ] Migration guides
- [ ] Contributing guidelines

### 🔮 Future
- [ ] Dark mode variants for all themes
- [ ] Animation system
- [ ] Form validation helpers
- [ ] Accessibility improvements
- [ ] Performance optimizations

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/rottay/desing-system.git

# Install dependencies
cd desing-system
npm install

# Start development
npm run dev

# Run tests
npm run test
```

---

## 📄 License

MIT © Emmanuel Rottay

See [LICENSE](LICENSE) for more information.

---

## 🔗 Links

- [GitHub Repository](https://github.com/rottay/desing-system)
- [Issue Tracker](https://github.com/rottay/desing-system/issues)
- [Ant Design Documentation](https://ant.design/)
- [Storybook](https://storybook.js.org/)

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Components | 87 (63 primitives + 13 composites + 11 patterns) |
| Themes | 8 |
| Bundle Size (ESM) | 245KB (gzipped: 49KB) |
| Bundle Size (CJS) | 163KB (gzipped: 40KB) |
| TypeScript | 100% |
| Phase | 5 (Complete) |

---

**Made with ❤️ for the React community**
