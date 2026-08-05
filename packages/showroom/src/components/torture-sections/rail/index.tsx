'use client';

import { Box, Stack, Text, SelectionPreviewRail, type SelectionPreviewRailColumn } from '@rottay/design-system';

// Fixed fixtures for the SelectionPreviewRail data-part probe (WO-ARC-09
// checkpoint 4). One row carries a subtitle-eligible `email` field and a
// column set that exercises all three `renderFallbackValue` branches
// (`role` a plain string, `verified` a boolean, `notes` null); the other
// row omits `email`/`slug`/`description` entirely so the rail's subtitle
// is provably optional. Rendered only behind `?rail=1` so no flagship
// capture sees it.
interface RailFixtureRow {
  id: string;
  fullName: string;
  email?: string;
  statusLabel: string;
  role: string;
  verified: boolean;
  notes: string | null;
}

const RAIL_ROW_WITH_SUBTITLE: RailFixtureRow = {
  id: 'rail-1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  statusLabel: 'Active',
  role: 'Engineer',
  verified: true,
  notes: null,
};

const RAIL_ROW_WITHOUT_SUBTITLE: RailFixtureRow = {
  id: 'rail-2',
  fullName: 'Grace Hopper',
  statusLabel: 'Invited',
  role: 'Researcher',
  verified: false,
  notes: null,
};

const RAIL_COLUMNS: SelectionPreviewRailColumn<RailFixtureRow>[] = [
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'verified', title: 'Verified', dataIndex: 'verified' },
  { key: 'notes', title: 'Notes', dataIndex: 'notes' },
];

// A SelectionPreviewRail probe with three instances, rendered only behind
// `?rail=1` so no flagship capture sees it. WO-ARC-09 checkpoint 4 moves
// this rail's paint out of inline `style={}` objects into the unlayered
// selection-preview-rail skin, keyed on the `data-part`/`data-preview`
// attributes and the `.ds-selection-preview-rail__close` className the
// pre-step stamps. The committed container-axis `rail` baseline
// (state-gallery responsive-specs) only ever exercises the default branch
// with no subtitle, no match reason, and non-empty string columns -- this
// section is what `selection-preview-rail.spec.ts` photographs to cover
// what that baseline cannot: the customPreview branch and close button, a
// subtitle, a match-reason panel, and the boolean/empty
// renderFallbackValue paths.
export function RailStates() {
  return (
    <Box
      data-testid="probe-rail"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="md" fullWidth>
        <SelectionPreviewRail
          item={RAIL_ROW_WITH_SUBTITLE}
          itemKey={RAIL_ROW_WITH_SUBTITLE.id}
          itemIndex={0}
          columns={RAIL_COLUMNS}
          onClose={() => undefined}
          getMatchReason={() => 'Current search, scope, or filters matched this record.'}
          mode="selection"
        />
        <SelectionPreviewRail
          item={RAIL_ROW_WITHOUT_SUBTITLE}
          itemKey={RAIL_ROW_WITHOUT_SUBTITLE.id}
          itemIndex={1}
          columns={RAIL_COLUMNS}
          onClose={() => undefined}
          mode="click"
        />
        <SelectionPreviewRail
          item={RAIL_ROW_WITH_SUBTITLE}
          itemKey={RAIL_ROW_WITH_SUBTITLE.id}
          itemIndex={0}
          columns={RAIL_COLUMNS}
          onClose={() => undefined}
          mode="selection"
          preview={{
            render: (item) => (
              <Stack spacing="xs">
                <Text size="sm" weight="semibold">
                  {item.fullName}
                </Text>
                <Text size="xs" color="secondary">
                  Custom preview content
                </Text>
              </Stack>
            ),
          }}
        />
      </Stack>
    </Box>
  );
}
