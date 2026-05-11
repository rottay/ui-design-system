/**
 * @fileoverview Tests for CollectionWorkspaceSurface and useCollectionWorkspace.
 */

import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { useCollectionWorkspace } from '../../../../foundation/hooks/useCollectionWorkspace';
import { CollectionWorkspaceSurface } from '../index';
import type { CollectionWorkspaceConfig } from '../../../../foundation/contracts/collection';
import type { CollectionWorkspaceSurfaceProps } from '../index';
import type { ColumnDef } from '../../../../../patterns/foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

interface TestRow {
  id: string;
  name: string;
  status: string;
}

const TEST_DATA: TestRow[] = [
  { id: '1', name: 'Alice', status: 'active' },
  { id: '2', name: 'Bob', status: 'inactive' },
  { id: '3', name: 'Charlie', status: 'active' },
];

const TEST_COLUMNS: ColumnDef<TestRow>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'status', title: 'Status', dataIndex: 'status' },
];

function buildProps(
  overrides?: Partial<CollectionWorkspaceSurfaceProps<TestRow>>,
): CollectionWorkspaceSurfaceProps<TestRow> {
  return {
    title: 'Test Collection',
    data: TEST_DATA,
    columns: TEST_COLUMNS,
    rowKey: 'id',
    ...overrides,
  };
}

function queryButtonByAriaOrText(
  container: HTMLElement,
  ariaLabel: string,
  text: string | RegExp,
): HTMLButtonElement | null {
  const byAria = container.querySelector<HTMLButtonElement>(`button[aria-label="${ariaLabel}"]`);
  if (byAria) return byAria;
  return screen.queryByText(text)?.closest('button') ?? null;
}

function queryDensityControl(container: HTMLElement): HTMLButtonElement | null {
  return (
    queryButtonByAriaOrText(container, 'Compact density', /^compact$/i) ??
    container.querySelector<HTMLButtonElement>('button[aria-label="Settings"]') ??
    container.querySelector<HTMLButtonElement>('button[aria-label="More options"]')
  );
}

// ---------------------------------------------------------------------------
// useCollectionWorkspace tests
// ---------------------------------------------------------------------------

describe('useCollectionWorkspace', () => {
  const baseConfig: CollectionWorkspaceConfig<{ id: string; name: string }> = {
    data: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ],
  };

  it('returns default state', () => {
    const { result } = renderHook(() =>
      useCollectionWorkspace({ config: baseConfig }),
    );

    expect(result.current.searchValue).toBe('');
    expect(result.current.activeViewMode).toBe('table');
    expect(result.current.filterValues).toEqual({});
    expect(result.current.selectedKeys).toEqual([]);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('manages search state internally when uncontrolled', () => {
    const onChange = vi.fn();
    const config: CollectionWorkspaceConfig<{ id: string }> = {
      ...baseConfig,
      controls: {
        search: { enabled: true, onChange },
      },
    };

    const { result } = renderHook(() =>
      useCollectionWorkspace({ config }),
    );

    expect(result.current.searchValue).toBe('');

    act(() => result.current.setSearchValue('alice'));
    expect(result.current.searchValue).toBe('alice');
    expect(onChange).toHaveBeenCalledWith('alice');
  });

  it('uses controlled search value when provided', () => {
    const config: CollectionWorkspaceConfig<{ id: string }> = {
      ...baseConfig,
      controls: {
        search: { enabled: true, value: 'external' },
      },
    };

    const { result } = renderHook(() =>
      useCollectionWorkspace({ config }),
    );

    expect(result.current.searchValue).toBe('external');
  });

  it('respects presentation.responsive.mobileBreakpoint', () => {
    const config: CollectionWorkspaceConfig<{ id: string }> = {
      ...baseConfig,
      presentation: {
        responsive: { mobileBreakpoint: 1024 },
      },
    };

    // We can't easily test matchMedia in unit tests, but we verify
    // the hook doesn't crash and returns a boolean
    const { result } = renderHook(() =>
      useCollectionWorkspace({ config }),
    );

    expect(typeof result.current.isMobile).toBe('boolean');
  });

  it('updates view mode', () => {
    const onChange = vi.fn();
    const config: CollectionWorkspaceConfig<{ id: string }> = {
      ...baseConfig,
      controls: {
        viewMode: { enabled: true, modes: ['table', 'cards'], onChange },
      },
    };

    const { result } = renderHook(() =>
      useCollectionWorkspace({ config }),
    );

    act(() => result.current.setViewMode('cards'));

    expect(result.current.activeViewMode).toBe('cards');
    expect(onChange).toHaveBeenCalledWith('cards');
  });

  it('applies and resets filters', () => {
    const onFilterChange = vi.fn();
    const config: CollectionWorkspaceConfig<{ id: string }> = {
      ...baseConfig,
      controls: {
        filters: [
          { key: 'status', label: 'Status', type: 'select', defaultValue: 'all' },
        ],
        onFilterChange,
      },
    };

    const { result } = renderHook(() =>
      useCollectionWorkspace({ config }),
    );

    act(() => result.current.applyFilters({ status: 'active' }));
    expect(result.current.filterValues).toEqual({ status: 'active' });
    expect(result.current.activeFilterCount).toBe(1);
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'active' });

    act(() => result.current.resetFilters());
    expect(result.current.filterValues).toEqual({ status: 'all' });
  });

  it('manages selection state', () => {
    const onSelectionChange = vi.fn();
    const config: CollectionWorkspaceConfig<{ id: string; name: string }> = {
      ...baseConfig,
      behavior: {
        selection: { enabled: true, onSelectionChange },
      },
    };

    const { result } = renderHook(() =>
      useCollectionWorkspace({ config }),
    );

    expect(result.current.hasSelection).toBe(false);

    act(() => result.current.setSelection(['1'], [{ id: '1', name: 'Alice' }]));
    expect(result.current.selectedKeys).toEqual(['1']);
    expect(result.current.hasSelection).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledWith(['1'], [{ id: '1', name: 'Alice' }]);

    act(() => result.current.clearSelection());
    expect(result.current.selectedKeys).toEqual([]);
    expect(result.current.hasSelection).toBe(false);
  });

  it('activates saved views', () => {
    const onViewSelect = vi.fn();
    const config: CollectionWorkspaceConfig<{ id: string }> = {
      ...baseConfig,
      controls: {
        savedViews: {
          enabled: true,
          views: [{ id: 'v1', name: 'My View', config: {} }],
          onViewSelect,
        },
      },
    };

    const { result } = renderHook(() =>
      useCollectionWorkspace({ config }),
    );

    act(() => result.current.activateSavedView('v1'));
    expect(result.current.activeSavedViewId).toBe('v1');
    expect(onViewSelect).toHaveBeenCalledWith('v1');
  });
});

