import React from 'react';
import { screen, act, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConnectedCommandPalette } from '..';
import { useRegisterCommands } from '../../../../../infrastructure/runtime/application/commands';
import { ShortcutProvider, useGlobalShortcut } from '../../../../../infrastructure/runtime/application/interaction/shortcuts';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

// ConnectedCommandPalette renders engine-switched children (PatternCommandPalette,
// PatternShortcutsOverlay), so every render must go through renderWithEngine and
// the first query per test must be an async findBy* to let the lazy engine chunk
// resolve. The behavior under test is engine-independent, so a single engine
// ('modern') is sufficient -- this is not an engine-parity test.
function renderPalette(ui: React.ReactElement) {
  return renderWithEngine(ui, 'modern');
}

function dispatchKey(target: Element | Document, key: string, extra: Partial<KeyboardEventInit> = {}) {
  target.dispatchEvent(
    new (window as any).KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra })
  );
}

/**
 * Waits one tick for the lazy engine chunk(s) behind PatternCommandPalette/
 * PatternShortcutsOverlay to resolve, explicitly wrapped in act() so
 * React's Suspense resolution is not flagged as happening outside a test's
 * act() boundary. Only needed in tests that assert ABSENCE right after
 * render (nothing to findBy* on yet) -- tests that immediately query for
 * visible content use findBy*, which wraps this for you.
 */
async function flushEngineLoad() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('ConnectedCommandPalette -- keyboard shortcuts cheatsheet (WO-CRA-03)', () => {
  it('does not render the cheatsheet dialog until opened', async () => {
    renderPalette(<ConnectedCommandPalette />);
    // Let the lazy engine chunk resolve before asserting absence.
    await flushEngineLoad();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('"?" opens the Keyboard Shortcuts cheatsheet', async () => {
    renderPalette(<ConnectedCommandPalette />);
    await flushEngineLoad();

    act(() => {
      dispatchKey(document, '?');
    });

    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    expect(dialog).toBeInTheDocument();
  });

  it('does not open the cheatsheet while typing "?" in an unrelated input (editable-element suppression)', async () => {
    renderPalette(
      <>
        <input data-testid="text-input" />
        <ConnectedCommandPalette />
      </>
    );
    const input = await screen.findByTestId('text-input');

    act(() => {
      input.focus();
    });
    act(() => {
      fireEvent.keyDown(input, { key: '?' });
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lists the built-in "Keyboard shortcuts" command in the palette itself', async () => {
    renderPalette(<ConnectedCommandPalette />);
    await flushEngineLoad();

    // mod+k opens the palette (existing behavior, unaffected by this WO).
    act(() => {
      dispatchKey(document, 'k', { ctrlKey: true });
    });

    expect(await screen.findByText('Keyboard shortcuts')).toBeInTheDocument();
  });

  it('does not crash without a ShortcutProvider ancestor, and the cheatsheet still shows command-registry shortcuts', async () => {
    function AppCommands() {
      useRegisterCommands([
        { id: 'new-ticket', label: 'New ticket', shortcut: 'ctrl+n', category: 'Actions', action: () => {} },
      ]);
      return null;
    }

    expect(() =>
      renderPalette(
        <>
          <AppCommands />
          <ConnectedCommandPalette />
        </>
      )
    ).not.toThrow();

    await flushEngineLoad();
    act(() => {
      dispatchKey(document, '?');
    });

    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    // The command-registry-sourced shortcut appears even with no
    // <ShortcutProvider> mounted -- useRegisteredShortcuts() failed open.
    expect(dialog).toHaveTextContent('New ticket');
    // The cheatsheet's own trigger command also lists itself.
    expect(dialog).toHaveTextContent('Keyboard shortcuts');
  });

  it('merges in ShortcutProvider-registered shortcuts (e.g. a collection pattern j/k/x/enter) alongside command-registry ones', async () => {
    function AppShortcut() {
      useGlobalShortcut({ key: 'j', handler: () => {}, description: 'Next item', category: 'Collection', scope: 'gallery-1' });
      return null;
    }

    renderPalette(
      <ShortcutProvider>
        <AppShortcut />
        <ConnectedCommandPalette />
      </ShortcutProvider>
    );

    await flushEngineLoad();
    act(() => {
      dispatchKey(document, '?');
    });

    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    expect(dialog).toHaveTextContent('Next item');
  });
});
