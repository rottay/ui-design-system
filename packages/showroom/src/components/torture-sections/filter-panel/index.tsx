'use client';

import { Box, Stack, PatternFilterPanel, type FilterDef } from '@rottay/design-system';

// Fixed filter set for the FilterPanel data-part probe (WO-ARC-09
// checkpoint 3). Covers every branch that paints: `query` is free-text,
// `status` is a `select` with one option per inferOptionTone branch
// (danger/warning/success/primary/info/neutral -- the modern-only
// option-icon-badge swatch), `tags` is a `multi-select`, `enabled` is a
// `boolean`, `window` is a `date-range`, and `capacity` is a
// `number-range`. Every key in FILTER_PANEL_VALUES is non-empty so the
// active-count badge (modern) and the active-filter chip row (rustic,
// inline layout) both render. A second, single-filter `sidebar` instance
// exercises the isSidebar borderRight branch. The loading branch is
// deliberately not rendered here -- its spinner/text is exempt residual
// and covered by transcription + the real-engines unit test.
const FILTER_PANEL_DEFINITIONS: FilterDef[] = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search owner' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [
      { value: 'rejected', label: 'Rejected candidate' },
      { value: 'needs-review', label: 'Needs review' },
      { value: 'completed', label: 'Completed' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'remote', label: 'Remote' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multi-select',
    options: [
      { value: 'vip', label: 'VIP' },
      { value: 'indoor', label: 'Indoor' },
    ],
  },
  { key: 'enabled', label: 'Enabled', type: 'boolean' },
  { key: 'window', label: 'Window', type: 'date-range' },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
];

const FILTER_PANEL_VALUES: Record<string, unknown> = {
  query: 'ada',
  status: 'scheduled',
  tags: ['vip'],
  enabled: true,
  window: ['2026-01-01', '2026-02-01'],
  capacity: [10, 50],
};

// A FilterPanel with every filter branch and several active values,
// rendered only behind `?filterpanel=1` so no flagship capture sees it.
// WO-ARC-09 checkpoint 3 moves this panel's paint out of inline `style={}`
// objects into the unlayered filter-panel skin, keyed on the `data-part`
// attributes the pre-step stamps. This section is what
// `filter-panel.spec.ts` photographs and reads computed styles from.
export function FilterPanelStates() {
  return (
    <Box
      data-testid="probe-filter-panel"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="md" fullWidth>
        <PatternFilterPanel
          filters={FILTER_PANEL_DEFINITIONS}
          values={FILTER_PANEL_VALUES}
          onChange={() => undefined}
          onApply={() => undefined}
          onReset={() => undefined}
          layout="inline"
          collapsible
          title="Filters"
          activeCount={6}
          showApply
          showReset
        />
        <PatternFilterPanel
          filters={[FILTER_PANEL_DEFINITIONS[0]]}
          values={{}}
          onChange={() => undefined}
          layout="sidebar"
          title="Sidebar"
        />
      </Stack>
    </Box>
  );
}
