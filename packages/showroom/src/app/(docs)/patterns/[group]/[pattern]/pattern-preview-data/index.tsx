'use client';

import { useState } from 'react';
import {
  Box,
  BulkSelectToggle,
  Card,
  Flex,
  MonoStat,
  PatternColumnSettings,
  PatternDecisionComparison,
  PatternGalleryView,
  PatternGridView,
  PatternListToolbar,
  PatternRecordFacts,
  PatternSavedViewsBar,
  Stack,
  StatusFilterPills,
  Text,
  WidgetBoard,
  type DecisionComparisonSubject,
  type RecordFact,
  type WidgetBoardItem,
} from '@rottay/design-system';
import { createThumbnail } from '../pattern-preview-shared';

type ViewMode = 'table' | 'cards';

type GalleryAsset = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

const GALLERY_ITEMS: GalleryAsset[] = [
  {
    id: 'asset-1',
    title: 'Main Hall',
    subtitle: 'Venue layout',
    image: createThumbnail('Main Hall', '#1d4ed8'),
  },
  {
    id: 'asset-2',
    title: 'VIP Deck',
    subtitle: 'Premium access',
    image: createThumbnail('VIP Deck', '#0f766e'),
  },
  {
    id: 'asset-3',
    title: 'Night Stage',
    subtitle: 'Festival lighting',
    image: createThumbnail('Night Stage', '#7c3aed'),
  },
];

const SAVED_VIEWS: any[] = [
  {
    id: 'all',
    name: 'All records',
    isDefault: true,
    config: { layout: 'table' },
  },
  {
    id: 'ops',
    name: 'Ops review',
    config: { filters: { status: 'active' }, layout: 'table' },
  },
  {
    id: 'board',
    name: 'Board',
    config: { layout: 'board', groupBy: 'status' },
  },
];

export function SavedViewsPreview() {
  const [views, setViews] = useState<any[]>(SAVED_VIEWS);
  const [activeViewId, setActiveViewId] = useState('all');

  return (
    <Box style={{ width: '100%', maxWidth: 740 }}>
      <PatternSavedViewsBar
        views={views}
        activeViewId={activeViewId}
        onViewSelect={setActiveViewId}
        onViewSave={(view) => {
          setViews((current) =>
            current.map((item) => (item.id === view.id ? view : item)),
          );
        }}
        onViewDelete={(viewId) => {
          setViews((current) => current.filter((item) => item.id !== viewId));
          if (viewId === activeViewId) {
            setActiveViewId('all');
          }
        }}
        onViewRename={(viewId, name) => {
          setViews((current) =>
            current.map((item) => (item.id === viewId ? { ...item, name } : item)),
          );
        }}
        onViewCreate={(view) => {
          const nextView = { ...view, id: `view-${Date.now()}` };
          setViews((current) => [...current, nextView]);
          setActiveViewId(nextView.id);
        }}
        onViewDuplicate={(viewId) => {
          const original = views.find((item) => item.id === viewId);
          if (!original) {
            return;
          }

          const copy = {
            ...original,
            id: `view-${Date.now()}`,
            name: `${original.name} copy`,
            isDefault: false,
          };
          setViews((current) => [...current, copy]);
        }}
        onViewReorder={(ids) => {
          const reordered = ids
            .map((id) => views.find((item) => item.id === id))
            .filter(Boolean) as any[];
          setViews(reordered);
        }}
        allowCreate
        allowDelete
        allowRename
      />
    </Box>
  );
}

export function ColumnSettingsPreview() {
  const [visibleColumns, setVisibleColumns] = useState(['name', 'status', 'owner', 'updatedAt']);
  const [columnOrder, setColumnOrder] = useState(['name', 'status', 'owner', 'updatedAt']);
  const [pinnedColumns, setPinnedColumns] = useState<{ left: string[]; right: string[] }>({
    left: ['name'],
    right: [],
  });

  const allColumns = [
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
    { key: 'owner', header: 'Owner' },
    { key: 'updatedAt', header: 'Updated' },
  ];

  return (
    <Box style={{ width: '100%', maxWidth: 520 }}>
      <PatternColumnSettings
        allColumns={allColumns}
        visibleColumns={visibleColumns}
        lockedColumns={['name']}
        columnOrder={columnOrder}
        pinnedColumns={pinnedColumns}
        onToggleVisibility={(key) => {
          setVisibleColumns((current) =>
            current.includes(key)
              ? current.filter((item) => item !== key)
              : [...current, key],
          );
        }}
        onReorder={setColumnOrder}
        onTogglePin={(key, side) => {
          setPinnedColumns((current) => ({
            left:
              side === 'left'
                ? Array.from(new Set([...current.left.filter((item) => item !== key), key]))
                : current.left.filter((item) => item !== key),
            right:
              side === 'right'
                ? Array.from(new Set([...current.right.filter((item) => item !== key), key]))
                : current.right.filter((item) => item !== key),
          }));
        }}
        onReset={() => {
          setVisibleColumns(['name', 'status', 'owner', 'updatedAt']);
          setColumnOrder(['name', 'status', 'owner', 'updatedAt']);
          setPinnedColumns({ left: ['name'], right: [] });
        }}
      />
    </Box>
  );
}

