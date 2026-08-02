import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CommandRegistryProvider,
  useRegisterCommands,
  useRegisterCommandSource,
  type Command,
  type CommandSource,
  type CommandSourceItem,
} from '@/infrastructure/runtime/application/commands/runtime/registry';
import { useCommandPaletteItems } from '..';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <CommandRegistryProvider>{children}</CommandRegistryProvider>;
}

beforeEach(() => {
  // Frecency persists through the layout-preference localStorage mechanism;
  // isolate every test from recordings made by earlier ones.
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

const SAMPLE_COMMANDS: Command[] = [
  { id: 'go-home', label: 'Go to Home', category: 'Navigation', action: vi.fn() },
  { id: 'go-settings', label: 'Go to Settings', category: 'Navigation', action: vi.fn() },
  { id: 'create-item', label: 'Create New Item', category: 'Actions', shortcut: 'ctrl+n', action: vi.fn() },
];

describe('useCommandPaletteItems', () => {
  it('converts registered commands to CommandItem shape', () => {
    function useTestHook() {
      useRegisterCommands(SAMPLE_COMMANDS);
      return useCommandPaletteItems();
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    expect(result.current.items).toHaveLength(3);
    expect(result.current.items[0]).toMatchObject({
      id: expect.any(String),
      label: expect.any(String),
      group: expect.any(String),
      onSelect: expect.any(Function),
    });
  });

  it('maps Command.category to CommandItem.group', () => {
    function useTestHook() {
      useRegisterCommands(SAMPLE_COMMANDS);
      return useCommandPaletteItems();
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    const navItems = result.current.items.filter((i) => i.group === 'Navigation');
    expect(navItems).toHaveLength(2);
  });

  it('maps Command.shortcut to CommandItem.shortcut', () => {
    function useTestHook() {
      useRegisterCommands(SAMPLE_COMMANDS);
      return useCommandPaletteItems();
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    const createItem = result.current.items.find((i) => i.id === 'create-item');
    expect(createItem?.shortcut).toBe('ctrl+n');
  });

  it('onSelect calls the original command action', () => {
    const actionSpy = vi.fn();
    const commands: Command[] = [
      { id: 'test-cmd', label: 'Test', action: actionSpy },
    ];

    function useTestHook() {
      useRegisterCommands(commands);
      return useCommandPaletteItems();
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    act(() => {
      result.current.items[0].onSelect();
    });

    expect(actionSpy).toHaveBeenCalledOnce();
  });

  it('onSearch filters items via registry fuzzy search', () => {
    function useTestHook() {
      useRegisterCommands(SAMPLE_COMMANDS);
      return useCommandPaletteItems();
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    // Before search: all items
    expect(result.current.items).toHaveLength(3);

    // Search for "settings"
    act(() => {
      result.current.onSearch('settings');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('go-settings');
  });

  it('clearing search restores all items', () => {
    function useTestHook() {
      useRegisterCommands(SAMPLE_COMMANDS);
      return useCommandPaletteItems();
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    act(() => {
      result.current.onSearch('settings');
    });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.onSearch('');
    });
    expect(result.current.items).toHaveLength(3);
  });

  it('returns empty items when no commands are registered', () => {
    const { result } = renderHook(() => useCommandPaletteItems(), { wrapper: Wrapper });
    expect(result.current.items).toHaveLength(0);
  });

  it('emits sections contiguously even when registry order interleaves categories', () => {
    const commands: Command[] = [
      { id: 'nav-top', label: 'A nav', category: 'Navigation', priority: 100, action: vi.fn() },
      { id: 'act-mid', label: 'B action', category: 'Actions', priority: 50, action: vi.fn() },
      { id: 'nav-low', label: 'C nav', category: 'Navigation', priority: 1, action: vi.fn() },
    ];

    function useTestHook() {
      useRegisterCommands(commands);
      return useCommandPaletteItems();
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    // Registry priority order is nav-top, act-mid, nav-low (interleaved);
    // the bridge re-blocks so each section is contiguous and the visual
    // grouping matches the keyboard order.
    expect(result.current.items.map((i) => i.id)).toEqual(['nav-top', 'nav-low', 'act-mid']);
  });

  it('maps Command.parameter and wires onSubmit to action(value)', () => {
    const action = vi.fn();
    const commands: Command[] = [
      {
        id: 'rename',
        label: 'Rename',
        parameter: { prompt: 'New name', placeholder: 'name' },
        action,
      },
    ];

    function useTestHook() {
      useRegisterCommands(commands);
      return useCommandPaletteItems();
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    const item = result.current.items[0];
    expect(item.parameter).toEqual({ prompt: 'New name', placeholder: 'name' });
    expect(item.onSubmit).toBeTypeOf('function');

    act(() => {
      item.onSubmit!('confirmed-value');
    });
    expect(action).toHaveBeenCalledWith('confirmed-value');
  });
});

// ---------------------------------------------------------------------------
// Command sources (async sectioned providers)
// ---------------------------------------------------------------------------

describe('useCommandPaletteItems -- command sources', () => {
  function useSourcedHook(source: CommandSource) {
    useRegisterCommandSource(source);
    return useCommandPaletteItems();
  }

  it('merges debounced source results as a section (source label = group)', async () => {
    vi.useFakeTimers();
    const rows: CommandSourceItem[] = [
      { id: 'doc-1', label: 'Quarterly report', action: vi.fn() },
      { id: 'doc-2', label: 'Budget sheet', action: vi.fn() },
    ];
    const search = vi.fn(async (_query: string) => rows);
    const source: CommandSource = { id: 'documents', label: 'Documents', debounceMs: 100, search };

    const { result } = renderHook(() => useSourcedHook(source), { wrapper: Wrapper });

    act(() => {
      result.current.onSearch('rep');
    });
    // Debounce window: not consulted yet.
    expect(search).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0][0]).toBe('rep');
    const docItems = result.current.items.filter((i) => i.group === 'Documents');
    expect(docItems.map((i) => i.id)).toEqual(['doc-1', 'doc-2']);
  });

  it('selecting a source row runs its action', async () => {
    vi.useFakeTimers();
    const rowAction = vi.fn();
    const source: CommandSource = {
      id: 'documents',
      label: 'Documents',
      debounceMs: 50,
      search: async () => [{ id: 'doc-1', label: 'Quarterly report', action: rowAction }],
    };

    const { result } = renderHook(() => useSourcedHook(source), { wrapper: Wrapper });

    act(() => {
      result.current.onSearch('rep');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    act(() => {
      result.current.items.find((i) => i.id === 'doc-1')!.onSelect();
    });
    expect(rowAction).toHaveBeenCalledTimes(1);
  });

  it('does not consult a source below its minQuery', async () => {
    vi.useFakeTimers();
    const search = vi.fn(async () => []);
    const source: CommandSource = { id: 'documents', label: 'Documents', minQuery: 3, debounceMs: 10, search };

    const { result } = renderHook(() => useSourcedHook(source), { wrapper: Wrapper });

    act(() => {
      result.current.onSearch('re');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(search).not.toHaveBeenCalled();
  });

  it('aborts the superseded request on the next keystroke and drops its late results', async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const resolvers: Array<(rows: CommandSourceItem[]) => void> = [];
    const search = vi.fn((query: string, signal: AbortSignal) => {
      signals.push(signal);
      return new Promise<CommandSourceItem[]>((resolve) => {
        resolvers.push(resolve);
      });
    });
    const source: CommandSource = { id: 'documents', label: 'Documents', debounceMs: 10, search };

    const { result } = renderHook(() => useSourcedHook(source), { wrapper: Wrapper });

    act(() => {
      result.current.onSearch('a');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(signals[0].aborted).toBe(false);

    // Next keystroke aborts the in-flight request immediately.
    act(() => {
      result.current.onSearch('ab');
    });
    expect(signals[0].aborted).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(search).toHaveBeenCalledTimes(2);

    // A late resolution from the aborted request must never surface.
    await act(async () => {
      resolvers[0]([{ id: 'stale-row', label: 'Stale', action: vi.fn() }]);
      await Promise.resolve();
    });
    expect(result.current.items.find((i) => i.id === 'stale-row')).toBeUndefined();

    // The live request still lands.
    await act(async () => {
      resolvers[1]([{ id: 'fresh-row', label: 'Fresh', action: vi.fn() }]);
      await Promise.resolve();
    });
    expect(result.current.items.find((i) => i.id === 'fresh-row')).toBeDefined();
  });

  it('renders an honest per-section error row when a source fails', async () => {
    vi.useFakeTimers();
    const source: CommandSource = {
      id: 'documents',
      label: 'Documents',
      debounceMs: 10,
      search: async () => {
        throw new Error('backend unreachable');
      },
    };

    const { result } = renderHook(() => useSourcedHook(source), { wrapper: Wrapper });

    act(() => {
      result.current.onSearch('rep');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });

    const errorRow = result.current.items.find((i) => i.kind === 'error');
    expect(errorRow).toBeDefined();
    expect(errorRow!.group).toBe('Documents');
    expect(errorRow!.label).toContain("Couldn't search Documents");
    expect(errorRow!.description).toBe('backend unreachable');
    expect(errorRow!.disabled).toBe(true);
  });

  it('clears source sections when the query empties', async () => {
    vi.useFakeTimers();
    const source: CommandSource = {
      id: 'documents',
      label: 'Documents',
      debounceMs: 10,
      search: async () => [{ id: 'doc-1', label: 'Report', action: vi.fn() }],
    };

    const { result } = renderHook(() => useSourcedHook(source), { wrapper: Wrapper });

    act(() => {
      result.current.onSearch('rep');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(result.current.items.some((i) => i.group === 'Documents')).toBe(true);

    act(() => {
      result.current.onSearch('');
    });
    expect(result.current.items.some((i) => i.group === 'Documents')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Frecency ranking + persistence
// ---------------------------------------------------------------------------

describe('useCommandPaletteItems -- frecency', () => {
  const RANK_COMMANDS: Command[] = [
    { id: 'alpha', label: 'Alpha', category: 'Actions', action: vi.fn() },
    { id: 'bravo', label: 'Bravo', category: 'Actions', action: vi.fn() },
    { id: 'charlie', label: 'Charlie', category: 'Actions', action: vi.fn() },
  ];

  it('ranks used commands first within their section (injected clock)', () => {
    let currentTime = 1_700_000_000_000;
    const clock = () => currentTime;

    function useTestHook() {
      useRegisterCommands(RANK_COMMANDS);
      return useCommandPaletteItems({ clock });
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    expect(result.current.items.map((i) => i.id)).toEqual(['alpha', 'bravo', 'charlie']);

    act(() => {
      result.current.items.find((i) => i.id === 'charlie')!.onSelect();
    });
    currentTime += 1000;
    act(() => {
      result.current.recordCommandUse('bravo');
    });
    act(() => {
      result.current.recordCommandUse('bravo');
    });

    // bravo (2 uses) > charlie (1 use) > alpha (0 uses).
    expect(result.current.items.map((i) => i.id)).toEqual(['bravo', 'charlie', 'alpha']);
  });

  it('persists usage through the layout-preference storage mechanism', () => {
    const clock = () => 1_700_000_000_000;

    function useTestHook() {
      useRegisterCommands(RANK_COMMANDS);
      return useCommandPaletteItems({ clock });
    }

    const { result, unmount } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    act(() => {
      result.current.recordCommandUse('charlie');
    });
    // The layout-preference hook flushes its debounced write on unmount.
    unmount();

    const raw = window.localStorage.getItem('ds-layout-command-palette');
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw as string);
    expect(stored.commandUsage.charlie).toEqual({ score: 1, lastUsedAt: 1_700_000_000_000 });
  });

  it('rehydrates persisted usage into the initial ranking', async () => {
    // Seed storage exactly as the layout-preference mechanism writes it.
    window.localStorage.setItem(
      'ds-layout-command-palette',
      JSON.stringify({ commandUsage: { bravo: { score: 5, lastUsedAt: 1_700_000_000_000 } } }),
    );
    const clock = () => 1_700_000_100_000;

    function useTestHook() {
      useRegisterCommands(RANK_COMMANDS);
      return useCommandPaletteItems({ clock });
    }

    const { result } = renderHook(() => useTestHook(), { wrapper: Wrapper });

    // Hydration happens in a mount effect; renderHook flushes effects.
    expect(result.current.items.map((i) => i.id)).toEqual(['bravo', 'alpha', 'charlie']);
  });

  it('scopes storage by the usageKey option', () => {
    const clock = () => 1_700_000_000_000;

    function useTestHook() {
      useRegisterCommands(RANK_COMMANDS);
      return useCommandPaletteItems({ clock, usageKey: 'admin-palette' });
    }

    const { result, unmount } = renderHook(() => useTestHook(), { wrapper: Wrapper });
    act(() => {
      result.current.recordCommandUse('alpha');
    });
    unmount();

    expect(window.localStorage.getItem('ds-layout-admin-palette')).not.toBeNull();
    expect(window.localStorage.getItem('ds-layout-command-palette')).toBeNull();
  });
});
