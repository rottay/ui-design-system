# Navigation Primitives

Three navigation components following the multi-engine architecture.

## Components

### 1. Tabs
Tab navigation with multiple styles.

**Props:**
- `items: TabItem[]` - Array of tab items with key, label, children, icon, disabled
- `activeKey?: string` - Controlled active tab
- `defaultActiveKey?: string` - Default active tab
- `type?: 'line' | 'card' | 'pills'` - Tab style
- `size?: 'sm' | 'md' | 'lg'` - Tab size
- `centered?: boolean` - Center tabs
- `onChange?: (key: string) => void` - Tab change callback

**Example:**
```tsx
import { Tabs } from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

const items = [
  {
    key: 'home',
    label: 'Home',
    icon: <Icon name="navigation.home" size="sm" decorative />,
    children: <div>Home content</div>,
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: <Icon name="entity.person" size="sm" decorative />,
    children: <div>Profile content</div>,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Icon name="navigation.settings" size="sm" decorative />,
    children: <div>Settings content</div>,
    disabled: true,
  },
];

<Tabs items={items} type="line" size="md" />
```

### 2. Breadcrumb
Breadcrumb navigation for hierarchical pages.

**Props:**
- `items: BreadcrumbItem[]` - Array of breadcrumb items with key, label, href, icon, onClick
- `separator?: ReactNode` - Custom separator (default: '/')
- `maxItems?: number` - Maximum items to display before collapsing

**Example:**
```tsx
import { Breadcrumb } from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

const items = [
  {
    key: 'home',
    label: 'Home',
    icon: <Icon name="navigation.home" size="sm" decorative />,
    href: '/',
  },
  {
    key: 'products',
    label: 'Products',
    href: '/products',
  },
  {
    key: 'category',
    label: 'Electronics',
    href: '/products/electronics',
  },
  {
    key: 'item',
    label: 'Laptop',
  },
];

<Breadcrumb
  items={items}
  separator={<Icon name="navigation.forward" size="xs" decorative />}
  maxItems={4}
/>
```

### 3. Pagination
Page navigation for large datasets.

**Props:**
- `current: number` - Current page (1-indexed)
- `total: number` - Total number of items
- `pageSize?: number` - Items per page (default: 10)
- `size?: 'sm' | 'md' | 'lg'` - Pagination size
- `showSizeChanger?: boolean` - Show page size selector
- `showTotal?: boolean` - Show total items count
- `disabled?: boolean` - Disable pagination
- `onChange?: (page: number, pageSize: number) => void` - Page change callback

**Example:**
```tsx
import { Pagination } from '@rottay/design-system';
import { useState } from 'react';

function DataList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <Pagination
      current={page}
      total={250}
      pageSize={pageSize}
      size="md"
      showTotal
      onChange={handleChange}
    />
  );
}
```

## Engine Implementations

Each component has three implementations:

1. **Classic** (Ant Design) - Full-featured with enterprise UI
2. **Modern** (Rottay-native) - Token/skin-driven responsive presentation
3. **Rustic** (Pure HTML/CSS) - Zero dependencies with CSS variables

## Engine Selection

The active engine is determined by the EngineProvider:

```tsx
import { EngineProvider } from '@rottay/design-system';

<EngineProvider engine="classic">
  <App />
</EngineProvider>
```

## Styling

All components support:
- `className` - Custom CSS classes
- `style` - Inline styles
- Engine-specific theming through CSS variables

## Accessibility

- Tabs: Uses `role="tab"` and `role="tablist"`
- Breadcrumb: Uses `aria-label="breadcrumb"`
- Pagination: Semantic button navigation

## File Structure

```
navigation/
├── Tabs/
│   ├── index.tsx           # Stable component facade
│   ├── contracts/index.ts
│   ├── engines/{classic,modern,rustic}/index.tsx
│   ├── compound/TabPane/index.tsx
│   └── tests/
├── Breadcrumb/
│   ├── index.tsx
│   ├── contracts/index.ts
│   ├── engines/{classic,modern,rustic}/index.tsx
│   ├── compound/Item/index.tsx
│   └── tests/
├── Pagination/
│   ├── index.tsx
│   ├── contracts/index.ts
│   ├── engines/{classic,modern,rustic}/index.tsx
│   ├── compound/index.ts
│   └── tests/
└── index.ts                # Category barrel
```
