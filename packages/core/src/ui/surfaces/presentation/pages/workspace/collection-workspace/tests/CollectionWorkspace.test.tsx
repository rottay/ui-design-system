/**
 * @fileoverview Tests for CollectionWorkspaceSurface and useCollectionWorkspace.
 */

import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { useCollectionWorkspace } from '../../../../../runtime/collection-workspace';
import { CollectionWorkspaceSurface } from '../index';
import type { CollectionWorkspaceConfig } from '../../../../../foundation/contracts/adaptive/collection';
import type { CollectionWorkspaceSurfaceProps } from '../index';
import type { ColumnDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../../../infrastructure/runtime/responsive';

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

const PHONE_RESPONSIVE_CONTEXT: ResponsiveContextValue = {
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: false,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
};

const TABLET_RESPONSIVE_CONTEXT: ResponsiveContextValue = {
  ...PHONE_RESPONSIVE_CONTEXT,
  deviceClass: 'tablet',
  activeBreakpoint: 'md',
  isPhone: false,
  isTablet: true,
  isDesktop: false,
  isTabletOrDesktop: true,
};

const DESKTOP_RESPONSIVE_CONTEXT: ResponsiveContextValue = {
  ...PHONE_RESPONSIVE_CONTEXT,
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isDesktop: true,
  pointer: 'fine',
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

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

  it('keeps coherently empty applied values out of the canonical count while preserving zero', () => {
    const config: CollectionWorkspaceConfig<{ id: string }> = {
      ...baseConfig,
      controls: {
        filters: [
          { key: 'tags', label: 'Tags', type: 'multi-select' },
          { key: 'range', label: 'Range', type: 'date-range' },
          { key: 'query', label: 'Query', type: 'text' },
          { key: 'published', label: 'Published', type: 'boolean' },
          { key: 'capacity', label: 'Capacity', type: 'number' },
        ],
      },
    };

    const { result } = renderHook(() =>
      useCollectionWorkspace({ config }),
    );

    act(() => result.current.applyFilters({
      tags: [],
      range: ['', ''],
      query: '   ',
      published: false,
    }));

    expect(result.current.filterValues).toEqual({
      tags: [],
      range: ['', ''],
      query: '   ',
      published: false,
    });
    expect(result.current.activeFilterCount).toBe(0);

    act(() => result.current.applyFilters({ capacity: 0 }));
    expect(result.current.activeFilterCount).toBe(1);
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

  it('uses lean chrome defaults in embedded mode without hiding search', async () => {
    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          surfaceMode: 'embed',
          controls: {
            search: { enabled: true, placeholder: 'Search embedded rows...' },
          },
          contextSlot: <div>Context should be hidden</div>,
          statsSlot: <div>Stats should be hidden</div>,
        })}
      />,
    );

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Test Collection')).not.toBeInTheDocument();
    expect(screen.queryByText('Context should be hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Stats should be hidden')).not.toBeInTheDocument();
    expect(await screen.findByPlaceholderText('Search embedded rows...')).toBeInTheDocument();
  });

  it('allows embedded chrome regions to be re-enabled explicitly', async () => {
    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          surfaceMode: 'embed',
          chrome: { header: true, context: true, stats: true },
          header: {
            eyebrow: 'Embedded',
            title: 'Test Collection',
            subtitle: 'Nested collection surface',
          },
          contextSlot: <div>Visible context</div>,
          statsSlot: <div>Visible stats</div>,
        })}
      />,
    );

    expect(await screen.findByText('Test Collection')).toBeInTheDocument();
    expect(await screen.findByText('Visible context')).toBeInTheDocument();
    expect(await screen.findByText('Visible stats')).toBeInTheDocument();
    const statsSlot = container.querySelector<HTMLElement>('[data-part="stats-slot"]');
    expect(statsSlot).not.toBeNull();
    expect(statsSlot).toHaveAttribute('data-collapsed', 'false');
    expect(statsSlot?.style.padding).toBe('');
    expect(statsSlot?.style.maxHeight).toBe('');
    expect(statsSlot?.style.overflow).toBe('');
    expect(statsSlot?.style.transition).toBe('');
    expect(statsSlot?.style.pointerEvents).toBe('');
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

  it('projects adaptive phone filters into a transactional sheet backed by canonical state', async () => {
    const onFilterChange = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Test Collection',
            },
            activeFilters: {
              filters: [
                {
                  key: 'search',
                  label: 'Search',
                  value: 'alice',
                },
              ],
              onRemove: vi.fn(),
              onClearAll: vi.fn(),
            },
            adaptive: {
              desktop: { filters: 'inline' },
              phone: { filters: 'sheet' },
            },
            controls: {
              filters: [
                {
                  key: 'status',
                  label: 'Lifecycle status',
                  type: 'select',
                  options: [
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ],
                },
              ],
              onFilterChange,
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    expect(screen.queryByText('Lifecycle status')).not.toBeInTheDocument();

    const trigger = await screen.findByRole('button', { name: 'Advanced filters' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const controlledId = trigger.getAttribute('aria-controls');
    expect(controlledId).toBeTruthy();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Advanced filters' });
    expect(dialog).toHaveAttribute('id', controlledId);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('Lifecycle status')).toBeInTheDocument();
    const statusSelect = dialog.querySelector<HTMLSelectElement>('select');
    expect(statusSelect).not.toBeNull();

    fireEvent.change(statusSelect!, { target: { value: 'active' } });
    expect(onFilterChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onFilterChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Advanced filters/ }));
    let reopenedDialog = await screen.findByRole('dialog', { name: 'Advanced filters' });
    expect(reopenedDialog.querySelector<HTMLSelectElement>('select')?.value).toBe('');

    fireEvent.change(reopenedDialog.querySelector<HTMLSelectElement>('select')!, {
      target: { value: 'inactive' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'inactive' });

    fireEvent.click(screen.getByRole('button', { name: /Advanced filters/ }));
    reopenedDialog = await screen.findByRole('dialog', { name: 'Advanced filters' });
    expect(reopenedDialog.querySelector<HTMLSelectElement>('select')?.value).toBe('inactive');

    fireEvent.click(
      reopenedDialog.querySelector<HTMLButtonElement>('[data-part="reset-button"]')!,
    );
    expect(screen.getByRole('dialog', { name: 'Advanced filters' })).toBeInTheDocument();
    expect(reopenedDialog.querySelector<HTMLSelectElement>('select')?.value).toBe('');
    expect(onFilterChange).toHaveBeenCalledTimes(1);
  });

  it('keeps the same adaptive filter content inline on desktop', async () => {
    const { container } = renderSurface(
      <ResponsiveContext.Provider value={DESKTOP_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Test Collection',
            },
            adaptive: {
              desktop: { filters: 'inline' },
              phone: { filters: 'sheet' },
            },
            controls: {
              filters: [
                {
                  key: 'status',
                  label: 'Lifecycle status',
                  type: 'select',
                  options: [{ label: 'Active', value: 'active' }],
                },
              ],
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const trigger = await screen.findByRole('button', { name: 'Advanced filters' });
    expect(trigger).not.toHaveAttribute('aria-haspopup');
    expect(trigger).not.toHaveAttribute('aria-controls');
    fireEvent.click(trigger);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('Lifecycle status')).toBeInTheDocument();
    expect(container.querySelector('[data-part="filters-strip"]')).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  it('projects tablet filters into a transactional anchored dropdown', async () => {
    const onFilterChange = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={TABLET_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Test Collection',
            },
            adaptive: {
              desktop: { filters: 'inline' },
              tablet: { filters: 'dropdown' },
              phone: { filters: 'sheet' },
            },
            controls: {
              filters: [
                {
                  key: 'status',
                  label: 'Lifecycle status',
                  type: 'select',
                  options: [
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ],
                },
              ],
              onFilterChange,
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    expect(screen.queryByText('Lifecycle status')).not.toBeInTheDocument();
    const trigger = await screen.findByRole('button', { name: 'Advanced filters' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');

    fireEvent.click(trigger);
    let dialog = await screen.findByRole('dialog', { name: 'Advanced filters' });
    expect(dialog).toHaveAttribute('id', trigger.getAttribute('aria-controls'));
    expect(dialog).toHaveAttribute('data-part', 'filter-dropdown-surface');
    expect(dialog).toHaveStyle({ position: 'fixed' });
    const statusSelect = within(dialog).getByRole('combobox');
    await waitFor(() => expect(statusSelect).toHaveFocus());

    fireEvent.change(statusSelect, { target: { value: 'active' } });
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Advanced filters' }))
        .not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
    expect(onFilterChange).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    dialog = await screen.findByRole('dialog', { name: 'Advanced filters' });
    expect(within(dialog).getByRole<HTMLSelectElement>('combobox').value).toBe('');
    fireEvent.change(within(dialog).getByRole('combobox'), {
      target: { value: 'inactive' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Apply filters' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Advanced filters' }))
        .not.toBeInTheDocument();
    });
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith({ status: 'inactive' });
  });

  it('exposes the same anchored dropdown contract in non-premium tablet mode', async () => {
    renderSurface(
      <ResponsiveContext.Provider value={TABLET_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: { tablet: { filters: 'dropdown' } },
            controls: {
              filters: [
                {
                  key: 'query',
                  label: 'Candidate query',
                  type: 'text',
                  placeholder: 'Filter candidates',
                },
              ],
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    expect(screen.queryByPlaceholderText('Filter candidates')).not.toBeInTheDocument();
    const trigger = await screen.findByRole('button', { name: 'Advanced filters' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-controls');

    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Advanced filters' });
    expect(dialog).toHaveAttribute('data-part', 'filter-dropdown-surface');
    expect(within(dialog).getByPlaceholderText('Filter candidates')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Advanced filters' }))
        .not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });

  it('hydrates canonical filters when an open inline panel becomes a dropdown', async () => {
    function PostureTransitionHarness() {
      const [responsive, setResponsive] = React.useState(DESKTOP_RESPONSIVE_CONTEXT);

      return (
        <>
          <button type="button" onClick={() => setResponsive(TABLET_RESPONSIVE_CONTEXT)}>
            Use tablet posture
          </button>
          <ResponsiveContext.Provider value={responsive}>
            <CollectionWorkspaceSurface
              {...buildProps({
                header: { eyebrow: 'People', title: 'Test Collection' },
                adaptive: {
                  desktop: { filters: 'inline' },
                  tablet: { filters: 'dropdown' },
                },
                controls: {
                  filters: [
                    {
                      key: 'status',
                      label: 'Lifecycle status',
                      type: 'select',
                      options: [{ label: 'Active', value: 'active' }],
                    },
                  ],
                  filterValues: { status: 'active' },
                },
              })}
            />
          </ResponsiveContext.Provider>
        </>
      );
    }

    renderSurface(<PostureTransitionHarness />);
    const trigger = await screen.findByRole('button', { name: /Advanced filters/ });
    fireEvent.click(trigger);
    expect(screen.getAllByText('Lifecycle status').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Use tablet posture' }));
    const dialog = await screen.findByRole(
      'dialog',
      { name: 'Advanced filters' },
      { timeout: 1000 },
    );
    await waitFor(() => {
      expect((within(dialog).getByRole('combobox') as HTMLSelectElement).value)
        .toBe('active');
    });
  });

  it('exposes the same dialog trigger contract in non-premium phone mode', async () => {
    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: { phone: { filters: 'sheet' } },
            controls: {
              filters: [
                {
                  key: 'query',
                  label: 'Candidate query',
                  type: 'text',
                  placeholder: 'Filter candidates',
                },
              ],
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const trigger = await screen.findByRole('button', { name: 'Advanced filters' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls');

    fireEvent.click(trigger);
    expect(
      await screen.findByRole('dialog', { name: 'Advanced filters' }),
    ).toHaveAttribute('id', trigger.getAttribute('aria-controls'));
    expect(await screen.findByPlaceholderText('Filter candidates')).toBeInTheDocument();
  });

  it('keeps the mobile advanced-filter count at zero after applying an empty multi-select', async () => {
    const onFilterChange = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Test Collection',
            },
            activeFilters: {
              filters: [{ key: 'search', label: 'Search', value: 'alice' }],
              onRemove: vi.fn(),
              onClearAll: vi.fn(),
            },
            adaptive: { phone: { filters: 'sheet' } },
            controls: {
              filters: [
                {
                  key: 'skills',
                  label: 'Skills',
                  type: 'multi-select',
                  options: [{ label: 'React', value: 'react' }],
                },
              ],
              onFilterChange,
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Advanced filters' }));
    const dialog = await screen.findByRole('dialog', { name: 'Advanced filters' });
    const option = dialog.querySelector<HTMLInputElement>('input[type="checkbox"]');
    expect(option).not.toBeNull();

    fireEvent.click(option!);
    fireEvent.click(option!);
    expect(onFilterChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange).toHaveBeenCalledWith({ skills: [] });
    expect(screen.getByRole('button', { name: 'Advanced filters' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('button', { name: 'Advanced filters (1)' })).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Adaptive compact header and action continuity
  // -------------------------------------------------------------------------

  it('projects phone chrome into a minimal header and one compact action dock', async () => {
    const onAddCandidate = vi.fn();
    const onRunMatching = vi.fn();
    const onExport = vi.fn();
    const { container } = renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Candidates',
              subtitle: 'Search, compare, and move candidates through the funnel.',
              metaItems: [{ key: 'active', label: '3 active' }],
              shortcuts: [{ key: 'search', label: 'Press / to search' }],
              quickActions: [
                {
                  key: 'add-candidate',
                  label: 'Add candidate',
                  onClick: onAddCandidate,
                  variant: 'primary',
                },
                {
                  key: 'matching',
                  label: 'Run matching',
                  onClick: onRunMatching,
                },
                {
                  key: 'export',
                  label: 'Export candidates',
                  onClick: onExport,
                },
              ],
            },
            adaptive: {
              desktop: { compactHeader: false, actionBar: 'inline' },
              phone: { compactHeader: true, actionBar: 'sticky-bottom' },
            },
            primaryAction: {
              key: 'add-candidate',
              label: 'Add candidate',
              onClick: onAddCandidate,
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const header = container.querySelector<HTMLElement>('.ds-collection-header');
    expect(header).not.toBeNull();
    expect(header).toHaveAttribute('data-compact', 'true');
    expect(header).toHaveAttribute('data-minimal', 'true');
    expect(within(header!).getByText('People')).toBeInTheDocument();
    expect(within(header!).getByText('Candidates')).toBeInTheDocument();
    expect(within(header!).queryByText(/Search, compare/)).not.toBeInTheDocument();
    expect(within(header!).queryByText('3 active')).not.toBeInTheDocument();
    expect(within(header!).queryByText('Press / to search')).not.toBeInTheDocument();
    expect(header!.querySelector('[data-part="secondary-rail"]')).not.toBeInTheDocument();

    const dock = await screen.findByTestId('collection-action-dock');
    expect(dock).toHaveAttribute('role', 'toolbar');
    expect(dock).toHaveAttribute('aria-label', 'Collection actions');
    expect(dock).toHaveAttribute('data-part', 'root');
    expect(dock).toHaveAttribute('data-mode', 'sticky');
    expect(screen.getAllByRole('button', { name: 'Add candidate' })).toHaveLength(1);
    expect(within(dock).getByRole('button', { name: 'Add candidate' }))
      .toHaveClass('ds-collection-workspace__sticky-primary-action');

    const moreTrigger = within(dock).getByRole('button', { name: 'More actions' });
    expect(moreTrigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(moreTrigger).toHaveAttribute('aria-expanded', 'false');
    const controlledId = moreTrigger.getAttribute('aria-controls');
    expect(controlledId).toBeTruthy();
    fireEvent.click(moreTrigger);

    const dialog = await screen.findByRole('dialog', { name: 'More actions' });
    expect(dialog).toHaveAttribute('id', controlledId);
    expect(moreTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).queryByRole('button', { name: 'Add candidate' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Export candidates' })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Run matching' }));
    expect(onRunMatching).toHaveBeenCalledTimes(1);
    expect(onAddCandidate).not.toHaveBeenCalled();
    expect(onExport).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'More actions' })).not.toBeInTheDocument());
    expect(moreTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps sticky action continuity independent from header compactness', async () => {
    const onCreate = vi.fn();
    const onExport = vi.fn();
    const { container } = renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Candidates',
              subtitle: 'Candidate pipeline',
              quickActions: [
                { key: 'create', label: 'Create candidate', onClick: onCreate },
                { key: 'export', label: 'Export candidates', onClick: onExport },
              ],
            },
            adaptive: {
              phone: { compactHeader: false, actionBar: 'sticky-bottom' },
            },
            primaryAction: {
              key: 'create',
              label: 'Create candidate',
              onClick: onCreate,
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const header = container.querySelector<HTMLElement>('.ds-collection-header');
    expect(header).toHaveAttribute('data-minimal', 'false');
    expect(within(header!).getByText('Candidate pipeline')).toBeInTheDocument();
    expect(within(header!).queryByRole('button')).not.toBeInTheDocument();

    const dock = await screen.findByTestId('collection-action-dock');
    expect(within(dock).getByRole('button', { name: 'Create candidate' })).toBeInTheDocument();
    expect(within(dock).getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('de-duplicates compact secondary actions by handler or normalized label when no primary key exists', async () => {
    const onPrimary = vi.fn();
    const onLabelDuplicate = vi.fn();
    const onSecondary = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Candidates',
              subtitle: 'Candidate pipeline',
              quickActions: [
                {
                  key: 'handler-copy',
                  label: 'Duplicate by handler',
                  onClick: onPrimary,
                },
                {
                  key: 'label-copy',
                  label: '  ADD   CANDIDATE  ',
                  onClick: onLabelDuplicate,
                },
                {
                  key: 'secondary',
                  label: 'Compare candidates',
                  onClick: onSecondary,
                },
              ],
            },
            adaptive: {
              phone: { compactHeader: true, actionBar: 'sticky-bottom' },
            },
            primaryAction: {
              label: 'Add candidate',
              onClick: onPrimary,
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'More actions' }));
    const dialog = await screen.findByRole('dialog', { name: 'More actions' });

    expect(within(dialog).queryByRole('button', { name: 'Duplicate by handler' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: /add\s+candidate/i })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Compare candidates' })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Compare candidates' }));
    expect(onSecondary).toHaveBeenCalledTimes(1);
    expect(onPrimary).not.toHaveBeenCalled();
    expect(onLabelDuplicate).not.toHaveBeenCalled();
  });

  it('treats stable action keys as authoritative before handler or label fallbacks', async () => {
    const onPrimary = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Candidates',
              subtitle: 'Candidate pipeline',
              quickActions: [
                {
                  key: 'same-handler-different-key',
                  label: 'Same handler, different action',
                  onClick: onPrimary,
                },
                {
                  key: 'same-label-different-key',
                  label: 'Add candidate',
                  onClick: vi.fn(),
                },
                {
                  key: 'create',
                  label: 'Duplicate by stable key',
                  onClick: vi.fn(),
                },
              ],
            },
            adaptive: {
              phone: { compactHeader: true, actionBar: 'sticky-bottom' },
            },
            primaryAction: {
              key: 'create',
              label: 'Add candidate',
              onClick: onPrimary,
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'More actions' }));
    const dialog = await screen.findByRole('dialog', { name: 'More actions' });

    expect(within(dialog).getByRole('button', { name: 'Same handler, different action' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Add candidate' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Duplicate by stable key' })).not.toBeInTheDocument();
  });

  it('does not reopen the overflow sheet when actions disappear and later return', async () => {
    let setOverflowVisible: React.Dispatch<React.SetStateAction<boolean>> = () => undefined;

    function DynamicActionsHarness() {
      const [overflowVisible, updateOverflowVisible] = React.useState(true);
      setOverflowVisible = updateOverflowVisible;

      return (
        <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
          <CollectionWorkspaceSurface
            {...buildProps({
              header: {
                eyebrow: 'People',
                title: 'Candidates',
                subtitle: 'Candidate pipeline',
                quickActions: overflowVisible
                  ? [{ key: 'export', label: 'Export candidates', onClick: vi.fn() }]
                  : [],
              },
              adaptive: {
                phone: { compactHeader: true, actionBar: 'sticky-bottom' },
              },
            })}
          />
        </ResponsiveContext.Provider>
      );
    }

    renderSurface(<DynamicActionsHarness />);
    fireEvent.click(await screen.findByRole('button', { name: 'More actions' }));
    expect(await screen.findByRole('dialog', { name: 'More actions' })).toBeInTheDocument();

    act(() => setOverflowVisible(false));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'More actions' })).not.toBeInTheDocument();
    });

    act(() => setOverflowVisible(true));
    expect(await screen.findByRole('button', { name: 'More actions' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('dialog', { name: 'More actions' })).not.toBeInTheDocument();
  });

  it('forwards disabled, loading, and accessible-name state to the compact primary action', async () => {
    const onCreate = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Candidates',
              subtitle: 'Candidate pipeline',
            },
            adaptive: {
              phone: { compactHeader: true, actionBar: 'sticky-bottom' },
            },
            primaryAction: {
              label: 'Add candidate',
              onClick: onCreate,
              disabled: true,
              loading: true,
              ariaLabel: 'Create candidate securely',
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const primary = await screen.findByRole('button', { name: 'Create candidate securely' });
    expect(primary).toBeDisabled();
    expect(primary).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(primary);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('preserves desktop header quick actions without creating a compact action dock', async () => {
    const onAddCandidate = vi.fn();
    const onExport = vi.fn();
    const { container } = renderSurface(
      <ResponsiveContext.Provider value={DESKTOP_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            header: {
              eyebrow: 'People',
              title: 'Candidates',
              subtitle: 'Candidate pipeline',
              quickActions: [
                {
                  key: 'add-candidate',
                  label: 'Add candidate',
                  onClick: onAddCandidate,
                  variant: 'primary',
                },
                {
                  key: 'export',
                  label: 'Export candidates',
                  onClick: onExport,
                },
              ],
            },
            adaptive: {
              desktop: { compactHeader: false, actionBar: 'inline' },
              phone: { compactHeader: true, actionBar: 'sticky-bottom' },
            },
            primaryAction: {
              key: 'add-candidate',
              label: 'Add candidate',
              onClick: onAddCandidate,
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const header = container.querySelector<HTMLElement>('.ds-collection-header');
    expect(header).not.toBeNull();
    expect(header).toHaveAttribute('data-compact', 'false');
    expect(header).toHaveAttribute('data-minimal', 'false');
    expect(within(header!).getByRole('button', { name: 'Add candidate' })).toBeInTheDocument();
    expect(within(header!).getByRole('button', { name: 'Export candidates' })).toBeInTheDocument();
    expect(screen.queryByTestId('collection-action-dock')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument();
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
    const exportBtn = await screen.findByRole('button', { name: 'Export' });
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
    const exportBtn = await screen.findByRole('button', { name: 'Export' });
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
    const exportBtn = await screen.findByRole('button', { name: 'Export' });
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
    const exportBtn = await screen.findByRole('button', { name: 'Export' });
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

  it('passes canonical selection, open, and actions into cards-mode renderers', async () => {
    const onSelectionChange = vi.fn();
    const onRowClick = vi.fn();

    renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          defaultViewMode: 'cards',
          onRowClick,
          actions: (row) => <span>{`Actions for ${row.name}`}</span>,
          behavior: {
            selection: {
              enabled: true,
              selectedKeys: ['1'],
              onSelectionChange,
            },
          },
          viewModes: {
            cards: {
              renderCard: (row, _index, context) => (
                <div>
                  <span>{`${row.name}: ${context.selected ? 'selected' : 'not selected'}`}</span>
                  <button
                    type="button"
                    onClick={context.toggleSelection}
                  >
                    {`Toggle ${row.name}`}
                  </button>
                  <button
                    type="button"
                    onClick={context.open}
                  >
                    {`Open ${row.name}`}
                  </button>
                  {context.actions}
                </div>
              ),
            },
          },
        })}
      />,
    );

    expect(await screen.findByText('Alice: selected')).toBeInTheDocument();
    expect(screen.getByText('Bob: not selected')).toBeInTheDocument();
    expect(screen.getByText('Actions for Alice')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle Bob' }));
    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2'], TEST_DATA.slice(0, 2));

    fireEvent.click(screen.getByRole('button', { name: 'Open Bob' }));
    expect(onRowClick).toHaveBeenCalledWith(TEST_DATA[1], 1);
    expect(onRowClick).toHaveBeenCalledTimes(1);
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

  it('projects a phone cards selection into a details sheet without clearing selection', async () => {
    const onSelectionChange = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: {
              phone: { collection: 'cards', pane: 'sheet' },
            },
            behavior: {
              selection: {
                enabled: true,
                selectedKeys: ['1'],
                onSelectionChange,
              },
              previewRail: {
                enabled: true,
                render: (item: TestRow) => (
                  <div data-testid="sheet-raw-preview">
                    Raw preview: {item.name} ({item.status})
                  </div>
                ),
              },
            },
            viewModes: {
              cards: {
                renderCard: (row, _index, context) => (
                  <div data-testid={`sheet-card-${row.id}`}>
                    {row.name}: {context.selected ? 'selected' : 'not selected'}
                  </div>
                ),
              },
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const dialog = await screen.findByRole('dialog', { name: 'Test Collection details' });
    expect(within(dialog).getByTestId('sheet-raw-preview')).toHaveTextContent(
      'Raw preview: Alice (active)',
    );
    expect(screen.getByTestId('sheet-card-1')).toHaveTextContent('Alice: selected');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Test Collection details' }))
        .not.toBeInTheDocument();
    });
    expect(screen.getByTestId('sheet-card-1')).toHaveTextContent('Alice: selected');
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('keeps a selected compact preview alive across a loading refetch', async () => {
    function RefetchHarness() {
      const [phase, setPhase] = React.useState<'ready' | 'loading' | 'restored'>('ready');
      const rows = phase === 'loading' ? [] : TEST_DATA;

      return (
        <>
          <button type="button" onClick={() => setPhase('loading')}>Start refetch</button>
          <button type="button" onClick={() => setPhase('restored')}>Finish refetch</button>
          <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
            <CollectionWorkspaceSurface
              {...buildProps({
                data: rows,
                loading: phase === 'loading',
                adaptive: { phone: { collection: 'cards', pane: 'sheet' } },
                behavior: {
                  selection: { enabled: true, selectedKeys: ['1'] },
                  previewRail: {
                    enabled: true,
                    render: (item: TestRow) => (
                      <div data-testid="refetch-preview">Preview {item.name}</div>
                    ),
                  },
                },
              })}
            />
          </ResponsiveContext.Provider>
        </>
      );
    }

    renderSurface(<RefetchHarness />);
    let dialog = await screen.findByRole('dialog', { name: 'Test Collection details' });
    expect(within(dialog).getByTestId('refetch-preview')).toHaveTextContent('Preview Alice');

    fireEvent.click(screen.getByRole('button', { name: 'Start refetch' }));
    dialog = await screen.findByRole('dialog', { name: 'Test Collection details' });
    expect(within(dialog).getByText('Loading details…')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Finish refetch' }));
    dialog = await screen.findByRole('dialog', { name: 'Test Collection details' });
    expect(await within(dialog).findByTestId('refetch-preview')).toHaveTextContent(
      'Preview Alice',
    );
  });

  it('removes a stale accordion disclosure after its item disappears from settled data', async () => {
    function RemovedPreviewHarness() {
      const [rows, setRows] = React.useState(TEST_DATA);

      return (
        <>
          <button type="button" onClick={() => setRows([])}>Remove preview item</button>
          <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
            <CollectionWorkspaceSurface
              {...buildProps({
                data: rows,
                adaptive: { phone: { collection: 'cards', pane: 'accordion' } },
                behavior: {
                  selection: { enabled: true, selectedKeys: ['1'] },
                  previewRail: {
                    enabled: true,
                    render: (item: TestRow) => <div>Preview {item.name}</div>,
                  },
                },
              })}
            />
          </ResponsiveContext.Provider>
        </>
      );
    }

    const { container } = renderSurface(<RemovedPreviewHarness />);
    await waitFor(() => {
      expect(container.querySelector('[data-part="preview-accordion"]'))
        .toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove preview item' }));
    await waitFor(() => {
      expect(container.querySelector('[data-part="preview-accordion"]'))
        .not.toBeInTheDocument();
    });
  });

  it('does not reopen a dismissed focused preview when unrelated selection changes', async () => {
    const onSelectionChange = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: { phone: { collection: 'cards', pane: 'sheet' } },
            behavior: {
              focus: {
                enabled: true,
                focusedKey: '1',
                onFocusChange: vi.fn(),
              },
              selection: {
                enabled: true,
                selectedKeys: [],
                onSelectionChange,
              },
              previewRail: {
                enabled: true,
                render: (item: TestRow) => <div>Focused preview {item.name}</div>,
              },
            },
            viewModes: {
              cards: {
                renderCard: (row, _index, context) => (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      context.toggleSelection(event);
                    }}
                  >
                    Select {row.name}
                  </button>
                ),
              },
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const dialog = await screen.findByRole('dialog', { name: 'Test Collection details' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Test Collection details' }))
        .not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Select Bob' }));
    expect(onSelectionChange).toHaveBeenCalledWith(['2'], [TEST_DATA[1]]);
    expect(screen.queryByRole('dialog', { name: 'Test Collection details' }))
      .not.toBeInTheDocument();
  });

  it('renders an accordion preview after the collection and preserves its internal action', async () => {
    const onPreviewAction = vi.fn();
    const { container } = renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: {
              phone: { collection: 'cards', pane: 'accordion' },
            },
            behavior: {
              selection: {
                enabled: true,
                selectedKeys: ['2'],
              },
              previewRail: {
                enabled: true,
                render: (item: TestRow) => (
                  <button type="button" onClick={onPreviewAction}>
                    Review {item.name}
                  </button>
                ),
              },
            },
            viewModes: {
              cards: {
                renderCard: (row) => <div>{`Accordion card ${row.name}`}</div>,
              },
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    const collection = container.querySelector<HTMLElement>('[data-part="collection"]');
    const accordion = container.querySelector<HTMLElement>('[data-part="preview-accordion"]');
    expect(collection).not.toBeNull();
    expect(accordion).not.toBeNull();
    expect(
      collection!.compareDocumentPosition(accordion!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const disclosure = accordion!.querySelector<HTMLElement>(
      '[data-part="preview-accordion-trigger"]',
    );
    expect(disclosure).not.toBeNull();
    await waitFor(() => expect(disclosure).toHaveAttribute('aria-expanded', 'true'));

    fireEvent.click(within(accordion!).getByRole('button', { name: 'Review Bob' }));
    expect(onPreviewAction).toHaveBeenCalledTimes(1);

    fireEvent.click(disclosure!);
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(within(accordion!).queryByRole('button', { name: 'Review Bob' }))
      .not.toBeInTheDocument();
    fireEvent.click(disclosure!);
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(within(accordion!).getByRole('button', { name: 'Review Bob' }));
    expect(onPreviewAction).toHaveBeenCalledTimes(2);
  });

  it('routes once from the named route posture without opening a preview or row callback', async () => {
    const onNavigate = vi.fn();
    const onRowClick = vi.fn();
    const onFocusChange = vi.fn();
    const onCardAction = vi.fn();
    const onCheckboxChange = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: {
              phone: { collection: 'cards', pane: 'route' },
            },
            onRowClick,
            mobileCard: (row) => (
              <div>
                {`Route card ${row.name}`}
                <button type="button" onClick={onCardAction}>
                  Archive {row.name}
                </button>
                <label>
                  <input type="checkbox" onChange={onCheckboxChange} />
                  Select {row.name}
                </label>
              </div>
            ),
            behavior: {
              focus: {
                enabled: true,
                focusedKey: null,
                onFocusChange,
              },
              previewRail: {
                enabled: true,
                render: (item: TestRow) => (
                  <div data-testid="route-preview">Preview {item.name}</div>
                ),
                mobileNavigation: {
                  enabled: true,
                  onClick: onNavigate,
                },
              },
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Archive Alice' }));
    expect(onCardAction).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Select Alice'));
    expect(onCheckboxChange).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();

    const cardActivation = screen.getByRole('button', {
      name: 'Open Test Collection item 1',
    });
    expect(cardActivation.tagName).toBe('BUTTON');
    cardActivation.focus();
    expect(cardActivation).toHaveFocus();
    fireEvent.click(cardActivation);

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(TEST_DATA[0]);
    expect(onRowClick).not.toHaveBeenCalled();
    expect(onFocusChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('route-preview')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Test Collection details' }))
      .not.toBeInTheDocument();
    expect(screen.queryByText('Test Collection details')).not.toBeInTheDocument();
  });

  it('exposes a native record link for fallback cards in the route posture', async () => {
    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: {
              phone: { collection: 'cards', pane: 'route' },
            },
            behavior: {
              previewRail: {
                enabled: true,
                render: (item: TestRow) => <div>Preview {item.name}</div>,
                mobileNavigation: {
                  enabled: true,
                  href: (item: TestRow) => `/records/${item.id}`,
                },
              },
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    expect(await screen.findByRole('link', {
      name: 'Open Test Collection item 1',
    })).toHaveAttribute('href', '/records/1');
  });

  it('does not invoke disabled mobile navigation from the route posture', async () => {
    const onNavigate = vi.fn();
    const onRowClick = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: {
              phone: { collection: 'cards', pane: 'route' },
            },
            onRowClick,
            mobileCard: (row) => <div>{`Disabled route card ${row.name}`}</div>,
            behavior: {
              previewRail: {
                enabled: true,
                render: (item: TestRow) => <div>Preview {item.name}</div>,
                mobileNavigation: {
                  enabled: false,
                  onClick: onNavigate,
                },
              },
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    fireEvent.click(await screen.findByText('Disabled route card Alice'));
    expect(onNavigate).not.toHaveBeenCalled();
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(TEST_DATA[0], 0);
  });

  it('keeps hidden plus mobileNavigation as a legacy routing alias', async () => {
    const onNavigate = vi.fn();
    const onRowClick = vi.fn();

    renderSurface(
      <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: {
              phone: { collection: 'cards', pane: 'hidden' },
            },
            onRowClick,
            mobileCard: (row) => <div>{`Legacy route card ${row.name}`}</div>,
            behavior: {
              previewRail: {
                enabled: true,
                render: (item: TestRow) => (
                  <div data-testid="legacy-route-preview">Preview {item.name}</div>
                ),
                mobileNavigation: {
                  enabled: true,
                  onClick: onNavigate,
                },
              },
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    fireEvent.click(await screen.findByText('Legacy route card Alice'));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(TEST_DATA[0]);
    expect(onRowClick).not.toHaveBeenCalled();
    expect(screen.queryByTestId('legacy-route-preview')).not.toBeInTheDocument();
  });

  it('keeps the explicit desktop inline posture on the preview rail', async () => {
    const { container } = renderSurface(
      <ResponsiveContext.Provider value={DESKTOP_RESPONSIVE_CONTEXT}>
        <CollectionWorkspaceSurface
          {...buildProps({
            adaptive: {
              desktop: { collection: 'table', pane: 'inline' },
              phone: { collection: 'cards', pane: 'sheet' },
            },
            behavior: {
              selection: {
                enabled: true,
                selectedKeys: ['3'],
              },
              previewRail: {
                enabled: true,
                render: (item: TestRow) => (
                  <div data-testid="inline-preview">Inline preview {item.name}</div>
                ),
              },
            },
          })}
        />
      </ResponsiveContext.Provider>,
    );

    expect(await screen.findByTestId('inline-preview')).toHaveTextContent(
      'Inline preview Charlie',
    );
    expect(container.querySelector('[data-part="preview-rail"]')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Test Collection details' }))
      .not.toBeInTheDocument();
    expect(container.querySelector('[data-part="preview-accordion"]')).not.toBeInTheDocument();
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

  it('keeps every registered column and row-action capability visible for all access when data fails', async () => {
    const renderActions = vi.fn(() => {
      throw new Error('row actions must not execute without row data');
    });
    const columns: ColumnDef<TestRow>[] = [
      { key: 'name', header: 'Name', accessorKey: 'name' },
      { key: 'status', header: 'Operational status', accessorKey: 'status', visible: false },
    ];

    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          access: { mode: 'all' },
          actions: renderActions,
          columns,
          error: <div data-testid="data-error">Prisma read failed</div>,
        })}
      />,
    );

    expect(await screen.findByTestId('data-error')).toHaveTextContent('Prisma read failed');
    expect(screen.getByText('Available when data recovers')).toBeInTheDocument();
    expect(
      container.querySelector('[data-capability-kind="column"][data-capability-id="name"]'),
    ).toHaveTextContent('Name');
    expect(
      container.querySelector('[data-capability-kind="column"][data-capability-id="status"]'),
    ).toHaveTextContent('Operational status');
    expect(
      container.querySelector('[data-capability-kind="action"][data-capability-id="row-actions"]'),
    ).toHaveTextContent('Row actions');
    expect(renderActions).not.toHaveBeenCalled();
  });

  it('uses explicit row-action registrations instead of collapsing them into one generic capability', async () => {
    const renderActions = vi.fn(() => {
      throw new Error('row actions must not execute without row data');
    });
    const { container } = renderSurface(
      <CollectionWorkspaceSurface
        {...buildProps({
          access: { mode: 'all' },
          actions: renderActions,
          capabilityRegistry: [
            { kind: 'action', id: 'record.preview', label: 'Preview record' },
            { kind: 'action', id: 'record.open', label: 'Open details' },
          ],
          error: <div data-testid="registered-action-error">Database unavailable</div>,
        })}
      />,
    );

    expect(await screen.findByTestId('registered-action-error')).toBeInTheDocument();
    expect(
      container.querySelector('[data-capability-kind="action"][data-capability-id="record.preview"]'),
    ).toHaveTextContent('Preview record');
    expect(
      container.querySelector('[data-capability-kind="action"][data-capability-id="record.open"]'),
    ).toHaveTextContent('Open details');
    expect(
      container.querySelector('[data-capability-kind="action"][data-capability-id="row-actions"]'),
    ).not.toBeInTheDocument();
    expect(renderActions).not.toHaveBeenCalled();
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
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
      expect(queryButtonByAriaOrText(container, 'List view', /^list$/i)).toBeInTheDocument();
      expect(queryButtonByAriaOrText(container, 'Card view', /^cards$/i)).toBeInTheDocument();
      expect(container.querySelector('button[aria-label="Export"]')).toBeInTheDocument();
      expect(queryDensityControl(container)).toBeInTheDocument();
    });
  });
});
