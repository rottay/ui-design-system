import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ModernBreadcrumb from '../engines/modern';
import type { BreadcrumbItem } from '../contracts';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const items: BreadcrumbItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'a', label: 'Level A', href: '/a' },
  { key: 'b', label: 'Level B', href: '/b' },
  { key: 'c', label: 'Level C', href: '/c' },
  { key: 'd', label: 'Level D', href: '/d' },
  { key: 'current', label: 'Current page' },
];

describe('Modern Breadcrumb collapsed-items trigger — keyboard reachability', () => {
  it('is reachable by Tab', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernBreadcrumb items={items} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />,
      'modern'
    );
    const trigger = await screen.findByRole('button', { name: 'Show hidden items' });

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Home' }));
    await user.tab();
    expect(document.activeElement).toBe(trigger);
  });

  it('opens with Enter', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernBreadcrumb items={items} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />,
      'modern'
    );
    const trigger = await screen.findByRole('button', { name: 'Show hidden items' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens with Space', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernBreadcrumb items={items} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />,
      'modern'
    );
    const trigger = await screen.findByRole('button', { name: 'Show hidden items' });

    trigger.focus();
    await user.keyboard('[Space]');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('reaches every collapsed item without a pointer', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernBreadcrumb items={items} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />,
      'modern'
    );
    const trigger = await screen.findByRole('button', { name: 'Show hidden items' });

    trigger.focus();
    await user.keyboard('{Enter}');
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.map((node) => node.textContent)).toEqual(['Level A', 'Level B', 'Level C']);
    for (const menuItem of menuItems) {
      menuItem.focus();
      expect(document.activeElement).toBe(menuItem);
    }
  });
});

describe('Modern Breadcrumb per-item menu — trigger host', () => {
  it('gives a menu-bearing crumb with no href/onClick a keyboard-reachable trigger', async () => {
    const versionItems: BreadcrumbItem[] = [
      { key: 'home', label: 'Home', href: '/' },
      {
        key: 'version',
        label: 'v2.4',
        menu: [
          { key: 'v2.3', label: 'v2.3', href: '/docs/v2.3' },
          { key: 'v2.2', label: 'v2.2', href: '/docs/v2.2' },
        ],
      },
      { key: 'current', label: 'Current page' },
    ];

    const user = userEvent.setup();
    renderWithEngine(<ModernBreadcrumb items={versionItems} />, 'modern');

    const crumb = (await screen.findByText('v2.4')).closest('[data-part="crumb"]') as HTMLElement;
    expect(crumb.tagName).toBe('BUTTON');

    crumb.focus();
    expect(document.activeElement).toBe(crumb);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('treats a current crumb menu as disclosure, never as navigation', async () => {
    const onClick = vi.fn();
    const currentWithMenu: BreadcrumbItem[] = [
      { key: 'home', label: 'Home', href: '/' },
      {
        key: 'current',
        label: 'Current page',
        onClick,
        menu: [{ key: 'sibling', label: 'Sibling', href: '/sibling' }],
      },
    ];

    const user = userEvent.setup();
    renderWithEngine(<ModernBreadcrumb items={currentWithMenu} />, 'modern');
    const crumb = (await screen.findByText('Current page')).closest(
      '[data-part="crumb"]'
    ) as HTMLElement;

    expect(crumb.tagName).toBe('BUTTON');
    expect(crumb).toHaveAttribute('aria-current', 'page');
    expect(crumb).not.toHaveAttribute('href');

    crumb.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
  });
});
