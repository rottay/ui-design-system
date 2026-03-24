# PatternPageShell

**Source**: `ui-design-system/packages/core/src/components/patterns/page-shell/`
**Component**: `PatternPageShell`
**Export**: `import { PatternPageShell } from '@rottay/design-system'`

## Purpose

Standard page layout wrapper used across all application pages. Provides a header area with title, optional breadcrumbs, action buttons, tab sub-navigation, a back button, a badge element, and a max-width content constraint. The `children` slot holds the main page content rendered below the header/tabs area.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

All three engines are independently implemented.

## Props Interface

```typescript
interface PageShellProps extends PatternBaseProps {
  /** Page title displayed as the primary heading. */
  title: string;

  /** Optional subtitle or description rendered below the title. */
  subtitle?: ReactNode;

  /** Breadcrumb trail items; last item is treated as current (no link). */
  breadcrumbs?: { label: string; href?: string; onClick?: () => void }[];

  /** Action buttons or controls rendered in the top-right header area. */
  actions?: ReactNode;

  /** Tab definitions for sub-navigation within the page. */
  tabs?: { key: string; label: string; content: ReactNode }[];

  /** Key of the currently active tab. */
  activeTab?: string;

  /** Called when the user switches tabs. */
  onTabChange?: (key: string) => void;

  /** Main page content rendered below the header/tabs area. */
  children: ReactNode;

  /** Back navigation button configuration. */
  back?: { label?: string; onClick: () => void };

  /** Badge element rendered next to the title (e.g. status indicator). */
  badge?: ReactNode;

  /** Maximum width constraint for the page content area. */
  maxWidth?: number | string;
}
```

## Usage Example

```tsx
import { PatternPageShell } from '@rottay/design-system';

<PatternPageShell
  title="Team Members"
  subtitle="Manage your organization's team"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Team' },
  ]}
  actions={<Button onClick={openInvite}>Invite Member</Button>}
  tabs={[
    { key: 'active', label: 'Active', content: <ActiveMembers /> },
    { key: 'pending', label: 'Pending', content: <PendingInvites /> },
  ]}
  activeTab="active"
  onTabChange={setActiveTab}
  back={{ label: 'Settings', onClick: () => router.back() }}
  maxWidth={1200}
>
  {/* Fallback content when no tabs match or when tabs are not used */}
  <MembersList />
</PatternPageShell>
```

## Related Patterns

- **CockpitHeader** -- Focused on the header region of detail pages with status badges and sticky mode. PageShell is the full page wrapper.
- **DetailPanel** -- For entity detail views with sidebar and tabs. Can be nested inside a PageShell.
- **ListToolbar** -- Often placed inside a PageShell as the toolbar above a data table.
