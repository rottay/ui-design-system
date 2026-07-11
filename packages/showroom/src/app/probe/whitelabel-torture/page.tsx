'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Stack,
  Text,
  Button,
  Badge,
  Input,
  Card,
  Table,
  Toast,
  FieldFiltersPanel,
  type FieldFilterDefinition,
  type FieldFilterPreset,
  type FieldFilterVisual,
} from '@rottay/design-system';
import { TagIcon } from '@rottay/design-system/icons';
import { StateGallery, FLAGSHIP_SLUGS } from '@/components/state-gallery';
import {
  TortureSurface,
  TORTURE_FIXTURES,
  type TortureFixture,
  type ProbeEngine,
} from '@/components/torture-surface';

// ---------------------------------------------------------------------------
// Whitelabel torture probe (WO-GAT-03 hostile-tenant whitelabel proof)
//
// Chrome-free capture route so a screenshot is pure component evidence. One
// fixture per load -- tenant, theme, and text direction are all html-anchored
// (see components/torture-surface), so there is no side-by-side comparison,
// only repeat loads driven by query params:
//   ?fixture=torture-dark|torture-light|rottay|bithire|evnto|themanagementmiami
//                                                 which fixture owns the page (default torture-dark)
//   ?engine=modern|rustic|classic                which engine renders (default modern)
//   ?rtl=1                                       Arabic locale + RTL proof block
//   ?slug=button                                 capture a single flagship in isolation
//   ?w=360|768|1280                              fixed content width for the responsive law
//
// torture-dark and torture-light compile their CSS at render via the dynamic
// tenant path and are never registered as product tenants or build artifacts.
// ?fixture=rottay is the REFERENCE load the differential probe compares
// against, and it stays structurally identical to the torture loads (same
// provider, same layout, same slugs) so any visual delta is attributable to
// the tenant alone. ?fixture=bithire and ?fixture=themanagementmiami render
// the bithire vertical's two real tenants for sighted side-by-side review
// (WO-ENG-20) using this same flagship set and capture width, not the
// differential violation count.
// ---------------------------------------------------------------------------

const CAPTURE_WIDTHS: Record<string, number> = {
  '360': 360,
  '768': 768,
  '1280': 1280,
};

// Real Arabic strings used to prove RTL mirroring and overflow handling.
// long label -> Button content + Badge content (neither has its own named field)
// long value -> Input defaultValue
// long title -> Card title
const ARABIC_LONG_LABEL = 'إدارة المستأجرين والأذونات على مستوى المنصة بالكامل';
const ARABIC_LONG_VALUE = 'قيمة طويلة جدًا للتحقق من عدم اقتطاع النص في الواجهة العربية';
const ARABIC_LONG_TITLE = 'لوحة تحكم المشرف العام لإدارة الحسابات';

const EXTRAS_ROWS = [{ key: 'op-14', name: 'Operations', owner: 'Daniel' }];
const EXTRAS_COLUMNS = [
  { key: 'name', title: 'Workspace', dataIndex: 'name' },
  { key: 'owner', title: 'Owner', dataIndex: 'owner' },
];

// Fixed three-row set for the Table interaction-state probe. Row `r2` is
// pre-selected (below), so it sits at body-row index 1.
const TABLE_STATE_ROWS = [
  { key: 'r1', name: 'Alpha', owner: 'Ana' },
  { key: 'r2', name: 'Bravo', owner: 'Ben' },
  { key: 'r3', name: 'Charlie', owner: 'Cara' },
];
const TABLE_STATE_COLUMNS = [
  { key: 'name', title: 'Name', dataIndex: 'name', sorter: true },
  { key: 'owner', title: 'Owner', dataIndex: 'owner' },
];

// Fixed filter set for the FieldFiltersPanel data-part probe (WO-ARC-09
// checkpoint 2). Covers every branch the panel renders: `status` is a
// `select` with 7 options (crosses the >6 threshold into the searchable
// branch), `region` is an `enum` with 3, `joinedAt` is a `date-range`, and
// `owner` falls through to the free-text Input branch. `status` carries the
// one active value in FIELD_FILTERS_VALUES, so it also exercises the
// non-placeholder Select and the primary-tone InlineSignal.
const FIELD_FILTERS_DEFINITIONS: FieldFilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'archived', label: 'Archived' },
      { value: 'draft', label: 'Draft' },
      { value: 'review', label: 'In review' },
      { value: 'expired', label: 'Expired' },
    ],
  },
  {
    key: 'region',
    label: 'Region',
    type: 'enum',
    placeholder: 'All regions',
    options: [
      { value: 'emea', label: 'EMEA' },
      { value: 'amer', label: 'AMER' },
      { value: 'apac', label: 'APAC' },
    ],
  },
  {
    key: 'joinedAt',
    label: 'Joined',
    type: 'date-range',
    placeholder: 'Any time',
    options: [
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: '90d', label: 'Last 90 days' },
    ],
  },
  {
    key: 'owner',
    label: 'Owner',
    type: 'multi-select',
    placeholder: 'Search owner',
  },
];