export function ListToolbarPreview() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [filters, setFilters] = useState<Record<string, unknown>>({
    status: 'active',
    team: 'ops',
  });

  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternListToolbar
        title="Members"
        totalCount={128}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search members"
        filterPills={[
          {
            key: 'status',
            label: 'Status',
            value: String(filters.status ?? 'active'),
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Paused', value: 'paused' },
            ],
          },
          {
            key: 'team',
            label: 'Team',
            value: String(filters.team ?? 'ops'),
            options: [
              { label: 'Ops', value: 'ops' },
              { label: 'Growth', value: 'growth' },
            ],
          },
        ]}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onClearFilters={() => setFilters({})}
        activeFilterCount={Object.keys(filters).length}
        viewMode={viewMode === 'table' ? 'list' : 'cards'}
        onViewModeChange={(mode) => setViewMode(mode === 'list' ? 'table' : 'cards')}
        density={density}
        onDensityChange={setDensity}
        primaryAction={{ label: 'Invite member', onClick: () => undefined }}
        onExport={() => undefined}
      />
    </Box>
  );
}

export function BulkSelectPreview() {
  const [active, setActive] = useState(true);

  return (
    <BulkSelectToggle
      active={active}
      onToggle={() => setActive((current) => !current)}
      selectedCount={3}
    />
  );
}

export function StatusFilterPillsPreview() {
  const [value, setValue] = useState('active');

  return (
    <StatusFilterPills
      options={[
        { value: 'active', label: 'Active', count: 24 },
        { value: 'review', label: 'Review', count: 6 },
        { value: 'paused', label: 'Paused', count: 3 },
      ]}
      value={value}
      onChange={setValue}
      showCounts
    />
  );
}

export function GridViewPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 920 }}>
      <PatternGridView<GalleryAsset>
        data={GALLERY_ITEMS}
        rowKey="id"
        renderCard={(item) => (
          <Card style={{ boxShadow: 'none' }}>
            <Card.Body>
              <Stack spacing="sm">
                <Box
                  style={{
                    aspectRatio: '4 / 3',
                    borderRadius: 14,
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <Text size="sm" weight="semibold">
                  {item.title}
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  {item.subtitle}
                </Text>
              </Stack>
            </Card.Body>
          </Card>
        )}
      />
    </Box>
  );
}

export function GalleryViewPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 920 }}>
      <PatternGalleryView<GalleryAsset>
        data={GALLERY_ITEMS}
        rowKey="id"
        imageField="image"
        captionField="title"
        aspectRatio="4/3"
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Decision, record and board patterns
// ---------------------------------------------------------------------------

const DECISION_SUBJECTS: DecisionComparisonSubject[] = [
  {
    key: 'moreau',
    title: 'Alice Moreau',
    subtitle: 'Programme lead — currently covering two venues through the summer season',
    score: '86',
    scoreLabel: 'Weighted against the operations rubric, band 6',
    leading: true,
    facts: [
      { key: 'availability', label: 'Weekend availability', value: '38 of 42 dates', tone: 'positive' },
      { key: 'venues', label: 'Venues managed', value: '2 (Lisbon, Porto)', tone: 'neutral' },
      { key: 'notice', label: 'Notice period', value: '8 weeks', tone: 'warning' },
      {
        key: 'compensation',
        label: 'Compensation band',
        value: 'Band 6 + on-call',
        tone: 'neutral',
        supporting: 'Approved without conditions',
      },
    ],
  },
  {
    key: 'okonkwo',
    title: 'Daniel Okonkwo',
    subtitle: 'Operations lead, single-site — deputising on the northern rotation',
    score: '81',
    scoreLabel: 'Weighted against the operations rubric, band 5',
    facts: [
      { key: 'availability', label: 'Weekend availability', value: '41 of 42 dates', tone: 'positive' },
      { key: 'venues', label: 'Venues managed', value: '1 (Madrid)', tone: 'neutral' },
      { key: 'notice', label: 'Notice period', value: '4 weeks', tone: 'positive' },
      { key: 'compensation', label: 'Compensation band', value: 'Band 5', tone: 'neutral' },
    ],
  },
];

