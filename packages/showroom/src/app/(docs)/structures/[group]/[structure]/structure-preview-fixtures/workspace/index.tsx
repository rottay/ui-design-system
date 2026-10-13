'use client';

import { useState } from 'react';
import {
  ActiveFiltersBar,
  ActionDock,
  Badge,
  Box,
  Button,
  ColumnMenu,
  CommandRegistryProvider,
  ConnectedCommandPalette,
  ExportButton,
  FieldFiltersPanel,
  Flex,
  SavedViewsMenu,
  ScopeSwitcher,
  SearchCommandBar,
  SelectionPreviewRail,
  Stack,
  TableToolbar,
  Text,
  ViewModeSwitcher,
  useRegisterCommands,
  type SavedViewsMenuEntry,
  type SearchCommandSuggestion,
} from '@rottay/design-system';

import {
  CommunicationMessageIcon,
  ContentDocumentIcon,
  SecurityProtectionIcon,
  noop,
} from '../foundation';
import {
  WORKSPACE_ROWS,
  WORKSPACE_COLUMNS,
  EXPORT_COLUMNS,
  ACTIVE_FILTERS,
  FIELD_FILTERS,
  FIELD_FILTER_PRESETS,
  FIELD_FILTER_VISUALS,
  VIEW_MODES,
  SCOPES,
  SAVED_VIEWS,
  SEARCH_COMMANDS,
  PREVIEW_RAIL_COLUMNS,
} from './data';

function SearchCommandBarPreview() {
  const [query, setQuery] = useState('inactive seats');

  const suggestions: SearchCommandSuggestion[] = [
    {
      key: 'flagged',
      label: 'Flagged this week',
      query: 'flagged:week',
      onSelect: () => setQuery('flagged:week'),
    },
    {
      key: 'emea',
      label: 'EMEA owners',
      query: 'region:emea owner:*',
      onSelect: () => setQuery('region:emea owner:*'),
    },
    {
      key: 'reviewers',
      label: 'Needs reviewer',
      query: 'reviewer:none',
      onSelect: () => setQuery('reviewer:none'),
    },
  ];

  return (
    <SearchCommandBar
      command={{
        placeholder: 'Search workspaces, people, and commands',
        value: query,
        onSearch: setQuery,
        hint: 'Press / to focus or Cmd+K for actions',
        suggestions,
        recentQueries: suggestions,
      }}
      commands={SEARCH_COMMANDS}
      topRailSlot={
        <Text
          size="xs"
          style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
        >
          Unified command and search rail for the active workspace slice.
        </Text>
      }
      actionsSlot={
        <Flex gap={8} wrap="wrap" align="center">
          <Badge variant="secondary" size="sm">
            3 scopes
          </Badge>
          <Button size="sm" variant="ghost" onClick={noop}>
            New view
          </Button>
        </Flex>
      }
      surfaceVariant="embedded"
      layoutVariant="editorial-tech"
    />
  );
}

function TableToolbarPreview() {
  const [search, setSearch] = useState('alice');
  const [isFiltered, setIsFiltered] = useState(true);

  return (
    <TableToolbar
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search members"
      isFiltered={isFiltered}
      onResetFilters={() => setIsFiltered(false)}
      leftContent={
        <Badge variant="secondary" size="sm">
          12 flagged
        </Badge>
      }
      filters={
        <Flex gap={8} wrap="wrap" align="center">
          <Badge variant="secondary" size="sm">
            Status: Active
          </Badge>
          <Badge variant="secondary" size="sm">
            Region: EMEA
          </Badge>
        </Flex>
      }
      actions={
        <Flex gap={8} wrap="wrap" align="center">
          <Button size="sm" variant="ghost" onClick={noop}>
            Columns
          </Button>
          <Button size="sm" variant="ghost" onClick={noop}>
            Export
          </Button>
        </Flex>
      }
      primaryAction={{ label: 'Invite member', onClick: noop }}
    />
  );
}

function ActiveFiltersBarPreview() {
  const [filters, setFilters] = useState(ACTIVE_FILTERS);

  return (
    <ActiveFiltersBar
      activeFilters={filters}
      onRemoveFilter={(filterKey) => {
        setFilters((current) => current.filter((filter) => filter.key !== filterKey));
      }}
      onClearAll={() => setFilters([])}
      onAddFilter={() => {
        setFilters((current) => {
          if (current.some((filter) => filter.key === 'scope')) {
            return current;
          }

          return [
            ...current,
            {
              key: 'scope',
              label: 'Scope',
              value: 'shared',
              displayValue: 'Shared coverage',
              field: 'scope',
            },
          ];
        });
      }}
      surfaceVariant="embedded"
    />
  );
}

