import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernMenu from '../index';

const items = [
  { key: 'dashboard', label: 'Dashboard' },
  {
    key: 'settings',
    label: 'Settings',
    children: [
      { key: 'profile', label: 'Profile' },
      { key: 'billing', label: 'Billing', disabled: true },
    ],
  },
  { key: 'delete', label: 'Delete workspace', danger: true },
];

const rows = () => screen.getAllByRole('menuitem');
const tabbableRows = () => rows().filter((row) => row.getAttribute('tabindex') === '0');
const row = (label: string) =>
  screen.getByText(label).closest('[role="menuitem"]') as HTMLElement;

/**
 * SC-3 adoption contract: the menu is ONE roving collection. The K3-B model
 * made every enabled row a tab stop, which `role="menu"` forbids.
 */
describe('Modern Menu roving focus', () => {
  it('exposes a single tab stop, closed or expanded', () => {
    const { rerender } = render(<ModernMenu items={items} />);
    expect(rows()).toHaveLength(3);
    expect(tabbableRows()).toHaveLength(1);
    expect(tabbableRows()[0]).toBe(row('Dashboard'));

    // The expanded panel adds rows to the SAME collection, not new tab stops.
    rerender(<ModernMenu items={items} openKeys={['settings']} />);
    expect(rows()).toHaveLength(5);
    expect(tabbableRows()).toHaveLength(1);
  });

  it('keeps Tab an exit: navigation never adds a second tab stop', () => {
    render(<ModernMenu items={items} defaultOpenKeys={['settings']} />);

    fireEvent.keyDown(row('Dashboard'), { key: 'ArrowDown' });
    expect(tabbableRows()).toHaveLength(1);

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' });
    expect(tabbableRows()).toHaveLength(1);
    expect(tabbableRows()[0]).toBe(row('Delete workspace'));
  });

  it('walks the visible rows with the vertical arrows, skipping disabled ones', () => {
    render(<ModernMenu items={items} defaultOpenKeys={['settings']} />);

    fireEvent.keyDown(row('Dashboard'), { key: 'ArrowDown' });
    expect(row('Settings')).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    expect(row('Profile')).toHaveFocus();

    // Billing is disabled: it is rendered, never reachable.
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    expect(row('Delete workspace')).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    expect(row('Dashboard')).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowUp' });
    expect(row('Delete workspace')).toHaveFocus();
  });

  it('jumps to the first and last reachable rows', () => {
    render(<ModernMenu items={items} defaultOpenKeys={['settings']} />);

    fireEvent.keyDown(row('Dashboard'), { key: 'End' });
    expect(row('Delete workspace')).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' });
    expect(row('Dashboard')).toHaveFocus();
  });

  it('mirrors the horizontal axis under RTL without touching the vertical one', () => {
    const { unmount } = render(<ModernMenu items={items} mode="horizontal" />);

    fireEvent.keyDown(row('Dashboard'), { key: 'ArrowRight' });
    expect(row('Settings')).toHaveFocus();
    unmount();

    render(
      <div dir="rtl">
        <ModernMenu items={items} mode="horizontal" />
      </div>
    );

    fireEvent.keyDown(row('Dashboard'), { key: 'ArrowRight' });
    expect(row('Delete workspace')).toHaveFocus();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(row('Dashboard')).toHaveFocus();
  });

  it('leaves the cross axis to the submenu disclosure', () => {
    render(<ModernMenu items={items} />);

    const trigger = row('Settings');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Vertical menu: the horizontal axis opens and closes, it never moves.
    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    expect(row('Settings')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(row('Settings'), { key: 'ArrowLeft' });
    expect(row('Settings')).toHaveAttribute('aria-expanded', 'false');
  });

  it('returns focus from a panel row to its parent trigger, panel still open', () => {
    render(<ModernMenu items={items} defaultOpenKeys={['settings']} />);

    fireEvent.keyDown(row('Profile'), { key: 'ArrowLeft' });

    expect(row('Settings')).toHaveFocus();
    expect(row('Settings')).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves the tab stop to a neighbour when the active row disappears', () => {
    const { rerender } = render(<ModernMenu items={items} openKeys={['settings']} />);

    fireEvent.focus(row('Profile'));
    expect(tabbableRows()[0]).toBe(row('Profile'));

    // Collapsing the submenu unmounts the active row.
    rerender(<ModernMenu items={items} openKeys={[]} />);
    expect(tabbableRows()).toHaveLength(1);
    expect(tabbableRows()[0]).toBe(row('Settings'));
  });
});