const RECORD_FACTS: RecordFact[] = [
  {
    key: 'inspection',
    label: 'Rigging inspection window and safety-officer sign-off',
    value: '12 July 2026',
    span: 4,
    supporting: 'Rebooked once',
  },
  { key: 'covers', label: 'Confirmed covers', value: '240', span: 4 },
  { key: 'owner', label: 'Programme owner', value: 'Ana Ruiz', span: 4, emphasis: 'strong' },
];

export function DecisionComparisonPreview() {
  return (
    <PatternDecisionComparison
      subjects={DECISION_SUBJECTS}
      context="Panel debrief — REQ-4821"
      contextMeta="Operations rubric v4"
      ariaLabel="Candidate comparison"
      density="comfortable"
    />
  );
}

export function RecordFactsPreview() {
  return (
    <PatternRecordFacts
      title="Sala Norte — July roster"
      description="What this section covers: the operational facts a venue lead needs before publishing the July roster, including the outstanding safety sign-off."
      facts={RECORD_FACTS}
    />
  );
}

export function MonoStatPreview() {
  return (
    <Flex gap={48} wrap="wrap">
      <MonoStat value={9} label="domain modules" />
      <MonoStat value={601} label="use cases documented" />
      <MonoStat value={253} label="catalogued components" />
    </Flex>
  );
}

const WIDGET_LABELS = {
  context: 'Workspace signals',
  heading: 'Your widgets',
  customize: 'Customize',
  done: 'Done',
  addWidget: 'Add widget',
  reset: 'Reset',
  emptyCatalog: 'No more widgets available',
  editHint: 'Drag to reorder, resize from the edges',
  readHint: 'Switch to customize mode to edit',
  move: 'Move',
  resize: 'Resize',
  remove: 'Remove',
  catalogHeading: 'Add a widget',
  catalogDescription: 'Pick the signals you want on this board',
  recommended: 'Recommended',
};

function buildWidgetBoardItems(): WidgetBoardItem[] {
  return [
    {
      id: 'w-throughput',
      accessibleTitle: 'Throughput by stage',
      title: 'Throughput by stage',
      header: { eyebrow: 'THROUGHPUT' },
      catalog: { description: 'Stage distribution for open work', category: 'Operations' },
      content: (
        <Stack spacing={8}>
          {[62, 38, 21].map((percent) => (
            <Box
              key={percent}
              style={{
                height: 8,
                borderRadius: 999,
                background: 'var(--ds-color-bg-secondary)',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  background: 'var(--ds-color-primary)',
                }}
              />
            </Box>
          ))}
        </Stack>
      ),
      size: 'wide',
      order: 0,
      visible: true,
    },
    {
      id: 'w-average',
      accessibleTitle: 'Average review time',
      title: 'Average review time',
      header: { eyebrow: 'QUALITY' },
      catalog: { description: 'Mean time to a decision', category: 'Quality', recommended: true },
      content: (
        <Stack spacing={4}>
          <Text size="xl" weight="bold">
            2.4 days
          </Text>
          <Text size="xs" color="muted">
            Down from 3.1 last quarter
          </Text>
        </Stack>
      ),
      size: 'sm',
      order: 1,
      visible: true,
    },
    {
      id: 'w-queue',
      accessibleTitle: 'Queue depth',
      title: 'Queue depth',
      header: { eyebrow: 'QUEUE' },
      catalog: { description: 'Items awaiting a first pass', category: 'Operations' },
      content: (
        <Stack spacing={4}>
          <Text size="xl" weight="bold">
            18
          </Text>
          <Text size="xs" color="muted">
            4 older than the target window
          </Text>
        </Stack>
      ),
      size: 'sm',
      order: 2,
      visible: true,
    },
  ];
}

export function WidgetBoardPreview() {
  const [items, setItems] = useState<WidgetBoardItem[]>(() => buildWidgetBoardItems());

  return (
    <WidgetBoard
      items={items}
      labels={WIDGET_LABELS}
      editable
      onItemsChange={setItems}
      onReset={buildWidgetBoardItems}
    />
  );
}
