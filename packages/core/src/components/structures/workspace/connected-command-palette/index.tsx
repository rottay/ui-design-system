'use client';

/**
 * @fileoverview ConnectedCommandPalette — registry-backed command palette.
 *
 * Thin wrapper around `PatternCommandPalette` that reads commands from the
 * global `CommandRegistryProvider` via `useCommandPaletteItems()`.
 *
 * This is the canonical integrated entry point. Apps that want full control
 * over the items array can still use `PatternCommandPalette` directly.
 *
 * Includes a built-in Cmd+K / Ctrl+K shortcut to open -- registered with the
 * package's single keyboard owner, `ShortcutProvider`, which
 * `DesignSystemProvider` mounts -- and a
 * built-in "Keyboard shortcuts" command (default `?`) that opens the
 * `PatternShortcutsOverlay` cheatsheet, populated from every command with a
 * `shortcut` field (via `useCommands`) plus, when the app has also mounted
 * `<ShortcutProvider>`, every `useGlobalShortcut`/scoped registration (via
 * `useRegisteredShortcuts`, which is safe to call either way -- see
 * hooks/shortcuts).
 *
 * @example
 * ```tsx
 * // App registers commands anywhere in the tree:
 * useRegisterCommands([
 *   { id: 'go-home', label: 'Go to Home', category: 'Navigation', action: () => navigate('/') },
 *   { id: 'new-item', label: 'New Item', category: 'Actions', shortcut: 'ctrl+n', action: () => open() },
 * ]);
 *
 * // ConnectedCommandPalette picks them up automatically:
 * <ConnectedCommandPalette />
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import { useCommands, useRegisterCommands } from '@/infrastructure/runtime/application/commands';
import {
  useGlobalShortcut,
  useHasShortcutProvider,
  useRegisteredShortcuts,
} from '@/infrastructure/runtime/application/interaction/shortcuts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { PatternCommandPalette } from '@/components/patterns/navigation/command-palette';
import { useCommandPaletteItems } from '@/components/patterns/navigation/command-palette/runtime/application-commands';
import { PatternShortcutsOverlay } from '@/components/patterns/navigation/shortcuts-overlay';
import type { ShortcutDisplayItem } from '@/components/patterns/navigation/shortcuts-overlay';

/**
 * Registers the palette's open chord with the ONE keyboard owner.
 *
 * It is a component rather than a call in the body because
 * `useGlobalShortcut` throws without a `<ShortcutProvider>` ancestor, and the
 * caller decides whether one is there -- the sanctioned opt-in shape
 * `useHasShortcutProvider` documents.
 */
function PaletteOpenShortcut({
  chord,
  description,
  category,
  onOpen,
}: {
  chord: string;
  description: string;
  category: string;
  onOpen: () => void;
}) {
  useGlobalShortcut({ key: chord, handler: onOpen, description, category });
  return null;
}

export interface ConnectedCommandPaletteProps {
  /** Placeholder text for the search input. */
  placeholder?: string;
  /** Message shown when no commands match the search query. */
  emptyMessage?: string;
  /**
   * Keyboard shortcut to open the palette.
   * @default 'mod+k' (Cmd+K on Mac, Ctrl+K elsewhere)
   */
  openShortcut?: string;
  /**
   * Keyboard shortcut that opens the "Keyboard shortcuts" cheatsheet.
   * @default '?'
   */
  shortcutsOverlayKey?: string;
  /** Footer slot rendered below the command list. */
  footer?: React.ReactNode;
}

/**
 * Registry-backed command palette that auto-populates from
 * `CommandRegistryProvider`. Registers its open chord with `ShortcutProvider`,
 * and a built-in "Keyboard shortcuts" command/`?` listener that opens a
 * cheatsheet of every registered shortcut.
 */
