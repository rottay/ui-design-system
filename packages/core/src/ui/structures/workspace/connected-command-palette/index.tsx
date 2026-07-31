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
 * Includes a built-in Cmd+K / Ctrl+K keyboard shortcut to open, and a
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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCommands, useRegisterCommands } from '@/infrastructure/runtime/application/commands';
import { useRegisteredShortcuts } from '@/infrastructure/runtime/application/interaction/shortcuts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { PatternCommandPalette } from '@/ui/patterns/navigation/command-palette';
import { useCommandPaletteItems } from '@/ui/patterns/navigation/command-palette/runtime/application-commands';
import { PatternShortcutsOverlay } from '@/ui/patterns/navigation/shortcuts-overlay';
import type { ShortcutDisplayItem } from '@/ui/patterns/navigation/shortcuts-overlay';

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
 * `CommandRegistryProvider`. Mounts a Cmd+K listener by default, and a
 * built-in "Keyboard shortcuts" command/`?` listener that opens a cheatsheet
 * of every registered shortcut.
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

  // Cmd+K / Ctrl+K to toggle
  useEffect(() => {
    const parts = openShortcut.split('+').map((p) => p.trim().toLowerCase());
    const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.userAgent);

    function handleKeyDown(e: KeyboardEvent) {
      // Typing-context law: mod+key chords fire even inside inputs (the VS
      // Code / Linear standard), so no editable suppression happens here.
      // Single-character shortcuts like the `?` cheatsheet key are a
      // different story — those are suppressed by the command registry's
      // own editable-aware listener (see useRegisterCommands above and the
      // pinned "does not open the cheatsheet while typing" test).
      let wantsMeta = false;
      let wantsCtrl = false;
      let mainKey = '';

      for (const part of parts) {
        switch (part) {
          case 'mod':
            if (isMac) wantsMeta = true;
            else wantsCtrl = true;
            break;
          case 'meta':
          case 'cmd':
            wantsMeta = true;
            break;
          case 'ctrl':
            wantsCtrl = true;
            break;
          default:
            mainKey = part;
        }
      }

      if (
        e.key.toLowerCase() === mainKey &&
        e.metaKey === wantsMeta &&
        e.ctrlKey === wantsCtrl &&
        !e.altKey
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openShortcut]);

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
