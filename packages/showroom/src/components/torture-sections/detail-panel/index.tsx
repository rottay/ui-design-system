'use client';

import { Box, Stack, Text, PatternDetailPanel, type DetailPanelProps } from '@rottay/design-system';

// Fixed fixtures for the DetailPanel data-part probe (WO-ARC-09
// checkpoint 5). One entity carries a custom `status.color` (rustic honors
// it, modern doesn't -- a pre-existing cross-engine gap the pre-step files
// but does not fix), breadcrumbs with a link and a current crumb, 4 action
// variants (one loading, one disabled), 3 tabs (one active, one disabled,
// two with badges), a sidebar, and a footer. Rendered only behind
// `?detailpanel=1` so no flagship capture sees it.
type DetailFixtureEntity = { id: string };

const DETAIL_PANEL_ENTITY: DetailFixtureEntity = { id: 'acme-corp' };

const DETAIL_PANEL_PROPS: DetailPanelProps<DetailFixtureEntity> = {
  data: DETAIL_PANEL_ENTITY,
  title: 'Acme Corp',
  subtitle: 'Enterprise customer since 2019',
  status: { label: 'On Leave', color: '#f59e0b' },
  breadcrumbs: [{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }],
  onBack: () => undefined,
  actions: [
    {
      key: 'edit',
      label: 'Edit',
      variant: 'primary',
      onClick: () => undefined,
    },
    {
      key: 'archive',
      label: 'Archive',
      variant: 'danger',
      onClick: () => undefined,
      loading: true,
    },
    { key: 'view', label: 'View', variant: 'ghost', onClick: () => undefined },
    { key: 'more', label: 'More', onClick: () => undefined, disabled: true },
  ],
  tabs: [
    {
      key: 'overview',
      label: 'Overview',
      content: <Text size="sm">Overview content</Text>,
      badge: 3,
    },
    {
      key: 'billing',
      label: 'Billing',
      content: <Text size="sm">Billing content</Text>,
    },
    {
      key: 'history',
      label: 'History',
      content: <Text size="sm">History content</Text>,
      disabled: true,
      badge: 'New',
    },
  ],
  sidebar: <Text size="sm">Sidebar content</Text>,
  footer: <Text size="sm">Footer content</Text>,
};

// A DetailPanel probe with a full instance and a loading instance, rendered
// only behind `?detailpanel=1` so no flagship capture sees it. WO-ARC-09
// checkpoint 5 moves this panel's paint out of inline `style={}` objects
// into the unlayered detail-panel skin, keyed on the `data-part` attributes
// the pre-step stamps. This section is what `detail-panel.spec.ts`
// photographs and reads computed styles from.
export function DetailPanelStates() {
  return (
    <Box
      data-testid="probe-detail-panel"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="md" fullWidth>
        <PatternDetailPanel {...DETAIL_PANEL_PROPS} />
        <PatternDetailPanel {...DETAIL_PANEL_PROPS} loading />
      </Stack>
    </Box>
  );
}
