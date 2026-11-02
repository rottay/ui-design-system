import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const TRAILING_DISABLED_MENU = {
  items: [
    { key: 'edit', label: 'Edit' },
    { key: 'archive', label: 'Archive' },
    { key: 'delete', label: 'Delete', disabled: true },
  ],
};

const SINGLE_MENU = { items: [{ key: 'edit', label: 'Edit' }] };

const ALL_DISABLED_MENU = {
  items: [
    { key: 'edit', label: 'Edit', disabled: true },
    { key: 'delete', label: 'Delete', disabled: true },
  ],
};

describe('Dropdown modern engine — keyboard edges over the enabled items', () => {
  it('opens a closed portaled menu onto its last item on ArrowUp', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={MENU} getPopupContainer={() => document.body}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });

    const last = await screen.findByRole('menuitem', { name: 'Delete' });
    expect(last.closest('[data-part="surface"]')).toHaveAttribute('data-portaled', 'true');
    await waitFor(() => expect(document.activeElement).toBe(last));
  });

  it('opens a closed portaled menu onto its first item on ArrowDown', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={MENU} getPopupContainer={() => document.body}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const first = await screen.findByRole('menuitem', { name: 'Edit' });
    expect(first.closest('[data-part="surface"]')).toHaveAttribute('data-portaled', 'true');
    await waitFor(() => expect(document.activeElement).toBe(first));
  });

  it('skips a trailing disabled item when ArrowUp enters an open menu', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={TRAILING_DISABLED_MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    trigger.focus();
    const lastEnabled = await screen.findByRole('menuitem', { name: 'Archive' });
    expect(document.activeElement).toBe(trigger);

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });

    expect(document.activeElement).toBe(lastEnabled);
  });

  it('lands on the only enabled item from both directions', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={SINGLE_MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    trigger.focus();
    const only = await screen.findByRole('menuitem', { name: 'Edit' });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(only);

    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(only);
  });

  it('keeps focus on the trigger when an open menu has no enabled item', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={ALL_DISABLED_MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    trigger.focus();
    expect(await screen.findAllByRole('menuitem')).toHaveLength(2);

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(trigger);

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('falls through to an open request when an open menu has no enabled item', async () => {
    const onOpenChange = vi.fn();
    render(
      <ModernDropdown trigger={['click']} menu={ALL_DISABLED_MENU} onOpenChange={onOpenChange}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    trigger.focus();
    await screen.findAllByRole('menuitem');
    onOpenChange.mockClear();

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe('Dropdown modern engine — a keyboard edge never outlives its open', () => {
  it('drops an edge whose surface never mounted before a later pointer open', async () => {
    const { rerender } = render(
      <ModernDropdown trigger={['click']} menu={{ items: [] }}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <ModernDropdown trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );
    fireEvent.click(trigger);
    await screen.findByRole('menuitem', { name: 'Edit' });

    expect(document.activeElement).toBe(trigger);
  });

  it('consumes a mounted keyboard edge once, leaving a later pointer open on the trigger', async () => {
    render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    const last = await screen.findByRole('menuitem', { name: 'Delete' });
    expect(document.activeElement).toBe(last);

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    trigger.focus();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await screen.findByRole('menuitem', { name: 'Edit' });

    expect(document.activeElement).toBe(trigger);
  });
});
