import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../tooling/testing/helpers/engine';

const items = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'reports', label: 'Reports' },
  {
    key: 'settings',
    label: 'Settings',
    children: [{ key: 'profile', label: 'Profile' }],
  },
];

describe('Menu integration', () => {
  it.each(STABLE_ENGINES)('renders the live menu with the %s engine', async (engine) => {
    const { Menu } = await import('..');

    renderWithEngine(<Menu engine={engine} items={items} mode="vertical" />, engine);

    expect(await screen.findByText('Dashboard', undefined, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  }, 15000);

  it('routes live selection callbacks through the rustic engine', async () => {
    const { Menu } = await import('..');
    const onSelect = vi.fn();

    renderWithEngine(<Menu engine="rustic" items={items} onSelect={onSelect} />, 'rustic');

    fireEvent.click(await screen.findByText('Reports', undefined, { timeout: 10000 }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'reports',
        selectedKeys: ['reports'],
      })
    );
  });

  it('respects controlled openKeys through the modern engine', async () => {
    const { Menu } = await import('..');
    const onOpenChange = vi.fn();
    const view = renderWithEngine(
      <Menu engine="modern" items={items} openKeys={[]} onOpenChange={onOpenChange} />,
      'modern'
    );

    fireEvent.click(await screen.findByText('Settings', undefined, { timeout: 10000 }));
    expect(onOpenChange).toHaveBeenCalledWith(['settings']);

    // Closed submenu: the trigger reports collapsed and the panel stays
    // unmounted (closed submenus never leak items into the a11y tree).
    const collapsed = (await screen.findByText('Settings', undefined, { timeout: 10000 })).closest(
      '[data-part="trigger"]'
    );
    expect(collapsed).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    view.rerender(
      <Menu engine="modern" items={items} openKeys={['settings']} onOpenChange={onOpenChange} />
    );

    const expanded = (await screen.findByText('Settings', undefined, { timeout: 10000 })).closest(
      '[data-part="trigger"]'
    );
    expect(expanded).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('Profile', undefined, { timeout: 10000 })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Settings'));
    expect(onOpenChange).toHaveBeenLastCalledWith([]);
  });
});
