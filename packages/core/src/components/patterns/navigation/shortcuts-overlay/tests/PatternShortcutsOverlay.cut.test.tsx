/**
 * WO-FAM-11 sub-lot D -- the `shortcuts-overlay` cut.
 *
 * The overlay's own namespace, and the keyboard authority it gave up: Escape
 * used to be a document `keydown` listener -- a third owner beside the shortcut
 * registry and the command registry, firing for a dialog the user need not even
 * be focused in. The chamber is now the certified Modal: Escape, the backdrop,
 * the focus trap and focus restore are the primitive's, and the pattern owns
 * no key handler at all.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernShortcutsOverlay from '../engines/modern';
import { shortcutsOverlayChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/shortcuts-overlay';
import { renderWithEngine } from '@tests/support/engine';

const ENGINE = readFileSync(
  resolve(
    process.cwd(),
    'src/components/patterns/navigation/shortcuts-overlay/engines/modern/index.tsx',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

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
    for (const name of read) {
      expect(name, name).not.toMatch(/z-index|inset-block-start|scrim|dialog-radius/);
    }
  });

  it('paints no frame of its own: the chamber is tuned through Modal channels only', () => {
    expect(SKIN).not.toMatch(/\[data-part='(root|backdrop|dialog|surface)'\]/);
    expect(SKIN).not.toMatch(/\.ds-modal\b/);
    const chamber = [...SKIN.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(
      (rule) => rule[1]!.trim() === '.ds-pattern-shortcuts-overlay.ds-engine-modern',
    );
    expect(chamber).toHaveLength(1);
    const declared = chamber[0]![2]!.split(';').map((d) => d.trim()).filter(Boolean);
    expect(declared.length).toBeGreaterThanOrEqual(6);
    for (const declaration of declared) expect(declaration).toMatch(/^--ds-modal-[a-z-]+\s*:/);
  });
});

describe('shortcuts-overlay cut -- the keyboard owner', () => {
  it('owns no key handler and no listener: the chamber is the Modal primitive', () => {
    expect(ENGINE).not.toMatch(/addEventListener|onKeyDown|role=["']dialog["']|aria-modal/);
    expect(ENGINE).toMatch(/<Modal\b/);
  });

  it('adds no keydown listener beyond the two the platform owns', () => {
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

    // The shortcut registry's capture-phase listener that `DesignSystemProvider`
    // mounts, and the overlay kernel's single Escape router. The overlay used
    // to add one of its own.
    expect(added.filter((entry) => entry.type === 'keydown')).toEqual([
      { type: 'keydown', capture: true },
      { type: 'keydown', capture: true },
    ]);
  });

  it('dismisses on Escape through the Modal chamber', async () => {
    const onOpenChange = vi.fn();
    renderWithEngine(
      <ModernShortcutsOverlay open onOpenChange={onOpenChange} shortcuts={SHORTCUTS} />,
      'modern',
    );

    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    expect(dialog.tagName).toBe('DIALOG');
    // Escape reaches a native modal dialog as its `cancel` event.
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dismisses on a backdrop click, and not on a click inside the surface', async () => {
    const onOpenChange = vi.fn();
    renderWithEngine(
      <ModernShortcutsOverlay open onOpenChange={onOpenChange} shortcuts={SHORTCUTS} />,
      'modern',
    );

    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    fireEvent.click(dialog.querySelector('[data-part="header"]')!);
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(dialog);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('lands focus on the search box when it opens', async () => {
    renderWithEngine(
      <ModernShortcutsOverlay open onOpenChange={() => undefined} shortcuts={SHORTCUTS} />,
      'modern',
    );

    const search = await screen.findByRole('textbox', { name: 'Search shortcuts...' });
    await waitFor(() => expect(document.activeElement).toBe(search));
  });

  it('opens from a closed mount when its trigger flips `open`', async () => {
    const view = renderWithEngine(
      <ModernShortcutsOverlay open={false} onOpenChange={() => undefined} shortcuts={SHORTCUTS} />,
      'modern',
    );
    expect(screen.queryByRole('dialog')).toBeNull();

    view.rerender(
      <ModernShortcutsOverlay open onOpenChange={() => undefined} shortcuts={SHORTCUTS} />,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    expect(dialog).toHaveTextContent('Open the command palette');
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

    await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    // The page behind a modal chamber is inert, so the button is out of the
    // accessibility tree; it is still the node a stray key event targets.
    const outside = await screen.findByText('outside');
    fireEvent.keyDown(outside, { key: 'Escape' });
    // The old document listener closed the dialog from anywhere on the page.
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