function ViewModeSwitcherPreview() {
  const [mode, setMode] = useState<(typeof VIEW_MODES)[number]['key']>('table');

  return (
    <Flex align="center" gap={12} wrap="wrap">
      <ViewModeSwitcher
        modes={VIEW_MODES}
        value={mode}
        onChange={(nextMode) => setMode(nextMode)}
        size="sm"
      />
      <Text
        size="xs"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Active mode: {mode}
      </Text>
    </Flex>
  );
}

function ExportButtonPreview() {
  return (
    <Stack spacing={8}>
      <ExportButton
        data={WORKSPACE_ROWS}
        columns={EXPORT_COLUMNS}
        filename="tenant-access-review"
        formats={['csv', 'json', 'clipboard']}
        size="sm"
      />
      <Text
        size="xs"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Exports 3 workspace rows with 5 mapped columns.
      </Text>
    </Stack>
  );
}

function ColumnMenuPreview() {
  const initialVisible = ['name', 'email', 'role', 'statusLabel', 'owner'];
  const initialOrder = WORKSPACE_COLUMNS.map((column) => column.key);

  const [visibleColumns, setVisibleColumns] = useState(initialVisible);
  const [columnOrder, setColumnOrder] = useState(initialOrder);
  const [visibleActions, setVisibleActions] = useState(['open', 'message']);
  const [pinnedColumns, setPinnedColumns] = useState({ left: ['name'], right: ['statusLabel'] });
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    name: 240,
    email: 260,
    role: 180,
  });

  return (
    <Stack spacing={8}>
      <ColumnMenu
        columns={WORKSPACE_COLUMNS}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onColumnsChange={(nextVisible, nextOrder) => {
          setVisibleColumns(nextVisible);
          setColumnOrder(nextOrder);
        }}
        actions={[
          { key: 'open', title: 'Open record' },
          { key: 'message', title: 'Message owner' },
          { key: 'suspend', title: 'Suspend access', locked: true },
        ]}
        visibleActions={visibleActions}
        onVisibleActionsChange={setVisibleActions}
        onReset={() => {
          setVisibleColumns(initialVisible);
          setColumnOrder(initialOrder);
          setVisibleActions(['open', 'message']);
          setPinnedColumns({ left: ['name'], right: ['statusLabel'] });
          setColumnWidths({ name: 240, email: 260, role: 180 });
        }}
        pinnedColumns={pinnedColumns}
        onPinChange={setPinnedColumns}
        columnWidths={columnWidths}
        onColumnResize={(key, width) => {
          setColumnWidths((current) => ({ ...current, [key]: width }));
        }}
        groups={[
          { key: 'identity', label: 'Identity', columns: ['name', 'email'] },
          { key: 'operations', label: 'Operations', columns: ['role', 'statusLabel', 'owner'] },
          { key: 'coverage', label: 'Coverage', columns: ['region', 'scope', 'usage'] },
        ]}
      />
      <Text
        size="xs"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Visible now: {visibleColumns.join(', ')}
      </Text>
    </Stack>
  );
}

function FieldFiltersPanelPreview() {
  const [values, setValues] = useState<Record<string, string>>({
    status: 'active',
    region: 'emea',
    joinedAt: '30d',
    owner: 'sarah',
  });

  return (
    <FieldFiltersPanel
      filters={FIELD_FILTERS}
      presets={FIELD_FILTER_PRESETS}
      values={values}
      onChange={(filterKey, value) => {
        setValues((current) => ({ ...current, [filterKey]: value }));
      }}
      filterVisuals={FIELD_FILTER_VISUALS}
    />
  );
}

function SavedViewsMenuPreview() {
  const [views, setViews] = useState(SAVED_VIEWS);
  const [activeViewKey, setActiveViewKey] = useState(SAVED_VIEWS[0].key);

  const activeView =
    views.find((view) => view.key === activeViewKey) ??
    views.find((view) => view.isDefault) ??
    views[0];

  return (
    <Stack spacing={8}>
      <SavedViewsMenu
        views={views}
        activeViewKey={activeViewKey}
        onViewSelect={setActiveViewKey}
        onViewDelete={(viewKey) => {
          setViews((current) => current.filter((view) => view.key !== viewKey));
          if (viewKey === activeViewKey) {
            const next = views.find((view) => view.key !== viewKey);
            if (next) {
              setActiveViewKey(next.key);
            }
          }
        }}
        onViewSave={(view) => {
          setViews((current) => [...current, view]);
          setActiveViewKey(view.key);
        }}
        onSaveCurrentView={() => {
          const nextIndex = views.filter((view) => view.kind === 'custom').length + 1;
          const nextView: SavedViewsMenuEntry = {
            key: `custom-${nextIndex}`,
            label: `Ops draft ${nextIndex}`,
            kind: 'custom',
            state: activeView?.state ?? {
              filters: [],
              visibleColumns: initialVisibleColumns(),
            },
          };

          setViews((current) => [...current, nextView]);
          setActiveViewKey(nextView.key);
        }}
      />
      <Text
        size="xs"
        style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}
      >
        Active view: {activeView?.label ?? 'None'}
      </Text>
    </Stack>
  );
}

