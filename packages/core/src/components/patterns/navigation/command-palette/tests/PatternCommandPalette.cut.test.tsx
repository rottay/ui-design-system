/**
 * WO-FAM-11 sub-lot D -- the `command-palette` cut.
 *
 * What the family-cut gate measures statically, this suite measures on the
 * rendered tree: the anatomy the skin selects, the state decided once, the
 * loading surface drawn by the shared renderer rather than by hand, and the
 * caller's runtime measure travelling as a channel instead of as paint.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernCommandPalette from '../engines/modern';
import type { CommandPaletteProps } from '../contracts';
import { SKELETON_PART_ROLES } from '../../../../primitives/feedback/skeleton/runtime/anatomy-renderer';
import { commandPaletteChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/command-palette';
import { renderWithEngine } from '@tests/support/engine';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/command-palette/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

function props(overrides: Partial<CommandPaletteProps> = {}): CommandPaletteProps {
  return {
    open: true,
    onOpenChange: () => undefined,
    items: [
      { id: 'a', label: 'Open report', group: 'Actions', onSelect: () => undefined },
      { id: 'b', label: 'Archive', group: 'Actions', shortcut: 'ctrl+e', onSelect: () => undefined },
    ],
    ...overrides,
  };
}

describe('command-palette cut -- the namespace', () => {
  it('reads its own channel for every paint decision the skin still owns', () => {
    const read = new Set(
      [...SKIN.matchAll(/var\(\s*(--ds-command-palette-[a-z0-9-]+)\s*,/g)].map((m) => m[1]!),
    );
    // Two names the theme root produces and this family only CONSUMES.
    read.delete('--ds-command-palette-border');
    expect([...read].sort()).toEqual([...commandPaletteChromeDeriver.produces].sort());
  });

  it('hands the chamber measure to the composed Modal through its own channel', () => {
    // The family used to author `max-inline-size` at a specificity the modal
    // skin's own surface rule outranked, so the rule never applied.
    expect(SKIN).toContain('--ds-modal-max-inline-size: var(--ds-command-palette-max-inline-size');
    expect(SKIN).not.toContain("[data-part='surface']");
  });
});

describe('command-palette cut -- the anatomy and the state', () => {
  it('stamps the kernel state on the row instead of leaving `:hover` to decide it', async () => {
    renderWithEngine(<ModernCommandPalette {...props()} />, 'modern');
    const row = (await screen.findByText('Open report')).closest("[data-part='item']");
    expect(row).not.toBeNull();
    // `partAttributes` renders no `data-state` at rest -- an empty attribute
    // would match `[data-state]` and light a resting row.
    expect(row!.hasAttribute('data-state')).toBe(false);
    expect(SKIN).toContain("[data-state~='hovered'], :hover");
  });

  it('carries the caller measure as a custom property, never as paint', async () => {
    renderWithEngine(<ModernCommandPalette {...props({ maxHeight: 320 })} />, 'modern');
    const list = await screen.findByRole('listbox');
    expect(list.getAttribute('style')).toBe(
      '--ds-command-palette-list-max-block-size: 320px;',
    );
  });

  it('accepts a stated measure verbatim when the caller states units', async () => {
    renderWithEngine(<ModernCommandPalette {...props({ maxHeight: '50dvh' })} />, 'modern');
    const list = await screen.findByRole('listbox');
    expect(list.getAttribute('style')).toContain('50dvh');
  });
});

describe('command-palette cut -- the loading surface', () => {
  it('draws the loading state with the shared renderer, not a hand-made skeleton', async () => {
    renderWithEngine(<ModernCommandPalette {...props({ loading: true })} />, 'modern');
    const list = await screen.findByRole('listbox');
    expect(list.querySelector('.ds-skeleton-anatomy')).not.toBeNull();
    expect(list.querySelector("[data-part^='skeleton-']")).toBeNull();
    expect(screen.queryByText('Open report')).toBeNull();
  });

  it('feeds the renderer the real row anatomy, and names the one part still owed a role', async () => {
    renderWithEngine(<ModernCommandPalette {...props({ loading: true })} />, 'modern');
    const source = (await screen.findByRole('listbox')).querySelector(
      "[data-part='source']",
    );
    const parts = [
      ...new Set(
        [...source!.querySelectorAll('[data-part]')].map((node) =>
          node.getAttribute('data-part')!,
        ),
      ),
    ].sort();
    expect(parts).toEqual(['description', 'item', 'item-main', 'item-text', 'label']);

    // `SKELETON_PART_ROLES` is the shared renderer's singleton vocabulary and
    // outside this lot's write set, so the missing roles are ROUTED, not
    // invented here. This assertion is the routing slip: it fails the day the
    // DT adds them, and the family's pin comes off with it.
    const unroled = parts.filter((part) => !(part in SKELETON_PART_ROLES));
    expect(unroled).toEqual(['item-main', 'item-text']);
  });

  it('names its loading state in the governed `data-state` vocabulary', async () => {
    renderWithEngine(<ModernCommandPalette {...props({ loading: true })} />, 'modern');
    const content = (await screen.findByRole('listbox')).closest("[data-part='content']");
    expect(content!.getAttribute('data-state')).toBe('loading');
    expect(content!.hasAttribute('data-loading')).toBe(false);
  });
});
