'use client';

import {
  ActiveFiltersBar,
  Box,
  ColumnMenu,
  ExportButton,
  PatternListToolbar,
  PatternSavedViewsBar,
  SavedViewsMenu,
  ScopeSwitcher,
  SearchCommandBar,
  Stack,
  StatusFilterPills,
  TableToolbar,
  ViewModeSwitcher,
} from '@rottay/design-system';
import type { FilterPillConfig } from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

// ---------------------------------------------------------------------------
// WO-SKIN-06 CK-C -- the workspace-chrome family torture section
// (?workspace=1). 11 components: list-toolbar (modern only -- rustic
// re-exports classic), saved-views (both engines), status-filter-pills, and
// the 8 structures/workspace components. column-menu/saved-views-menu/
// export-button portal their panels to document.body -- rendered `open` here
// so the panel content (and its standalone scope class) shows up in the
// screenshot even though it is not a DOM descendant of this band.
// ---------------------------------------------------------------------------

const WC_FILTER_PILLS: FilterPillConfig[] = [
  {
    key: 'status',
    label: 'Status',
    value: 'active',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'all', label: 'All' },
    ],
  },
  {
    key: 'owner',
    label: 'Owner',
    value: '',
    options: [{ value: '', label: 'Anyone' }],
  },
];

export function WorkspaceChromeFbStates() {
  return (
    <Box
      data-testid="probe-workspace"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Stack spacing="lg" fullWidth>
        <Stack spacing="xs" data-testid="probe-workspace-list-toolbar">
          <PatternListToolbar
            title="Candidates"
            totalCount={42}
            search=""
            onSearchChange={() => undefined}
            filterPills={WC_FILTER_PILLS}
            activeFilters={{ status: 'active' }}
            activeFilterCount={1}
            viewMode="list"
            onViewModeChange={() => undefined}
            density="comfortable"
            onDensityChange={() => undefined}
            onExport={() => undefined}
            onFilterChange={() => undefined}
            onClearFilters={() => undefined}
            primaryAction={{ label: 'New candidate', onClick: () => undefined }}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-saved-views">
          <PatternSavedViewsBar
            views={[
              { id: 'v1', name: 'My tasks', isDefault: true, config: {} },
              { id: 'v2', name: 'All open', config: {} },
            ]}
            activeViewId="v1"
            onViewSelect={() => undefined}
            onViewSave={() => undefined}
            onViewDelete={() => undefined}
            onViewRename={() => undefined}
            onViewCreate={() => undefined}
            onViewDuplicate={() => undefined}
            allowCreate
            allowDelete
            allowRename
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-status-filter-pills">
          <StatusFilterPills
            options={[
              { value: 'open', label: 'Open', count: 4 },
              { value: 'closed', label: 'Closed', count: 1 },
            ]}
            value="open"
            onChange={() => undefined}
            showCounts
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-column-menu">
          <ColumnMenu
            columns={[
              { key: 'name', title: 'Name' },
              { key: 'email', title: 'Email' },
            ]}
            visibleColumns={['name']}
            onColumnsChange={() => undefined}
            onReset={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-saved-views-menu">
          <SavedViewsMenu
            views={[
              {
                key: 'sys-1',
                label: 'All',
                kind: 'system',
                isSystem: true,
                isDefault: true,
                state: {},
              },
              {
                key: 'custom-1',
                label: 'Mine',
                kind: 'custom',
                state: { query: 'x' },
              },
            ]}
            activeViewKey="sys-1"
            onViewSelect={() => undefined}
            onViewDelete={() => undefined}
            onViewSave={() => undefined}
            onSaveCurrentView={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-export-button">
          <ExportButton data={[{ a: 1 }]} columns={[{ key: 'a', header: 'A' }]} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-active-filters-bar">
          <ActiveFiltersBar
            activeFilters={[
              {
                key: 'status',
                label: 'Status',
                value: 'active',
                displayValue: 'Active',
              },
            ]}
            onRemoveFilter={() => undefined}
            onClearAll={() => undefined}
            onAddFilter={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-scope-switcher">
          <ScopeSwitcher
            scopes={[
              { key: 'all', label: 'All', count: 12 },
              { key: 'mine', label: 'Mine', count: 3 },
            ]}
            activeScope="all"
            onScopeChange={() => undefined}
            variant="inline"
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-view-mode-switcher">
          <ViewModeSwitcher
            modes={[
              { key: 'table', icon: <Icon name="data.table" decorative />, label: 'Table' },
              {
                key: 'cards',
                icon: <Icon name="layout.cards" decorative />,
                label: 'Cards',
                disabled: true,
              },
            ]}
            value="table"
            onChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-table-toolbar">
          <TableToolbar
            search=""
            onSearchChange={() => undefined}
            primaryAction={{ label: 'New', onClick: () => undefined }}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-workspace-search-command-bar">
          <SearchCommandBar
            command={{
              placeholder: 'Search...',
              value: '',
              onSearch: () => undefined,
              hint: 'Try a name or ID',
            }}
            surfaceVariant="embedded"
            layoutVariant="editorial-tech"
          />
        </Stack>
      </Stack>
    </Box>
  );
}
