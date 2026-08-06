import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dropdown as ModernDropdown } from '../engines/modern';

const MENU = {
  items: [
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
  ],
};

afterEach(() => cleanup());

describe('Dropdown modern engine — ArrowDown/ArrowUp enter an already-open menu', () => {
  it('moves focus to the first item when the menu was already opened by pointer', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    trigger.focus();
    const first = await screen.findByRole('menuitem', { name: 'Edit' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(document.activeElement).toBe(trigger);

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(document.activeElement).toBe(first);
  });

  it('moves focus to the last item on ArrowUp in the same state', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    trigger.focus();
    const last = await screen.findByRole('menuitem', { name: 'Delete' });

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });

    expect(document.activeElement).toBe(last);
  });

  it('does not re-announce an open state that never changed', async () => {
    const onOpenChange = vi.fn();
    render(
      <ModernDropdown trigger={['click']} menu={MENU} onOpenChange={onOpenChange}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    trigger.focus();
    await screen.findByRole('menuitem', { name: 'Edit' });
    onOpenChange.mockClear();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('still opens a closed menu onto its first item', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const first = await screen.findByRole('menuitem', { name: 'Edit' });
    expect(document.activeElement).toBe(first);
  });
});
