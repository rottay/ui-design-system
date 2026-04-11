'use client';

/**
 * @fileoverview Bridge hook: Command registry -> CommandPalette items.
 *
 * Converts `Command[]` from `useCommands()` into `CommandItem[]` that
 * `PatternCommandPalette` accepts as its `items` prop. Also provides an
 * `onSearch` callback that delegates to the registry's fuzzy search.
 *
 * This hook is the canonical integration point between the command registry
 * system (`hooks/commands`) and the command palette UI (`patterns/navigation/
 * command-palette`). Without it, apps must manually map Command -> CommandItem.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [open, setOpen] = useState(false);
 *   const { items, onSearch } = useCommandPaletteItems();
 *
 *   return (
 *     <PatternCommandPalette
 *       open={open}
 *       onOpenChange={setOpen}
 *       items={items}
 *       onSearch={onSearch}
 *     />
 *   );
 * }
 * ```
 */

import { useState, useMemo, useCallback } from 'react';
import { useCommands } from '..';
// CommandItem is re-exported from the pattern barrel, so this path is stable.
import type { CommandItem } from '../../../components/patterns/navigation/command-palette/CommandPalette.types';

/**
 * Return type for `useCommandPaletteItems`.
 */
export interface UseCommandPaletteItemsReturn {
  /** Command items ready to pass to `PatternCommandPalette.items`. */
  items: CommandItem[];
  /** Search callback ready to pass to `PatternCommandPalette.onSearch`. */
  onSearch: (query: string) => void;
}

/**
 * Bridge hook that converts the command registry into CommandPalette props.
 *
 * Reads all registered commands via `useCommands()`, maps each `Command`
 * to a `CommandItem`, and exposes a search handler that filters via the
 * registry's built-in fuzzy search.
 *
 * Requires `CommandRegistryProvider` in the component tree (included in
 * `DesignSystemProvider` by default).
 */
export function useCommandPaletteItems(): UseCommandPaletteItemsReturn {
  const { commands, search } = useCommands();
  const [query, setQuery] = useState('');

  const sourceCommands = query ? search(query) : commands;

  const items = useMemo<CommandItem[]>(
    () =>
      sourceCommands.map((cmd) => ({
        id: cmd.id,
        label: cmd.label,
        description: cmd.description,
        icon: cmd.icon,
        shortcut: cmd.shortcut,
        group: cmd.category,
        onSelect: () => { cmd.action(); },
        disabled: cmd.when ? !cmd.when() : false,
      })),
    [sourceCommands],
  );

  const onSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return { items, onSearch };
}