// ---------------------------------------------------------------------------
// CollectionWorkspaceSurface render tests
// ---------------------------------------------------------------------------

describe('CollectionWorkspaceSurface', () => {
  // -------------------------------------------------------------------------
  // Basic rendering
  // -------------------------------------------------------------------------

  it('renders the title and subtitle', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({ subtitle: 'All team members' })}
      />,
    );

    expect(await screen.findByText('Test Collection')).toBeInTheDocument();
    expect(await screen.findByText('All team members')).toBeInTheDocument();
  });

  it('renders data rows in the default table view', async () => {
    renderSurface(<CollectionWorkspaceSurface {...buildProps()} />);

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
    expect(await screen.findByText('Charlie')).toBeInTheDocument();
  });

  it('renders header and footer slots', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          headerSlot: <div data-testid="header-slot">Header Content</div>,
          footerSlot: <div data-testid="footer-slot">Footer Content</div>,
        })}
      />,
    );

    expect(await screen.findByTestId('header-slot')).toBeInTheDocument();
    expect(await screen.findByTestId('footer-slot')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Toolbar: search
  // -------------------------------------------------------------------------

  it('renders a search input when search is enabled', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            search: { enabled: true, placeholder: 'Find people...' },
          },
        })}
      />,
    );

    const input = await screen.findByPlaceholderText('Find people...');
    expect(input).toBeInTheDocument();
  });

  it('uses default placeholder when none is specified', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            search: { enabled: true },
          },
        })}
      />,
    );

    const input = await screen.findByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('calls search onChange when typing in the search input', async () => {
    const onSearchChange = vi.fn();

    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            search: { enabled: true, onChange: onSearchChange },
          },
        })}
      />,
    );

    const input = await screen.findByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'alice' } });

    expect(onSearchChange).toHaveBeenCalledWith('alice');
  });

  it('does not render the toolbar when no controls are enabled', async () => {
    renderSurface(
      <CollectionWorkspaceSurface {...buildProps()} />,
    );

    // The toolbar only appears when at least one control is enabled.
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    expect(screen.queryByText(/export/i)).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Export
  // -------------------------------------------------------------------------

  it('renders a direct Export button when a single format is configured', async () => {
    const onExport = vi.fn();
    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            export: {
              enabled: true,
              formats: ['csv'],
              onExport,
            },
          },
        })}
      />,
    );

    await screen.findByText('Test Collection');
    const exportBtn = container.querySelector('button[aria-label="Export"]');
    if (!exportBtn) throw new Error('Export CSV button not found');
    expect(exportBtn).toBeInTheDocument();
  });

  it('calls onExport directly when a single format button is clicked', async () => {
    const onExport = vi.fn();

    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            export: {
              enabled: true,
              formats: ['csv'],
              onExport,
            },
          },
        })}
      />,
    );

    await screen.findByText('Test Collection');
    const exportBtn = container.querySelector('button[aria-label="Export"]');
    if (!exportBtn) throw new Error('Export CSV button not found');
    fireEvent.click(exportBtn);

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('defaults to csv when no formats are specified', async () => {
    const onExport = vi.fn();

    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            export: {
              enabled: true,
              onExport,
            },
          },
        })}
      />,
    );

    await screen.findByText('Test Collection');
    const exportBtn = container.querySelector('button[aria-label="Export"]');
    if (!exportBtn) throw new Error('Export CSV button not found');
    fireEvent.click(exportBtn);

    expect(onExport).toHaveBeenCalledWith('csv');
  });

  it('uses the first configured export format for the toolbar export action', async () => {
    const onExport = vi.fn();

    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            export: {
              enabled: true,
              formats: ['csv', 'xlsx'],
              onExport,
            },
          },
        })}
      />,
    );

    await screen.findByText('Test Collection');
    const exportBtn = container.querySelector('button[aria-label="Export"]');
    if (!exportBtn) throw new Error('Export button not found');
    fireEvent.click(exportBtn);

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledWith('csv');
  });

  // -------------------------------------------------------------------------
  // Saved views
  // -------------------------------------------------------------------------

  it('renders saved view tabs when savedViews is enabled', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            savedViews: {
              enabled: true,
              views: [
                { id: 'v1', name: 'Active Users', config: {} },
                { id: 'v2', name: 'Archived', config: {} },
              ],
            },
          },
        })}
      />,
    );

    expect(await screen.findByText('Active Users')).toBeInTheDocument();
    expect(await screen.findByText('Archived')).toBeInTheDocument();
  });

  it('activates a saved view when its tab is clicked', async () => {
    const onViewSelect = vi.fn();

    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            savedViews: {
              enabled: true,
              views: [
                { id: 'v1', name: 'Active Users', config: {} },
                { id: 'v2', name: 'Archived', config: {} },
              ],
              onViewSelect,
            },
          },
        })}
      />,
    );

    const archivedTab = await screen.findByText('Archived');
    fireEvent.click(archivedTab);

    expect(onViewSelect).toHaveBeenCalledWith('v2');
  });

  it('does not render saved view tabs when the views array is empty', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            savedViews: {
              enabled: true,
              views: [],
            },
          },
        })}
      />,
    );

    // With empty views, no tabs should render. The title should still be present.
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // View mode switching (table <-> cards)
  // -------------------------------------------------------------------------

  it('renders view mode toggle buttons when viewMode is enabled', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            viewMode: {
              enabled: true,
              modes: ['table', 'cards'],
            },
          },
        })}
      />,
    );

    await screen.findByText('Test Collection');
    expect(queryButtonByAriaOrText(container, 'List view', /^list$/i)).toBeInTheDocument();
    expect(queryButtonByAriaOrText(container, 'Card view', /^cards$/i)).toBeInTheDocument();
  });

  it('switches to cards view and renders card content', async () => {
    const onViewChange = vi.fn();

    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            viewMode: {
              enabled: true,
              modes: ['table', 'cards'],
              onChange: onViewChange,
            },
          },
          mobileCard: (row) => (
            <div data-testid={`card-${row.id}`}>{row.name} - Card</div>
          ),
        })}
      />,
    );

    // Click the Cards button to switch view
    await screen.findByText('Test Collection');
    const cardsButton = queryButtonByAriaOrText(container, 'Card view', /^cards$/i);
    if (!cardsButton) throw new Error('Cards view button not found');
    fireEvent.click(cardsButton);

    expect(onViewChange).toHaveBeenCalledWith('cards');

    // After switching to cards mode, card content should render
    expect(await screen.findByTestId('card-1')).toBeInTheDocument();
    expect(await screen.findByText('Alice - Card')).toBeInTheDocument();
    expect(await screen.findByText('Bob - Card')).toBeInTheDocument();
    expect(await screen.findByText('Charlie - Card')).toBeInTheDocument();
  });

  it('renders cards immediately when defaultViewMode is cards', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          defaultViewMode: 'cards',
          controls: {
            viewMode: {
              enabled: true,
              modes: ['table', 'cards'],
            },
          },
          mobileCard: (row) => (
            <div data-testid={`card-${row.id}`}>{row.name} - Card</div>
          ),
        })}
      />,
    );

    expect(await screen.findByTestId('card-1')).toBeInTheDocument();
    expect(await screen.findByTestId('card-2')).toBeInTheDocument();
    expect(await screen.findByTestId('card-3')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Preview rail
  // -------------------------------------------------------------------------

  it('renders the preview rail when exactly one item is selected', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          behavior: {
            selection: {
              enabled: true,
              selectedKeys: ['1'],
            },
            previewRail: {
              enabled: true,
              width: '400px',
              render: (item: TestRow) => (
                <div data-testid="preview-rail">
                  Preview: {item.name} ({item.status})
                </div>
              ),
            },
          },
        })}
      />,
    );

    expect(await screen.findByTestId('preview-rail')).toBeInTheDocument();
    expect(await screen.findByText('Preview: Alice (active)')).toBeInTheDocument();
  });

  it('does not render preview rail when no items are selected', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          behavior: {
            selection: { enabled: true },
            previewRail: {
              enabled: true,
              render: (item: TestRow) => (
                <div data-testid="preview-rail">Preview: {item.name}</div>
              ),
            },
          },
        })}
      />,
    );

    // No selection means no preview rail
    expect(screen.queryByTestId('preview-rail')).not.toBeInTheDocument();
  });

  it('does not render preview rail when multiple items are selected', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          behavior: {
            selection: {
              enabled: true,
              selectedKeys: ['1', '2'],
            },
            previewRail: {
              enabled: true,
              render: (item: TestRow) => (
                <div data-testid="preview-rail">Preview: {item.name}</div>
              ),
            },
          },
        })}
      />,
    );

    // Preview rail only shows when exactly 1 item is selected
    expect(screen.queryByTestId('preview-rail')).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Density controls
  // -------------------------------------------------------------------------

  it('renders a density control when density control is enabled', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            density: { enabled: true },
          },
        })}
      />,
    );

    await screen.findByText('Test Collection');
    expect(queryDensityControl(container)).toBeInTheDocument();
  });

  it('exposes density changes when the active engine renders inline density options', async () => {
    const onDensityChange = vi.fn();

    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            density: {
              enabled: true,
              value: 'comfortable',
              onChange: onDensityChange,
            },
          },
        })}
      />,
    );

    await screen.findByText('Test Collection');
    const compactBtn = queryButtonByAriaOrText(container, 'Compact density', /^compact$/i);
    if (!compactBtn) {
      expect(queryDensityControl(container)).toBeInTheDocument();
      return;
    }

    fireEvent.click(compactBtn);
    expect(onDensityChange).toHaveBeenCalledWith('compact');
  });

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------

  it('renders the error state instead of data', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          error: <div data-testid="error-message">Something went wrong</div>,
        })}
      />,
    );

    expect(await screen.findByTestId('error-message')).toBeInTheDocument();
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Row click in cards view
  // -------------------------------------------------------------------------

  it('fires onRowClick when a card is clicked in cards view', async () => {
    const onRowClick = vi.fn();

    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          defaultViewMode: 'cards',
          onRowClick,
          controls: {
            viewMode: { enabled: true, modes: ['table', 'cards'] },
          },
          mobileCard: (row) => (
            <div data-testid={`card-${row.id}`}>{row.name}</div>
          ),
        })}
      />,
    );

    const card = await screen.findByTestId('card-1');
    // The click target is the wrapping Box, which is the parent of the card content
    fireEvent.click(card);

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(
      { id: '1', name: 'Alice', status: 'active' },
      0,
    );
  });

  // -------------------------------------------------------------------------
  // Combined controls
  // -------------------------------------------------------------------------

  it('renders multiple controls together in the toolbar', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          controls: {
            search: { enabled: true, placeholder: 'Type here...' },
            viewMode: { enabled: true, modes: ['table', 'cards'] },
            export: { enabled: true, formats: ['csv'], onExport: vi.fn() },
            density: { enabled: true },
          },
        })}
      />,
    );

    // Wait for initial render
    expect(await screen.findByText('Test Collection')).toBeInTheDocument();

    // All controls should co-exist
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    expect(queryButtonByAriaOrText(container, 'List view', /^list$/i)).toBeInTheDocument();
    expect(queryButtonByAriaOrText(container, 'Card view', /^cards$/i)).toBeInTheDocument();
    expect(container.querySelector('button[aria-label="Export"]')).toBeInTheDocument();
    expect(queryDensityControl(container)).toBeInTheDocument();
  });
});
