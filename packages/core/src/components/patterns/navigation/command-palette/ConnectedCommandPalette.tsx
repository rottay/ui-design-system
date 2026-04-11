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
 * Includes a built-in Cmd+K / Ctrl+K keyboard shortcut to open.
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

import { useState, useEffect, useCallback } from 'react';
import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { CommandPaletteProps } from './CommandPalette.types';
import { useCommandPaletteItems } from '../../../../hooks/commands/useCommandPaletteItems';

// Import the engine factory directly instead of through the barrel (index.ts)
// to avoid a circular dependency: index.ts re-exports ConnectedCommandPalette,
// so importing PatternCommandPalette from index.ts would create a cycle.
const PatternCommandPalette = createEngineComponent<CommandPaletteProps>(
  'PatternCommandPalette',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);

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
  /** Footer slot rendered below the command list. */
  footer?: React.ReactNode;
}

/**
 * Registry-backed command palette that auto-populates from
 * `CommandRegistryProvider`. Mounts a Cmd+K listener by default.
 */
export function ConnectedCommandPalette({
  placeholder = 'Type a command or search...',
  emptyMessage = 'No matching commands',
  openShortcut = 'mod+k',
  footer,
}: ConnectedCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const { items, onSearch } = useCommandPaletteItems();

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
      // Suppress in typing contexts
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable) {
        // Still allow Cmd+K even in inputs (standard behavior in VS Code, Linear, etc.)
        // Only check if the shortcut matches
      }

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

  return (
    <PatternCommandPalette
      open={open}
      onOpenChange={handleOpenChange}
      items={items}
      onSearch={onSearch}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
      footer={footer}
    />
  );
}
