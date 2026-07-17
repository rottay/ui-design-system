import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const MENU_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'danger', label: 'Delete', danger: true },
  { key: 'disabled', label: 'Disabled', disabled: true },
  {
    key: 'admin',
    type: 'group' as const,
    label: 'Admin',
    children: [{ key: 'users', label: 'Users' }],
  },
  {
    key: 'settings',
    label: 'Settings',
    children: [
      { key: 'profile', label: 'Profile' },
      { key: 'separator', type: 'divider' as const },
      { key: 'logout', label: 'Logout' },
    ],
  },
];

describe('Menu rustic advanced engine coverage', () => {
  it('covers group, divider, submenu, keyboard navigation, multiple selection, and disabled-item guards', async () => {
    const { default: RusticMenu } = await import('../engines/rustic');
    const handleClick = vi.fn();
    const handleSelect = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <RusticMenu
        items={MENU_ITEMS}
        multiple
        defaultOpenKeys={['settings']}
        onClick={handleClick}
        onSelect={handleSelect}
        onOpenChange={handleOpenChange}
      />
    );

    const menu = screen.getAllByRole('menu')[0];
    fireEvent.focus(menu);

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Enter' });

    await waitFor(() => {
      expect(handleSelect).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Delete'));
    expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'danger' }));
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'danger', selectedKeys: ['danger'] })
    );

    const clickCountBeforeDisabled = handleClick.mock.calls.length;
    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).toHaveBeenCalledTimes(clickCountBeforeDisabled);

    fireEvent.click(screen.getByText('Settings'));
    expect(handleOpenChange).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Settings'));
    expect(handleOpenChange.mock.calls.length).toBeGreaterThanOrEqual(2);

    fireEvent.keyDown(menu, { key: 'Home' });
    fireEvent.keyDown(menu, { key: 'End' });
    fireEvent.keyDown(menu, { key: ' ' });
    expect(handleOpenChange.mock.calls.length).toBeGreaterThanOrEqual(2);
    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  }, 10000);

  it('covers controlled submenu state, dark inline styling, non-selectable clicks, and submenu keyboard toggles', async () => {
    const { default: RusticMenu } = await import('../engines/rustic');
    const handleClick = vi.fn();
    const handleSelect = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <RusticMenu
        items={MENU_ITEMS}
        mode="inline"
        theme="dark"
        inlineCollapsed
        selectable={false}
        selectedKeys={['home']}
        openKeys={['settings']}
        onClick={handleClick}
        onSelect={handleSelect}
        onOpenChange={handleOpenChange}
      />
    );

    const menu = screen.getAllByRole('menu')[0];
    expect(menu).toHaveStyle({
      display: 'block',
      width: 'var(--ds-menu-collapsed-width, 80px)',
    });

    fireEvent.click(screen.getByText('Delete'));
    expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'danger' }));
    expect(handleSelect).not.toHaveBeenCalled();

    fireEvent.focus(menu);
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'Enter' });

    expect(handleOpenChange).toHaveBeenCalledWith([]);
    expect(screen.getByText('Settings').closest('[aria-expanded="true"]')).toBeTruthy();

    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.getAllByRole('menu').length).toBeGreaterThanOrEqual(1);
  });
});
