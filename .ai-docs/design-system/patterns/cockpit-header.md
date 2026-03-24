# PatternCockpitHeader

**Source**: `ui-design-system/packages/core/src/components/patterns/cockpit-header/`
**Component**: `PatternCockpitHeader`
**Export**: `import { PatternCockpitHeader } from '@rottay/design-system'`

## Purpose

Renders a rich header for detail/workbench pages with back navigation, breadcrumb trail, title + status badge cluster, action buttons, and optional sticky compact mode on scroll. Designed as the top chrome for entity detail pages (e.g., "Event #1234", "User Profile", "Order Detail").

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | Falls back to `engines/classic.tsx` |
| rustic (Apollo) | Falls back to `engines/classic.tsx` |

Only the classic engine has a dedicated implementation. Modern and rustic route to classic.

## Props Interface

```typescript
interface CockpitHeaderProps extends PatternBaseProps {
  /** Page title. */
  title: string;

  /** Optional subtitle displayed below the title. */
  subtitle?: string;

  /** Breadcrumb trail rendered above the title. */
  breadcrumbs?: CockpitBreadcrumb[];

  /** Status badges displayed next to the title. */
  status?: CockpitStatus[];

  /** Action buttons or controls rendered on the right side. */
  actions?: ReactNode;

  /** When true, the header becomes sticky and compact on scroll. */
  sticky?: boolean;

  /** Callback fired when the back button is clicked. */
  onBack?: () => void;
}
```

## Companion Types

```typescript
interface CockpitBreadcrumb {
  label: string;
  href?: string;  // When omitted, renders as plain text (current page)
}

interface CockpitStatus {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
}
```

## Usage Example

```tsx
import { PatternCockpitHeader } from '@rottay/design-system';

<PatternCockpitHeader
  title="Event #1234"
  subtitle="Summer Music Festival"
  breadcrumbs={[
    { label: 'Events', href: '/events' },
    { label: 'Festivals', href: '/events?type=festival' },
    { label: 'Event #1234' },
  ]}
  status={[
    { label: 'Active', variant: 'success' },
    { label: 'VIP', variant: 'info' },
  ]}
  actions={
    <Flex gap="2">
      <Button variant="default" onClick={handleDuplicate}>Duplicate</Button>
      <Button variant="primary" onClick={handleEdit}>Edit Event</Button>
    </Flex>
  }
  sticky
  onBack={() => router.back()}
/>
```

## Related Patterns

- **PageShell** -- More general page wrapper with tabs and content area. CockpitHeader is focused on the header region of detail pages.
- **WorkbenchHeader** -- Similar but for role-home/workbench pages (has exception count, saved views, quick actions).
- **DetailPanel** -- Often used below a CockpitHeader to provide the tabbed content area.