function ScopeSwitcherPreview() {
  const [activeScope, setActiveScope] = useState('priority');

  return (
    <ScopeSwitcher
      scopes={SCOPES}
      activeScope={activeScope}
      onScopeChange={setActiveScope}
      variant="section"
    />
  );
}

function SelectionPreviewRailPreview() {
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        minHeight: 280,
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-secondary) 88%, transparent), transparent)',
        borderRadius: 18,
      }}
    >
      <SelectionPreviewRail
        item={WORKSPACE_ROWS[0]}
        itemKey={WORKSPACE_ROWS[0].id}
        itemIndex={0}
        columns={PREVIEW_RAIL_COLUMNS}
        visibleColumns={['name', 'email', 'role', 'owner', 'region', 'usage']}
        rowActions={() => [
          {
            key: 'message',
            label: 'Message owner',
            icon: <CommunicationMessageIcon size={14} />,
            onClick: noop,
          },
          {
            key: 'review',
            label: 'Review access',
            icon: <SecurityProtectionIcon size={14} />,
            onClick: noop,
            variant: 'primary',
          },
          {
            key: 'log',
            label: 'Open activity',
            icon: <ContentDocumentIcon size={14} />,
            onClick: noop,
          },
        ]}
        onOpenItem={noop}
        onClose={noop}
        getMatchReason={(item) =>
          `${item.region} coverage match with ${item.statusLabel.toLowerCase()} seat activity.`
        }
        mode="selection"
      />
    </Box>
  );
}

function ActionDockPreview() {
  return (
    <Box
      style={{
        maxWidth: 480,
        padding: 16,
        borderRadius: 16,
        border: '1px solid var(--ds-color-border-secondary)',
        background: 'var(--ds-color-bg-secondary)',
      }}
    >
      <Text size="sm" style={{ display: 'block', marginBottom: 16 }}>
        Review changes before publishing this workspace.
      </Text>
      <ActionDock mode="sticky" style={{ position: 'relative' }}>
        <Button variant="secondary" style={{ flex: 1 }}>Save draft</Button>
        <Button variant="primary" style={{ flex: 1 }}>Publish</Button>
      </ActionDock>
    </Box>
  );
}

function initialVisibleColumns() {
  return ['name', 'email', 'role', 'statusLabel', 'owner'];
}

// ---------------------------------------------------------------------------
// Connected command palette
//
// The palette is registry-backed: it renders nothing at rest and populates
// itself from CommandRegistryProvider. The preview therefore mounts the real
// provider, registers real commands, and opens it by dispatching the same
// mod+K chord the component listens for -- so a regression in that listener
// shows up here as a button that stops working.
// ---------------------------------------------------------------------------

function isMacPlatform() {
  return typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function CommandPaletteCommands() {
  useRegisterCommands([
    { id: 'preview-dashboard', label: 'Open dashboard', category: 'Navigation', action: noop },
    { id: 'preview-approvals', label: 'Review approvals', category: 'Actions', action: noop },
    { id: 'preview-invite', label: 'Invite member', category: 'Actions', shortcut: 'i', action: noop },
  ]);
  return null;
}

function ConnectedCommandPalettePreview() {
  return (
    <CommandRegistryProvider>
      <CommandPaletteCommands />
      <Stack spacing={12}>
        <Text size="sm" style={{ display: 'block', color: 'var(--ds-color-text-secondary)' }}>
          Press Cmd/Ctrl+K to open the palette, or ? for the cheatsheet built
          from every registered command.
        </Text>
        <Flex gap={8}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const mac = isMacPlatform();
              document.dispatchEvent(
                new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: mac,
                  ctrlKey: !mac,
                  bubbles: true,
                }),
              );
            }}
          >
            Open palette
          </Button>
        </Flex>
        <ConnectedCommandPalette placeholder="Type a command or search..." />
      </Stack>
    </CommandRegistryProvider>
  );
}

export {
  SearchCommandBarPreview,
  TableToolbarPreview,
  ActiveFiltersBarPreview,
  ViewModeSwitcherPreview,
  ExportButtonPreview,
  ColumnMenuPreview,
  FieldFiltersPanelPreview,
  SavedViewsMenuPreview,
  ScopeSwitcherPreview,
  SelectionPreviewRailPreview,
  ActionDockPreview,
  ConnectedCommandPalettePreview,
};
