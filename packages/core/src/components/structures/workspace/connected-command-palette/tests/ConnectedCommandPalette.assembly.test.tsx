/**
 * WO-FAM-11 sub-lot D -- the `connected-command-palette` ASSEMBLY contract.
 *
 * This owner has no skin anywhere and is deliberately absent from the
 * family-cut roster: a family enters the roster when its paint exists, and
 * inventing paint for a composition owner so it could be pinned would be the
 * wrong fix. What it does own is the §5.3 chain --
 *
 *     search-command-bar -> connected-command-palette -> command-palette
 *                                                     -> shortcuts-overlay
 *
 * -- and the keyboard authority at its middle. That is what this suite pins.
 */
import React from 'react';
import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConnectedCommandPalette } from '..';
import { useRegisterCommands } from '@/infrastructure/runtime/application/commands';
import { renderWithEngine } from '@tests/support/engine';

function dispatch(key: string, extra: Partial<KeyboardEventInit> = {}) {
  document.dispatchEvent(
    new (window as unknown as { KeyboardEvent: typeof KeyboardEvent }).KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...extra,
    }),
  );
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('connected-command-palette -- the keyboard owner', () => {
  it('adds no keydown listener of its own: the chord is a registry entry', async () => {
    const added: { type: string; capture: unknown }[] = [];
    const spy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation(((type: string, listener: unknown, options: unknown) => {
        added.push({ type, capture: options });
        return (
          EventTarget.prototype.addEventListener as unknown as (...args: unknown[]) => void
        ).call(document, type, listener, options);
      }) as typeof document.addEventListener);

    try {
      renderWithEngine(<ConnectedCommandPalette />, 'modern');
      await settle();
    } finally {
      spy.mockRestore();
    }

    const keydown = added.filter((entry) => entry.type === 'keydown');
    // Two platform owners, and neither is this component: the shortcut
    // registry's capture-phase listener and the command registry's
    // bubble-phase one for the built-in `?` command. The hand-rolled `mod+k`
    // parser that used to sit here is gone.
    expect(keydown.map((entry) => entry.capture).sort()).toEqual([true, undefined]);
    expect(keydown).toHaveLength(2);
  });

  it('opens the palette on its chord through the registry', async () => {
    renderWithEngine(<ConnectedCommandPalette />, 'modern');
    await settle();

    act(() => {
      dispatch('k', { ctrlKey: true });
    });

    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('honours a caller-stated chord instead of a chord it parsed itself', async () => {
    renderWithEngine(<ConnectedCommandPalette openShortcut="ctrl+j" />, 'modern');
    await settle();

    act(() => {
      dispatch('k', { ctrlKey: true });
    });
    expect(screen.queryByRole('combobox')).toBeNull();

    act(() => {
      dispatch('j', { ctrlKey: true });
    });
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('lists its own open chord in the cheatsheet it populates', async () => {
    renderWithEngine(<ConnectedCommandPalette />, 'modern');
    await settle();

    act(() => {
      dispatch('?');
    });

    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    // The chord is a registry entry now, so the cheatsheet -- which reads the
    // registry -- can finally see it. The hand-rolled listener was invisible.
    expect(dialog).toHaveTextContent('Open the command palette');
  });
});

describe('connected-command-palette -- the assembly', () => {
  function AppCommands() {
    useRegisterCommands([
      {
        id: 'go-home',
        label: 'Go home',
        category: 'Navigation',
        shortcut: 'ctrl+h',
        action: () => undefined,
      },
    ]);
    return null;
  }

  it('feeds the palette pattern from the command registry', async () => {
    renderWithEngine(
      <>
        <AppCommands />
        <ConnectedCommandPalette />
      </>,
      'modern',
    );
    await settle();

    act(() => {
      dispatch('k', { ctrlKey: true });
    });
    expect(await screen.findByText('Go home')).toBeInTheDocument();
  });

  it('feeds the overlay pattern from the same registry, plus the shortcut one', async () => {
    renderWithEngine(
      <>
        <AppCommands />
        <ConnectedCommandPalette />
      </>,
      'modern',
    );
    await settle();

    act(() => {
      dispatch('?');
    });

    const dialog = await screen.findByRole('dialog', { name: 'Keyboard Shortcuts' });
    // One row from the command registry, one from the shortcut registry the
    // composition owner now writes its own chord into.
    expect(dialog).toHaveTextContent('Go home');
    expect(dialog).toHaveTextContent('Open the command palette');
  });
});
