# PatternDetailPanel

**Source**: `ui-design-system/packages/core/src/components/patterns/detail-panel/`
**Component**: `PatternDetailPanel<T>`
**Export**: `import { PatternDetailPanel } from '@rottay/design-system'`

## Purpose

Generic entity detail view for displaying a single record with a header (title, subtitle, avatar, status), tabbed content area with badge counts, action buttons (edit, delete, archive), an optional sidebar (left or right), breadcrumb navigation, header extras, and a fixed footer. Designed for user profiles, order details, event pages, and any entity requiring a structured detail layout.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

All three engines are independently implemented.

## Props Interface

```typescript
interface DetailPanelProps<T> extends PatternBaseProps {
  /** The data object representing the entity being displayed. */
  data: T;

  /** Panel title, typically the entity name. Accepts ReactNode. */
  title: ReactNode;

  /** Optional subtitle (e.g., email, role). */
  subtitle?: ReactNode;

  /** Avatar or image element representing the entity. */
  avatar?: ReactNode;

  /** Status badge displayed alongside the title. */
  status?: { label: string; color?: string };

  /** Tab definitions for the content area. */
  tabs?: DetailTab[];

  /** Key of the currently active tab (controlled mode). */
  activeTab?: string;

  /** Callback fired when the active tab changes. */
  onTabChange?: (key: string) => void;

  /** Action buttons rendered in the panel header. */
  actions?: DetailAction[];

  /** Sidebar content (metadata, quick info, related links). */
  sidebar?: ReactNode;

  /** Which side the sidebar renders on. Default: 'right'. */
  sidebarPosition?: 'left' | 'right';

  /** Width of the sidebar (px or CSS string). */
  sidebarWidth?: number | string;

  /** Back button handler for parent-level navigation. */
  onBack?: () => void;

  /** Extra content rendered in the header area after title/actions. */
  headerExtra?: ReactNode;

  /** Content rendered in the fixed footer area. */
  footer?: ReactNode;

  /** Breadcrumb navigation items above the title. */
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];
}
```

## Companion Types

### DetailTab

```typescript
interface DetailTab {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  badge?: number | string;  // e.g. unread count
  disabled?: boolean;
}
```

### DetailAction

```typescript
interface DetailAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

## Usage Example

```tsx
import { PatternDetailPanel } from '@rottay/design-system';

<PatternDetailPanel<User>
  data={user}
  title={user.name}
  subtitle={user.email}
  avatar={<Avatar src={user.avatar} size="lg" />}
  status={{ label: 'Active', color: 'green' }}
  breadcrumbs={[
    { label: 'Users', onClick: () => navigate('/users') },
    { label: user.name },
  ]}
  tabs={[
    { key: 'overview', label: 'Overview', content: <UserOverview user={user} /> },
    { key: 'activity', label: 'Activity', badge: 5, content: <ActivityFeed userId={user.id} /> },
    { key: 'settings', label: 'Settings', content: <UserSettings user={user} /> },
  ]}
  activeTab="overview"
  onTabChange={(key) => setActiveTab(key)}
  actions={[
    { key: 'edit', label: 'Edit', variant: 'primary', onClick: handleEdit },
    { key: 'delete', label: 'Delete', variant: 'danger', onClick: handleDelete },
  ]}
  sidebar={<UserMetadata user={user} />}
  sidebarPosition="right"
  sidebarWidth={320}
  onBack={() => navigate(-1)}
/>
```

## Related Patterns

- **CockpitHeader** -- If you only need the header portion (breadcrumbs + title + status + actions), use CockpitHeader instead.
- **PageShell** -- For wrapping entire pages with tabs. DetailPanel is for individual entity detail views.
- **Timeline** / **ActivityLog** -- Commonly used as content within DetailPanel tabs.