const FIELD_FILTERS_PRESETS: FieldFilterPreset[] = [
  { key: 'active-emea', label: 'Active in EMEA', values: { status: 'active', region: 'emea' } },
  { key: 'new-joins', label: 'New joins', values: { joinedAt: '30d', status: 'active' } },
];

const FIELD_FILTERS_VALUES: Record<string, string> = {
  status: 'active',
  region: '',
  joinedAt: '',
  owner: '',
};

const FIELD_FILTERS_VISUALS: Record<string, FieldFilterVisual> = {
  status: { icon: <TagIcon style={{ width: 15, height: 15 }} />, description: 'Filter by lifecycle status.' },
};

// Chrome the WO-ENG-02 flagship galleries never reach, rendered so the probe
// can prove those tenant channels too:
//   - Badge via `content` (its standalone branch). The gallery's
//     `<Badge>{label}</Badge>` form takes Badge's hidden-badge branch and paints
//     no chrome at all, so it cannot answer "does the badge follow the tenant?".
//   - Table with `bordered`, the only mode in which the primitive paints
//     --ds-table-border on its root and header cells.
//   - Card with `variant="outlined"`, the only variant whose border-width is
//     non-zero and therefore the only one where --ds-card-border is observable.
function ChromeExtras() {
  return (
    <Stack spacing="md" fullWidth>
      {/* Boxed so the stack's stretch alignment cannot widen the badge past its
          intrinsic size — a full-bleed badge would misread as a broken capture. */}
      {/* Explicitly solid: the derivation probe asserts this background equals
          the tenant's primary. The soft default paints a 10% tint of it, which
          is a different assertion and would silence this one. */}
      <Box>
        <Badge variant="primary" badgeStyle="solid" content="Beta" />
      </Box>
      <Table rowKey="key" bordered pagination={false} dataSource={EXTRAS_ROWS} columns={EXTRAS_COLUMNS} />
      <Card variant="outlined" title="Outlined" style={{ width: 240 }} />
      {/* duration=0 keeps this mounted for the probe read; the default variant
          is the only one with no --ds-toast-* channel of its own (WO-ENG-21). */}
      <Toast variant="default" title="Default" description="Neutral toast surface" duration={0} />
    </Stack>
  );
}


// A clickable Card, rendered only behind `?interactive=1`.
//
// The flagship gallery's cards are `hoverable`, never `clickable`, so no capture
// in this probe can see a Card's focus ring -- and WO-ARC-07's Card skin is about
// to key that ring on `[data-state~='focus-visible']`. This section exists to be
// photographed by `e2e/visual/states.spec.ts` and by nothing else: the 48 visual
// baselines are captured without the flag, so they cannot move.
function InteractiveCards() {
  return (
    <Box
      data-testid="probe-interactive"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Card variant="elevated" clickable onClick={() => undefined} title="Clickable" style={{ width: 240 }} />
    </Box>
  );
}

// A Table with a pre-selected row and a sortable header, rendered only behind
// `?tablestates=1` so no flagship capture sees it. WO-ARC-09 checkpoint 1 moves
// the Table's row-hover, selected-row and sortable-header paint out of inline
// style (imperative `el.style.background` writes in the modern engine, a
// `hoveredRow` React-state conditional object in rustic) into the unlayered
// table skin. `states.spec.ts` pins those states here: the six flagship table
// baselines photograph the table at rest, so they cannot certify a hover or a
// selection that the migration must reproduce byte for byte.
function TableStates() {
  return (
    <Box
      data-testid="probe-table-states"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Table
        rowKey="key"
        pagination={false}
        rowSelection={{ type: 'checkbox', defaultSelectedRowKeys: ['r2'] }}
        dataSource={TABLE_STATE_ROWS}
        columns={TABLE_STATE_COLUMNS}
      />
    </Box>
  );
}

