// The submenu trigger's `aria-expanded` needs an `aria-controls` target, wired only while
// the panel is mounted so the reference never dangles.
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernMenu from '../engines/modern';

const ITEMS = [
  {
    key: 'reports',
    label: 'Reports',
    children: [
      { key: 'daily', label: 'Daily' },
      { key: 'weekly', label: 'Weekly' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    children: [{ key: 'profile', label: 'Profile' }],
  },
];

describe('Menu modern: the submenu disclosure names its own panel', () => {
  it('wires aria-controls to the mounted group panel when open', () => {
    const { container } = render(<ModernMenu items={ITEMS} defaultOpenKeys={['reports']} />);

    const trigger = container.querySelector<HTMLElement>("[data-part='trigger']");
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    const controls = trigger?.getAttribute('aria-controls');
    expect(controls).toBeTruthy();

    const panel = document.getElementById(controls as string);
    expect(panel).toBeTruthy();
    expect(panel?.getAttribute('data-part')).toBe('panel');
    expect(panel?.getAttribute('role')).toBe('group');
    expect(panel?.textContent).toContain('Daily');
  });

  it('drops the reference while the panel is unmounted', () => {
    const { container } = render(<ModernMenu items={ITEMS} />);

    const trigger = container.querySelector<HTMLElement>("[data-part='trigger']") as HTMLElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    // A closed submenu mounts no panel, so a reference here would dangle.
    expect(trigger.getAttribute('aria-controls')).toBeNull();

    fireEvent.click(trigger);
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls as string)).toBeTruthy();
  });

  it('gives every submenu in the tree its own panel id', () => {
    const { container } = render(
      <ModernMenu items={ITEMS} defaultOpenKeys={['reports', 'settings']} />,
    );

    const controls = Array.from(
      container.querySelectorAll<HTMLElement>("[data-part='trigger']"),
    ).map((node) => node.getAttribute('aria-controls'));

    expect(controls).toHaveLength(2);
    expect(controls[0]).toBeTruthy();
    expect(controls[1]).toBeTruthy();
    expect(controls[0]).not.toBe(controls[1]);
    expect(new Set(controls).size).toBe(2);
  });
});
