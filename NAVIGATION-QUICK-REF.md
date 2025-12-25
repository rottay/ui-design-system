# Navigation Primitives - Quick Reference

## Import

```typescript
import { Tabs, Breadcrumb, Pagination } from '@es-rottay/designsystem-core';
import type { TabsProps, BreadcrumbProps, PaginationProps } from '@es-rottay/designsystem-core';
```

## Tabs

### Basic Usage
```tsx
<Tabs
  items={[
    { key: '1', label: 'Tab 1', children: <div>Content 1</div> },
    { key: '2', label: 'Tab 2', children: <div>Content 2</div> },
  ]}
/>
```

### With Icons
```tsx
import { Home, User } from 'lucide-react';

<Tabs
  items={[
    { key: 'home', label: 'Home', icon: <Home size={16} />, children: <div>Home</div> },
    { key: 'user', label: 'User', icon: <User size={16} />, children: <div>User</div> },
  ]}
  type="card"
  size="lg"
/>
```

### Controlled
```tsx
const [active, setActive] = useState('tab1');

<Tabs
  items={items}
  activeKey={active}
  onChange={setActive}
  centered
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | required | Tab items |
| `activeKey` | `string` | - | Controlled active tab |
| `defaultActiveKey` | `string` | - | Default active tab |
| `type` | `'line' \| 'card' \| 'pills'` | `'line'` | Tab style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tab size |
| `centered` | `boolean` | `false` | Center tabs |
| `onChange` | `(key: string) => void` | - | Change callback |

## Breadcrumb

### Basic Usage
```tsx
<Breadcrumb
  items={[
    { key: 'home', label: 'Home', href: '/' },
    { key: 'products', label: 'Products', href: '/products' },
    { key: 'item', label: 'Item Details' },
  ]}
/>
```

### With Icons
```tsx
import { Home, ChevronRight } from 'lucide-react';

<Breadcrumb
  items={[
    { key: 'home', label: 'Home', icon: <Home size={14} />, href: '/' },
    { key: 'page', label: 'Current Page' },
  ]}
  separator={<ChevronRight size={12} />}
/>
```

### With Click Handlers
```tsx
<Breadcrumb
  items={[
    { key: 'home', label: 'Home', onClick: () => navigate('/') },
    { key: 'page', label: 'Current Page' },
  ]}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | required | Breadcrumb items |
| `separator` | `ReactNode` | `'/'` | Separator between items |
| `maxItems` | `number` | - | Max items before collapse |

## Pagination

### Basic Usage
```tsx
const [page, setPage] = useState(1);

<Pagination
  current={page}
  total={100}
  pageSize={10}
  onChange={setPage}
/>
```

### With Total
```tsx
<Pagination
  current={1}
  total={250}
  pageSize={20}
  showTotal
  onChange={(page) => console.log(page)}
/>
```

### With Size Changer
```tsx
const [page, setPage] = useState(1);
const [size, setSize] = useState(10);

<Pagination
  current={page}
  total={500}
  pageSize={size}
  showSizeChanger
  showTotal
  onChange={(p, s) => { setPage(p); setSize(s); }}
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `current` | `number` | required | Current page (1-indexed) |
| `total` | `number` | required | Total items |
| `pageSize` | `number` | `10` | Items per page |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Pagination size |
| `showSizeChanger` | `boolean` | `false` | Show page size selector |
| `showTotal` | `boolean` | `false` | Show total items |
| `disabled` | `boolean` | `false` | Disable pagination |
| `onChange` | `(page, size) => void` | - | Change callback |

## Type Definitions

### TabItem
```typescript
interface TabItem {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}
```

### BreadcrumbItem
```typescript
interface BreadcrumbItem {
  key: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}
```

## Engine Support

All components support three engines:

- **Titan** (Ant Design) - Full-featured enterprise UI
- **Hermes** (DaisyUI) - Lightweight Tailwind CSS
- **Apollo** (Pure CSS) - Zero dependencies

Engine is selected via `EngineProvider`:

```tsx
import { EngineProvider } from '@es-rottay/designsystem-core';

<EngineProvider engine="titan">
  <App />
</EngineProvider>
```

## Examples Location

Full examples available in:
- `/packages/core/src/components/primitives/navigation/EXAMPLES.tsx`

Documentation:
- `/packages/core/src/components/primitives/navigation/README.md`
