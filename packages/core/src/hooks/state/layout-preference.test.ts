/**
 * useLayoutPreference Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayoutPreference } from './layout-preference';
import type { LayoutPreference } from './layout-preference';

// ============================================================================
// Storage Mock
// ============================================================================

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
    removeItem: vi.fn((key: string) => { store.delete(key); }),
    clear: vi.fn(() => { store.clear(); }),
    get length() { return store.size; },
    key: vi.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    }),
    _store: store,
  };
}

let localStorageMock: ReturnType<typeof createStorageMock>;

beforeEach(() => {
  localStorageMock = createStorageMock();
  vi.stubGlobal('localStorage', localStorageMock);
  vi.stubGlobal('sessionStorage', createStorageMock());
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ============================================================================
// Test Helpers
// ============================================================================

const defaultPrefs: LayoutPreference = {
  viewMode: 'table',
  density: 'comfortable',
  sidebarCollapsed: false,
  sidebarWidth: 250,
  columns: [
    { key: 'name', visible: true, width: 200, order: 0 },
    { key: 'date', visible: true, width: 150, order: 1 },
    { key: 'status', visible: true, width: 100, order: 2 },
  ],
  pageSize: 20,
};

// ============================================================================
// Tests
// ============================================================================

describe('useLayoutPreference', () => {
  describe('Initial State', () => {
    it('starts with defaults', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'test-layout',
          defaults: defaultPrefs,
        })
      );

      expect(result.current.preference.viewMode).toBe('table');
      expect(result.current.preference.density).toBe('comfortable');
      expect(result.current.preference.sidebarCollapsed).toBe(false);
      expect(result.current.preference.columns).toHaveLength(3);
    });

    it('hydrates from localStorage on mount', () => {
      const stored: LayoutPreference = {
        viewMode: 'cards',
        density: 'compact',
      };
      localStorageMock.setItem(
        'ds-layout-test-layout',
        JSON.stringify(stored)
      );

      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'test-layout',
          defaults: defaultPrefs,
        })
      );

      // After hydration effect runs
      expect(result.current.preference.viewMode).toBe('cards');
      expect(result.current.preference.density).toBe('compact');
      // Non-overridden defaults should be preserved
      expect(result.current.preference.sidebarCollapsed).toBe(false);
      expect(result.current.preference.columns).toHaveLength(3);
    });

    it('gracefully handles missing storage data', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'nonexistent',
          defaults: defaultPrefs,
        })
      );

      expect(result.current.preference).toEqual(defaultPrefs);
    });

    it('gracefully handles corrupted storage data', () => {
      localStorageMock.setItem('ds-layout-corrupt', 'not valid json {{{');

      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'corrupt',
          defaults: defaultPrefs,
        })
      );

      expect(result.current.preference).toEqual(defaultPrefs);
    });
  });

  describe('setPreference', () => {
    it('partially updates preferences via deep merge', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'test',
          defaults: defaultPrefs,
        })
      );

      act(() => {
        result.current.setPreference({ density: 'spacious' });
      });

      expect(result.current.preference.density).toBe('spacious');
      // Other values should be preserved
      expect(result.current.preference.viewMode).toBe('table');
      expect(result.current.preference.sidebarCollapsed).toBe(false);
    });

    it('debounces writes to storage', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'debounce-test',
          defaults: defaultPrefs,
          debounceMs: 300,
        })
      );

      act(() => {
        result.current.setPreference({ density: 'compact' });
      });

      // Should not have written yet
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
        'ds-layout-debounce-test',
        expect.any(String)
      );

      // Advance past debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ds-layout-debounce-test',
        expect.any(String)
      );
    });

    it('coalesces rapid updates into a single write', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'rapid-test',
          defaults: defaultPrefs,
          debounceMs: 200,
        })
      );

      act(() => {
        result.current.setPreference({ density: 'compact' });
      });
      act(() => {
        result.current.setPreference({ density: 'spacious' });
      });
      act(() => {
        result.current.setPreference({ density: 'comfortable' });
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Only one write should happen, with the latest value
      const calls = localStorageMock.setItem.mock.calls.filter(
        (c: [string, string]) => c[0] === 'ds-layout-rapid-test'
      );
      expect(calls).toHaveLength(1);

      const written = JSON.parse(calls[0][1]);
      expect(written.density).toBe('comfortable');
    });

    it('updates sort configuration', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'sort-test',
          defaults: defaultPrefs,
        })
      );

      act(() => {
        result.current.setPreference({
          sortField: 'name',
          sortDirection: 'desc',
        });
      });

      expect(result.current.preference.sortField).toBe('name');
      expect(result.current.preference.sortDirection).toBe('desc');
    });

    it('updates filter values', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'filter-test',
          defaults: defaultPrefs,
        })
      );

      act(() => {
        result.current.setPreference({
          filters: { status: 'active', priority: 'high' },
        });
      });

      expect(result.current.preference.filters).toEqual({
        status: 'active',
        priority: 'high',
      });
    });

    it('handles custom extensible keys', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'custom-test',
          defaults: { ...defaultPrefs, customFlag: false },
        })
      );

      act(() => {
        result.current.setPreference({ customFlag: true });
      });

      expect(result.current.preference.customFlag).toBe(true);
    });
  });

  describe('resetPreference', () => {
    it('resets to defaults and clears storage', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'reset-test',
          defaults: defaultPrefs,
        })
      );

      act(() => {
        result.current.setPreference({
          density: 'spacious',
          viewMode: 'grid',
        });
      });

      // Flush debounce
      act(() => { vi.advanceTimersByTime(300); });

      act(() => {
        result.current.resetPreference();
      });

      expect(result.current.preference).toEqual(defaultPrefs);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ds-layout-reset-test');
    });

    it('cancels any pending debounced writes', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'reset-cancel-test',
          defaults: defaultPrefs,
          debounceMs: 500,
        })
      );

      act(() => {
        result.current.setPreference({ density: 'compact' });
      });

      // Reset before debounce fires
      act(() => {
        result.current.resetPreference();
      });

      // Advance past debounce
      act(() => { vi.advanceTimersByTime(500); });

      // Should NOT have written the 'compact' value
      const writeCalls = localStorageMock.setItem.mock.calls.filter(
        (c: [string, string]) => c[0] === 'ds-layout-reset-cancel-test'
      );
      expect(writeCalls).toHaveLength(0);
    });
  });

  describe('toggleSidebar', () => {
    it('toggles sidebarCollapsed from false to true', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'sidebar-test',
          defaults: { ...defaultPrefs, sidebarCollapsed: false },
        })
      );

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.preference.sidebarCollapsed).toBe(true);
    });

    it('toggles sidebarCollapsed from true to false', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'sidebar-test2',
          defaults: { ...defaultPrefs, sidebarCollapsed: true },
        })
      );

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.preference.sidebarCollapsed).toBe(false);
    });

    it('toggles back and forth', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'sidebar-toggle',
          defaults: { ...defaultPrefs, sidebarCollapsed: false },
        })
      );

      act(() => { result.current.toggleSidebar(); });
      expect(result.current.preference.sidebarCollapsed).toBe(true);

      act(() => { result.current.toggleSidebar(); });
      expect(result.current.preference.sidebarCollapsed).toBe(false);
    });
  });

  describe('setColumnWidth', () => {
    it('updates the width of a specific column', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'col-width-test',
          defaults: defaultPrefs,
        })
      );

      act(() => {
        result.current.setColumnWidth('name', 300);
      });

      const nameCol = result.current.preference.columns?.find(
        (c) => c.key === 'name'
      );
      expect(nameCol?.width).toBe(300);

      // Other columns should be unchanged
      const dateCol = result.current.preference.columns?.find(
        (c) => c.key === 'date'
      );
      expect(dateCol?.width).toBe(150);
    });

    it('does not fail for a non-existent column key', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'col-width-noop',
          defaults: defaultPrefs,
        })
      );

      act(() => {
        result.current.setColumnWidth('nonexistent', 999);
      });

      // No column should have width 999
      const cols = result.current.preference.columns ?? [];
      expect(cols.every((c) => c.width !== 999)).toBe(true);
    });
  });

  describe('setColumnVisibility', () => {
    it('hides a column', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'col-vis-test',
          defaults: defaultPrefs,
        })
      );

      act(() => {
        result.current.setColumnVisibility('status', false);
      });

      const statusCol = result.current.preference.columns?.find(
        (c) => c.key === 'status'
      );
      expect(statusCol?.visible).toBe(false);
    });

    it('shows a previously hidden column', () => {
      const withHidden: LayoutPreference = {
        ...defaultPrefs,
        columns: [
          { key: 'name', visible: true, width: 200, order: 0 },
          { key: 'hidden', visible: false, width: 100, order: 1 },
        ],
      };

      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'col-show-test',
          defaults: withHidden,
        })
      );

      act(() => {
        result.current.setColumnVisibility('hidden', true);
      });

      const col = result.current.preference.columns?.find(
        (c) => c.key === 'hidden'
      );
      expect(col?.visible).toBe(true);
    });
  });

  describe('reorderColumns', () => {
    it('moves a column from one position to another', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'reorder-test',
          defaults: defaultPrefs,
        })
      );

      // Move 'status' (index 2) to index 0
      act(() => {
        result.current.reorderColumns(2, 0);
      });

      const cols = result.current.preference.columns ?? [];
      expect(cols[0].key).toBe('status');
      expect(cols[1].key).toBe('name');
      expect(cols[2].key).toBe('date');

      // Order values should be updated
      expect(cols[0].order).toBe(0);
      expect(cols[1].order).toBe(1);
      expect(cols[2].order).toBe(2);
    });

    it('is a no-op when fromIndex equals toIndex', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'reorder-noop',
          defaults: defaultPrefs,
        })
      );

      const before = result.current.preference.columns;

      act(() => {
        result.current.reorderColumns(1, 1);
      });

      // Should be referentially identical (no state change)
      expect(result.current.preference.columns).toBe(before);
    });

    it('is a no-op for out-of-bounds indices', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'reorder-oob',
          defaults: defaultPrefs,
        })
      );

      const before = result.current.preference.columns;

      act(() => {
        result.current.reorderColumns(-1, 5);
      });

      expect(result.current.preference.columns).toBe(before);
    });

    it('correctly swaps adjacent columns', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'reorder-swap',
          defaults: defaultPrefs,
        })
      );

      // Swap 'name' (0) and 'date' (1)
      act(() => {
        result.current.reorderColumns(0, 1);
      });

      const cols = result.current.preference.columns ?? [];
      expect(cols[0].key).toBe('date');
      expect(cols[1].key).toBe('name');
      expect(cols[2].key).toBe('status');
    });
  });

  describe('listSurfaceProps', () => {
    it('produces correctly shaped props', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'surface-test',
          defaults: defaultPrefs,
        })
      );

      const { listSurfaceProps } = result.current;

      expect(listSurfaceProps.columns).toHaveLength(3);
      expect(listSurfaceProps.density).toBe('comfortable');
      expect(listSurfaceProps.viewMode).toBe('table');
    });

    it('reflects preference updates', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'surface-update-test',
          defaults: defaultPrefs,
        })
      );

      act(() => {
        result.current.setPreference({
          viewMode: 'grid',
          density: 'compact',
        });
      });

      expect(result.current.listSurfaceProps.viewMode).toBe('grid');
      expect(result.current.listSurfaceProps.density).toBe('compact');
    });

    it('defaults viewMode and density when not set', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'surface-default-test',
          defaults: {},
        })
      );

      expect(result.current.listSurfaceProps.viewMode).toBe('table');
      expect(result.current.listSurfaceProps.density).toBe('comfortable');
      expect(result.current.listSurfaceProps.columns).toEqual([]);
    });
  });

  describe('sessionStorage', () => {
    it('uses sessionStorage when specified', () => {
      const sessionMock = createStorageMock();
      vi.stubGlobal('sessionStorage', sessionMock);

      const stored: LayoutPreference = { viewMode: 'cards' };
      sessionMock.setItem('ds-layout-session-test', JSON.stringify(stored));

      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'session-test',
          defaults: defaultPrefs,
          storage: 'sessionStorage',
        })
      );

      expect(result.current.preference.viewMode).toBe('cards');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty columns array', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'empty-cols',
          defaults: { ...defaultPrefs, columns: [] },
        })
      );

      expect(result.current.preference.columns).toEqual([]);

      // Column operations should not fail
      act(() => {
        result.current.setColumnWidth('nonexistent', 100);
      });
      act(() => {
        result.current.setColumnVisibility('nonexistent', false);
      });
      act(() => {
        result.current.reorderColumns(0, 1);
      });

      expect(result.current.preference.columns).toEqual([]);
    });

    it('handles undefined columns in defaults', () => {
      const { result } = renderHook(() =>
        useLayoutPreference({
          key: 'no-cols',
          defaults: { viewMode: 'grid' },
        })
      );

      // Column operations should use empty array fallback
      act(() => {
        result.current.setColumnWidth('any', 100);
      });

      expect(result.current.preference.columns).toEqual([]);
    });
  });
});