// A FieldFiltersPanel with every filter branch, a preset pair, and one
// active value, rendered only behind `?fieldfilters=1` so no flagship
// capture sees it. WO-ARC-09 checkpoint 2 moves this panel's paint out of
// inline `style={}` objects into the unlayered field-filters-panel skin,
// keyed on the `data-part` attributes the pre-step stamps. This section is
// what `field-filters.spec.ts` photographs and reads computed styles from.
function FieldFiltersStates() {
  return (
    <Box
      data-testid="probe-field-filters"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <FieldFiltersPanel
        filters={FIELD_FILTERS_DEFINITIONS}
        presets={FIELD_FILTERS_PRESETS}
        values={FIELD_FILTERS_VALUES}
        onChange={() => undefined}
        filterVisuals={FIELD_FILTERS_VISUALS}
      />
    </Box>
  );
}

function sanitizeFixture(raw: string | null): TortureFixture {
  return raw && (TORTURE_FIXTURES as string[]).includes(raw) ? (raw as TortureFixture) : 'torture-dark';
}

function TortureContent() {
  const searchParams = useSearchParams();

  const fixture = useMemo(() => sanitizeFixture(searchParams.get('fixture')), [searchParams]);
  const rtl = useMemo(() => searchParams.get('rtl') === '1', [searchParams]);
  const interactive = useMemo(() => searchParams.get('interactive') === '1', [searchParams]);
  const tableStates = useMemo(() => searchParams.get('tablestates') === '1', [searchParams]);
  const fieldFilters = useMemo(() => searchParams.get('fieldfilters') === '1', [searchParams]);

  // WO-ENG-11 compares engines on an otherwise identical surface.
  const engine = useMemo<ProbeEngine>(() => {
    const raw = searchParams.get('engine');
    return raw === 'rustic' || raw === 'classic' ? raw : 'modern';
  }, [searchParams]);

  const contentWidth = useMemo(() => {
    const raw = searchParams.get('w');
    return raw && CAPTURE_WIDTHS[raw] ? CAPTURE_WIDTHS[raw] : undefined;
  }, [searchParams]);

  const slugs = useMemo(() => {
    const only = searchParams.get('slug');
    return only && FLAGSHIP_SLUGS.includes(only) ? [only] : FLAGSHIP_SLUGS;
  }, [searchParams]);

  return (
    <TortureSurface fixture={fixture} rtl={rtl} engine={engine}>
      <Box
        data-testid="probe-ground"
        style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}
      >
        <Box style={{ maxWidth: contentWidth ?? 1360, margin: '0 auto' }}>
          <Stack spacing="lg" fullWidth>
            <Box>
              <Text
                as={'h1' as never}
                size="lg"
                weight="bold"
                style={{ display: 'block', color: 'var(--ds-color-text-primary)' }}
              >
                Whitelabel torture — {fixture}
              </Text>
              <Text size="sm" style={{ display: 'block', marginTop: 4, color: 'var(--ds-color-text-secondary)' }}>
                Hostile-tenant proof: every color, font, and radius below derives from the {fixture} fixture, never
                hardcoded. Load ?fixture=rottay for the reference comparison.
              </Text>
            </Box>

            {interactive && <InteractiveCards />}

            {tableStates && <TableStates />}

            {fieldFilters && <FieldFiltersStates />}

            <Box
              data-testid="probe-extras"
              style={{
                borderRadius: 16,
                border: '1px solid var(--ds-color-border)',
                background: 'var(--ds-color-bg-elevated)',
                padding: 16,
              }}
            >
              <ChromeExtras />
            </Box>

            {rtl && (
              <Box
                data-testid="probe-rtl"
                style={{
                  maxWidth: 480,
                  borderRadius: 16,
                  border: '1px solid var(--ds-color-border)',
                  background: 'var(--ds-color-bg-elevated)',
                  padding: 16,
                }}
              >
                <Stack spacing="md" fullWidth>
                  <Button variant="primary">{ARABIC_LONG_LABEL}</Button>
                  <Box>
                    <Badge variant="primary" content={ARABIC_LONG_LABEL} />
                  </Box>
                  <Input defaultValue={ARABIC_LONG_VALUE} />
                  <Card title={ARABIC_LONG_TITLE} />
                </Stack>
              </Box>
            )}

            {slugs.map((slug) => (
              <Stack key={slug} spacing="sm">
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ display: 'block', color: 'var(--ds-color-text-secondary)', textTransform: 'capitalize' }}
                >
                  {slug}
                </Text>
                <Box
                  data-testid={`probe-${slug}`}
                  style={{
                    borderRadius: 16,
                    border: '1px solid var(--ds-color-border)',
                    background: 'var(--ds-color-bg-elevated)',
                    padding: 16,
                  }}
                >
                  <StateGallery slug={slug} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </TortureSurface>
  );
}

export default function WhitelabelTorturePage() {
  return (
    <Suspense fallback={null}>
      <TortureContent />
    </Suspense>
  );
}
