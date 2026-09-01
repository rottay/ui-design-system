// The menu must join the shared overlay stack so Escape reaches the menu and not an
// enclosing dialog; submenus then peel exactly one layer per Escape.
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dropdown as ModernDropdown } from '../engines/modern';
import { useOverlayLayer } from '../../../runtime/overlay/layer-stack';

const MENU = {
  items: [
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
  ],
};

const NESTED_MENU = {
  items: [
    { key: 'edit', label: 'Edit' },
    {
      key: 'share',
      label: 'Share',
      children: [
        { key: 'link', label: 'Copy link' },
        { key: 'mail', label: 'Email' },
      ],
    },
  ],
};

// Stands in for any blocking surface already on the stack (Modal, Drawer, Sheet,
// AlertDialog and ConfirmDialog register identically).
function EnclosingBlockingLayer({ onEscape }: { onEscape: () => void }): null {
  useOverlayLayer({
    kind: 'modal',
    active: true,
    modal: true,
    lockScroll: false,
    restoreFocus: false,
    onEscape,
  });
  return null;
}

afterEach(() => cleanup());

describe('Dropdown modern: Escape belongs to the menu, not the surface behind it', () => {
  it('dismisses the menu and leaves the enclosing blocking layer open', async () => {
    const enclosingEscape = vi.fn();
    render(
      <>
        <EnclosingBlockingLayer onEscape={enclosingEscape} />
        <ModernDropdown trigger={['click']} menu={MENU}>
          <button type="button">Actions</button>
        </ModernDropdown>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    await screen.findByRole('menuitem', { name: 'Edit' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(trigger, { key: 'Escape' });

    // The menu took the keystroke...
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // ...and the surface behind it never heard about it.
    expect(enclosingEscape).not.toHaveBeenCalled();
  });

  it('hands Escape back to the enclosing layer once the menu is closed', async () => {
    const enclosingEscape = vi.fn();
    render(
      <>
        <EnclosingBlockingLayer onEscape={enclosingEscape} />
        <ModernDropdown trigger={['click']} menu={MENU}>
          <button type="button">Actions</button>
        </ModernDropdown>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    await screen.findByRole('menuitem', { name: 'Edit' });
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(enclosingEscape).not.toHaveBeenCalled();

    // Second press: the menu has left the stack, so the surface owns it again.
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(enclosingEscape).toHaveBeenCalledTimes(1);
  });

  it('returns focus to the trigger on dismissal', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    const first = await screen.findByRole('menuitem', { name: 'Edit' });
    first.focus();
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });
});

describe('Dropdown modern: one Escape peels one layer', () => {
  it('closes an open submenu before the menu itself', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={NESTED_MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    const share = await screen.findByRole('menuitem', { name: /Share/ });

    fireEvent.keyDown(share, { key: 'ArrowRight' });
    expect(await screen.findByRole('menuitem', { name: 'Copy link' })).toBeInTheDocument();
    expect(share).toHaveAttribute('aria-expanded', 'true');

    // First Escape: the submenu only.
    fireEvent.keyDown(share, { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: 'Copy link' })).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Second Escape: the menu.
    fireEvent.keyDown(share, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
