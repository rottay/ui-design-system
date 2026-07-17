import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  CommandRegistryProvider,
  useRegisterCommands,
  type Command,
} from '@/infrastructure/runtime/application/commands/runtime/registry';
import { useCommandPaletteItems } from '..';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <CommandRegistryProvider>{children}</CommandRegistryProvider>;
}

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
});
