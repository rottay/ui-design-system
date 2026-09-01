import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModernContextMenu from '../engines/modern';

const ITEMS = [
  { key: 'open', label: 'Open' },
  {
    key: 'share',
    label: 'Share',
    children: [
      { key: 'link', label: 'Copy link' },
      { key: 'mail', label: 'Send by mail' },
    ],
  },
  { key: 'delete', label: 'Delete', danger: true },
];

function openMenu(): HTMLElement {
  const trigger = screen.getByText('Right-click area');
  fireEvent.contextMenu(trigger);
  return trigger;
}

describe('Modern ContextMenu submenu keyboard contract', () => {
  it('moves focus into the submenu when the forward key expands it', async () => {
    render(
      <ModernContextMenu items={ITEMS} trigger={<div>Right-click area</div>} />,
    );
    openMenu();

    const parent = await screen.findByRole('menuitem', { name: /share/i });
    fireEvent.keyDown(parent, { key: 'ArrowRight' });

    // APG: the forward key opens the submenu AND lands on its first item. The level handler
    // only walks `:scope >` rows, so leaving focus behind strands every child.
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /copy link/i })).toHaveFocus();
    });
  });

  it('closes only the submenu on Escape and returns focus to its parent item', async () => {
    render(
      <ModernContextMenu items={ITEMS} trigger={<div>Right-click area</div>} />,
    );
    openMenu();

    const parent = await screen.findByRole('menuitem', { name: /share/i });
    fireEvent.keyDown(parent, { key: 'ArrowRight' });
    const child = await screen.findByRole('menuitem', { name: /copy link/i });

    fireEvent.keyDown(child, { key: 'Escape' });

    // Only the top layer dismisses: the root menu survives and focus returns
    // to the disclosure that owns the collapsed submenu.
    await waitFor(() => {
      expect(
        screen.queryByRole('menuitem', { name: /copy link/i }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /share/i })).toHaveFocus();
  });

  it('returns focus to the parent item when the backward key collapses the submenu', async () => {
    render(
      <ModernContextMenu items={ITEMS} trigger={<div>Right-click area</div>} />,
    );
    openMenu();

    const parent = await screen.findByRole('menuitem', { name: /share/i });
    fireEvent.keyDown(parent, { key: 'ArrowRight' });
    const child = await screen.findByRole('menuitem', { name: /send by mail/i });

    fireEvent.keyDown(child, { key: 'ArrowLeft' });

    await waitFor(() => {
      expect(
        screen.queryByRole('menuitem', { name: /send by mail/i }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('menuitem', { name: /share/i })).toHaveFocus();
  });
});

describe('Modern ContextMenu dismissal focus ownership', () => {
  it('returns focus to the trigger when an outside pointer dismisses the menu', async () => {
    render(
      <ModernContextMenu items={ITEMS} trigger={<div>Right-click area</div>} />,
    );
    const trigger = openMenu();
    const wrapper = trigger.closest('[data-part="trigger"]') as HTMLElement;

    await screen.findByRole('menu');
    // The open pass focuses the first item; dismissing must not strand that
    // focus on a node React is about to remove (it would fall to <body>).
    expect(screen.getByRole('menuitem', { name: /^open$/i })).toHaveFocus();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
    expect(document.activeElement).toBe(wrapper);
  });
});

describe('Modern ContextMenu disclosure relations', () => {
  it('only points aria-controls at a surface that exists', async () => {
    render(
      <ModernContextMenu
        items={ITEMS}
        trigger={<button type="button">Right-click area</button>}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Right-click area' });
    // Closed: no panel is mounted, so a dangling reference would point at
    // nothing and the expanded state is meaningless.
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.contextMenu(trigger);
    const menu = await screen.findByRole('menu');

    expect(trigger).toHaveAttribute('aria-controls', menu.id);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