export function ConnectedCommandPalette({
  placeholder,
  emptyMessage,
  openShortcut = 'mod+k',
  shortcutsOverlayKey = '?',
  footer,
}: ConnectedCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [shortcutsOverlayOpen, setShortcutsOverlayOpen] = useState(false);
  const { items, onSearch } = useCommandPaletteItems();
  const i18n = useOptionalTranslation('components');
  /**
   * Catalog lookup with an honest English floor: when the provider is absent
   * or echoes the raw key (missing entry), the historical default wins.
   */
  const tOr = useCallback(
    (key: string, fallback: string): string => {
      const resolved = i18n?.t(key);
      if (resolved === undefined || resolved === key || resolved === `components.${key}`) {
        return fallback;
      }
      return resolved;
    },
    [i18n],
  );
  const resolvedPlaceholder =
    placeholder ?? tOr('connectedCommandPalette.placeholder', 'Type a command or search...');
  const resolvedEmptyMessage =
    emptyMessage ?? tOr('connectedCommandPalette.emptyMessage', 'No matching commands');

  // Close palette and execute the selected command
  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset search when closing
      onSearch('');
    }
  }, [onSearch]);

  // The open chord belongs to the ONE keyboard owner. This component used to
  // parse `mod+k` itself and hold a document `keydown` listener -- a third
  // keyboard authority beside the shortcut registry and the command registry,
  // with its own platform detection, its own modifier table and its own
  // editable-element policy. It now registers with `ShortcutProvider`, which
  // `DesignSystemProvider` mounts, so the chord also appears in the cheatsheet
  // it populates.
  //
  // MEASURED CONSEQUENCE, stated rather than hidden: the registry suppresses
  // every shortcut while focus is in a text field, and the open palette's own
  // search box IS one. The chord therefore OPENS the palette and no longer
  // toggles it shut; Escape, the backdrop and the close control dismiss it, as
  // they already did. Restoring a typing-context exemption means a flag on
  // `ShortcutDefinition`, which is the shortcut kernel's singleton contract and
  // outside this lot.
  const hasShortcutProvider = useHasShortcutProvider();
  const openPalette = useCallback(() => setOpen(true), []);

  // Built-in "Keyboard shortcuts" command: palette-searchable (via
  // useCommandPaletteItems, above) AND fires on `shortcutsOverlayKey` via
  // the command registry's own bubble-phase, editable-suppressed listener
  // (see the application command runtime) -- no ShortcutProvider dependency.
  useRegisterCommands([
    {
      id: 'ds-keyboard-shortcuts',
      label: tOr('connectedCommandPalette.keyboardShortcuts', 'Keyboard shortcuts'),
      description: tOr('connectedCommandPalette.keyboardShortcutsDescription', 'View all keyboard shortcuts'),
      category: tOr('connectedCommandPalette.helpCategory', 'Help'),
      shortcut: shortcutsOverlayKey,
      action: () => setShortcutsOverlayOpen(true),
    },
  ]);

  const { commands } = useCommands();
  // Safe without a <ShortcutProvider> ancestor -- returns [] rather than
  // throwing. Merges in any app-level
  // useGlobalShortcut/ShortcutScope registrations (e.g. a collection
  // pattern's opt-in j/k/x/enter) alongside the command registry's own
  // shortcut-bound commands, so the cheatsheet reflects both registries
  // when both are in use.
  const registeredShortcuts = useRegisteredShortcuts();

  const shortcutDisplayItems = useMemo<ShortcutDisplayItem[]>(() => {
    const fromCommands = commands
      .filter((cmd) => cmd.shortcut)
      .map((cmd) => ({
        key: cmd.shortcut as string,
        description: cmd.label,
        category: cmd.category ?? tOr('connectedCommandPalette.commandsCategory', 'Commands'),
      }));
    // Group by scope when a shortcut has no explicit category, so scoped
    // registrations (e.g. "Collection", per-gallery scope ids) don't all
    // collapse into "General".
    const fromRegistry = registeredShortcuts.map((s) => ({
      key: s.key,
      description: s.description,
      category: s.category ?? s.scope ?? tOr('connectedCommandPalette.globalCategory', 'Global'),
    }));

    const seen = new Set<string>();
    return [...fromCommands, ...fromRegistry].filter((item) => {
      const dedupeKey = `${item.key}::${item.description}`;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });
  }, [commands, registeredShortcuts, tOr]);

  return (
    <>
      {hasShortcutProvider && (
        <PaletteOpenShortcut
          chord={openShortcut}
          description={tOr('connectedCommandPalette.openPalette', 'Open the command palette')}
          category={tOr('connectedCommandPalette.globalCategory', 'Global')}
          onOpen={openPalette}
        />
      )}
      <PatternCommandPalette
        open={open}
        onOpenChange={handleOpenChange}
        items={items}
        onSearch={onSearch}
        placeholder={resolvedPlaceholder}
        emptyMessage={resolvedEmptyMessage}
        footer={footer}
      />
      <PatternShortcutsOverlay
        open={shortcutsOverlayOpen}
        onOpenChange={setShortcutsOverlayOpen}
        shortcuts={shortcutDisplayItems}
        title={tOr('connectedCommandPalette.shortcutsOverlayTitle', 'Keyboard Shortcuts')}
      />
    </>
  );
}
