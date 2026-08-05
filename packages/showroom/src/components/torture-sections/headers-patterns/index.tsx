'use client';

import {
  Badge,
  Box,
  Button,
  PatternCockpitHeader,
  PatternPageShell,
  PatternWorkbenchHeader,
  Stack,
  Text,
  type CockpitStatus,
  type WorkbenchQuickAction,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// Fixed fixtures for the WO-SKIN-06 checkpoint CK-B/P patterns/misc header
// data-part probe (CockpitHeader, PageShell, WorkbenchHeader). Every value is a
// literal, so the section renders identically on every load. Rendered only
// behind `?headers-patterns=1` so no flagship capture sees it.
//
// Renders every state a skin rule in this checkpoint keys on: all five
// CockpitStatus variants (STATUS_PILL_STYLES is a 5-way map), all three
// WorkbenchQuickAction variants plus a disabled one (variantStyles is a 3-way
// map whose `hover` sub-object is SPREAD over its `base` — the P-78 shape),
// active/inactive tabs in both tab strips, the terminal `isLast` crumb, a
// labelled back button, PageShell's no-tabs `rule` branch, and all three
// loading-skeleton branches.
//
// `isCompact` is NOT driven from here. headers-patterns-batch.spec.ts stubs
// `window.scrollY` and dispatches the scroll event CockpitHeader listens for,
// so the viewport never moves and no other fixture in this grid shifts under
// it. The sticky instance below exists only so that listener is attached.
//
// Only PageShell has a rustic engine. CockpitHeader and WorkbenchHeader map
// rustic -> `./engines/classic`, so under `?engine=rustic` those two bands
// render the CLASSIC engine, which this checkpoint does not own.
// ---------------------------------------------------------------------------

const HP_CRUMBS = [{ label: 'Home', href: '/' }, { label: 'Events', href: '/events' }, { label: 'Event #1234' }];

const HP_STATUS: CockpitStatus[] = [
  { label: 'Active', variant: 'success' },
  { label: 'Pending', variant: 'warning' },
  { label: 'Failed', variant: 'error' },
  { label: 'VIP', variant: 'info' },
  { label: 'Draft', variant: 'default' },
];

const HP_QUICK_ACTIONS: WorkbenchQuickAction[] = [
  { label: 'Save', onClick: () => undefined, variant: 'primary' },
  { label: 'Delete', onClick: () => undefined, variant: 'danger' },
  { label: 'Archive', onClick: () => undefined, variant: 'default' },
  {
    label: 'Locked',
    onClick: () => undefined,
    variant: 'default',
    disabled: true,
  },
];

const HP_SAVED_VIEWS = [
  { id: 'default', label: 'Default View' },
  { id: 'compact', label: 'Compact View' },
];

function HeadersPatternsFbCockpit() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-cockpit">
      <Text size="xs" color="secondary">
        CockpitHeader (all five status variants)
      </Text>
      <PatternCockpitHeader
        title="Event #1234"
        subtitle="Summer Music Festival — Main Stage"
        breadcrumbs={HP_CRUMBS}
        status={HP_STATUS}
        onBack={() => undefined}
        actions={<Button size="sm">Edit</Button>}
      />
    </Stack>
  );
}

function HeadersPatternsFbCockpitSticky() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-cockpit-sticky">
      <Text size="xs" color="secondary">
        CockpitHeader (sticky — compact on scroll)
      </Text>
      <PatternCockpitHeader
        title="Event #1234"
        subtitle="Sticky instance"
        breadcrumbs={HP_CRUMBS}
        status={[HP_STATUS[0]]}
        onBack={() => undefined}
        sticky
      />
    </Stack>
  );
}

function HeadersPatternsFbPageShell() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-page-shell">
      <Text size="xs" color="secondary">
        PageShell (tabs, labelled back, badge, header content)
      </Text>
      <PatternPageShell
        title="Users"
        subtitle="Manage platform users"
        breadcrumbs={HP_CRUMBS}
        back={{ label: 'Settings', onClick: () => undefined }}
        badge={<Badge variant="primary">beta</Badge>}
        headerContent={<Text size="xs">Header content slot</Text>}
        actions={<Button size="sm">Add User</Button>}
        tabs={[
          {
            key: 'all',
            label: 'All',
            content: <Text size="xs">All records</Text>,
          },
          {
            key: 'archived',
            label: 'Archived',
            content: <Text size="xs">Archived records</Text>,
          },
        ]}
        activeTab="all"
        onTabChange={() => undefined}
      >
        {/* PageShellProps.children is required even when tabs supply the body:
            with tabs present the modern engine renders the active tab's content
            and ignores children. */}
        <Text size="xs">Tab-driven body</Text>
      </PatternPageShell>
    </Stack>
  );
}

function HeadersPatternsFbPageShellNoTabs() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-page-shell-notabs">
      <Text size="xs" color="secondary">
        PageShell (no tabs — the bare rule branch)
      </Text>
      <PatternPageShell title="Users" subtitle="No tabs">
        <Text size="xs">Content</Text>
      </PatternPageShell>
    </Stack>
  );
}

function HeadersPatternsFbWorkbench() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-workbench">
      <Text size="xs" color="secondary">
        WorkbenchHeader (three quick-action variants + disabled)
      </Text>
      <PatternWorkbenchHeader
        title="Operations Dashboard"
        subtitle="Morning briefing"
        exceptionCount={3}
        quickActions={HP_QUICK_ACTIONS}
        savedViews={HP_SAVED_VIEWS}
        activeViewId="default"
        onViewChange={() => undefined}
      />
    </Stack>
  );
}

function HeadersPatternsFbLoading() {
  return (
    <Stack spacing="xs" data-testid="probe-headers-patterns-loading">
      <Text size="xs" color="secondary">
        Loading branches (cockpit 6 blocks / page-shell 5 / workbench 6)
      </Text>
      <PatternCockpitHeader title="Loading" loading />
      <PatternPageShell title="Loading" loading>
        <Text size="xs">Body</Text>
      </PatternPageShell>
      <PatternWorkbenchHeader title="Loading" loading />
    </Stack>
  );
}

export function HeadersPatternsFbStates() {
  return (
    <Box
      data-testid="probe-headers-patterns"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <HeadersPatternsFbCockpit />
        <HeadersPatternsFbCockpitSticky />
        <HeadersPatternsFbPageShell />
        <HeadersPatternsFbPageShellNoTabs />
        <HeadersPatternsFbWorkbench />
        <HeadersPatternsFbLoading />
      </Stack>
    </Box>
  );
}
