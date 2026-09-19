/**
 * WO-FAM-11 sub-lot D -- the `shortcuts-overlay` cut.
 *
 * The overlay's own namespace, and the keyboard authority it gave up: Escape
 * used to be a document `keydown` listener -- a third owner beside the shortcut
 * registry and the command registry, firing for a dialog the user need not even
 * be focused in. It is now the chamber's own decision.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernShortcutsOverlay from '../engines/modern';
import { shortcutsOverlayChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/shortcuts-overlay';
import { renderWithEngine } from '@tests/support/engine';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/runtime/engines/modern/skin/shortcuts-overlay/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const SHORTCUTS = [
  { key: 'ctrl+k', description: 'Open the command palette', category: 'Navigation' },
  { key: 'ctrl+s', description: 'Save changes', category: 'Editing' },
];

describe('shortcuts-overlay cut -- the namespace', () => {
  it('reads its own channel for every paint decision, and produces each one', () => {
    const read = new Set(
      [...SKIN.matchAll(/var\(\s*(--ds-shortcuts-overlay-[a-z0-9-]+)\s*,/g)].map((m) => m[1]!),
    );
    expect([...read].sort()).toEqual([...shortcutsOverlayChromeDeriver.produces].sort());
  });
});

describe('shortcuts-overlay cut -- the keyboard owner', () => {
  it('adds no keydown listener beyond the one the platform registry owns', () => {
    const added: { type: string; capture: unknown }[] = [];
    const spy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation(((type: string, listener: unknown, options: unknown) => {
        added.push({ type, capture: options });
        return (
          EventTarget.prototype.addEventListener as unknown as (
            ...args: unknown[]
          ) => void
        ).call(document, type, listener, options);
      }) as typeof document.addEventListener);

    try {
      renderWithEngine(
        <ModernShortcutsOverlay open onOpenChange={() => undefined} shortcuts={SHORTCUTS} />,
        'modern',
      );
    } finally {
      spy.mockRestore();
    }

    // Exactly one, and it is the shortcut registry's capture-phase listener
    // that `DesignSystemProvider` mounts. The overlay used to add a second.
    expect(added.filter((entry) => entry.type === 'keydown')).toEqual([
      { type: 'keydown', capture: true },
    ]);
  });

  it('dismisses on Escape from inside the chamber', async () => {
    const onOpenChange = vi.fn();
    renderWithEngine(
      <ModernShortcutsOverlay open onOpenChange={onOpenChange} shortcuts={SHORTCUTS} />,
      'modern',
    );

    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('leaves an Escape that never reaches the chamber alone', async () => {
    const onOpenChange = vi.fn();
    renderWithEngine(
      <>
        <button type="button">outside</button>
        <ModernShortcutsOverlay open onOpenChange={onOpenChange} shortcuts={SHORTCUTS} />
      </>,
      'modern',
    );

    const outside = await screen.findByRole('button', { name: 'outside' });
    fireEvent.keyDown(outside, { key: 'Escape' });
    // The old document listener closed the dialog from anywhere on the page.
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
