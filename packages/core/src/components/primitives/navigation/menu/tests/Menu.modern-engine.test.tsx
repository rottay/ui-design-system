import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernMenu from '../engines/modern';


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

/**
 * Real-engine contract for modern Menu (K3-B Pass 1): the engine stamps
 * anatomy + state and paints nothing inline (the two custom properties are
 * the sanctioned hierarchy data channel); menu.css owns all layout + paint.
 */
describe('Modern Menu public anatomy', () => {
  it('paints nothing inline beyond the custom-property data channel', () => {
    const { container } = render(<ModernMenu items={items} mode="vertical" />);

    const PAINT_PROPS = /^(background|border|outline|color|box-shadow|boxShadow|text-shadow|textShadow|fill|stroke|accent-color|accentColor|filter|backdrop-filter|backdropFilter|transform|display|gap|height|block-size|inline-size|width|padding|margin|font|line-height|lineHeight|cursor|opacity|flex|position|inset|list-style|listStyle|text-align|textAlign|justify-content|justifyContent|align-items|alignItems|user-select|userSelect|text-decoration|textDecoration|box-sizing|boxSizing|transition|overflow)/;

    for (const el of container.querySelectorAll('*')) {
      const htmlEl = el as HTMLElement;
      for (const prop of Array.from(htmlEl.style)) {
        expect(
          prop.startsWith('--ds-menu-') || !PAINT_PROPS.test(prop),
          `${htmlEl.tagName}[data-part="${htmlEl.getAttribute('data-part')}"] carries inline "${prop}"`
        ).toBe(true);
      }
    }
  });

  it('stamps the root contract and the row parts', () => {
    const { container } = render(
      <ModernMenu items={items} mode="horizontal" theme="dark" defaultOpenKeys={['settings']} />
    );

    const root = container.querySelector('.ds-menu--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('role', 'menu');
    expect(root).toHaveAttribute('data-mode', 'horizontal');
    expect(root).toHaveAttribute('data-variant', 'dark');
    expect(root.className).not.toMatch(/rottay-/);

    const rows = container.querySelectorAll('[data-part="item"]');
    expect(rows).toHaveLength(4); // dashboard + profile + billing + delete
    expect(container.querySelector('[data-part="trigger"]')).toBeInTheDocument();
  });

  it('keeps the submenu trigger an axe-legal menuitem and the panel conditional', () => {
    const { container, rerender } = render(<ModernMenu items={items} />);

    const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
    // A <summary> computes as a button — an unallowed owned child of
    // role="menu" (axe aria-required-children). The trigger is a menuitem.
    expect(trigger.tagName).toBe('DIV');
    expect(trigger).toHaveAttribute('role', 'menuitem');
    expect(container.querySelector('summary')).toBeNull();
    expect(container.querySelector('details')).toBeNull();

    // Closed submenus never leak items into the accessibility tree.
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(container.querySelector('[data-part="panel"]')).toBeNull();

    rerender(<ModernMenu items={items} openKeys={['settings']} />);
    expect(container.querySelector('[data-part="trigger"]')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('exposes hierarchy through data-level and the custom-property channel', () => {
    render(<ModernMenu items={items} defaultOpenKeys={['settings']} inlineIndent={20} />);

    const top = screen.getByText('Dashboard').closest('[data-part="item"]') as HTMLElement;
    expect(top).toHaveAttribute('data-level', 'top');
    expect(top.style.getPropertyValue('--ds-menu-level')).toBe('0');

    const child = screen.getByText('Profile').closest('[data-part="item"]') as HTMLElement;
    expect(child).toHaveAttribute('data-level', 'child');
    expect(child.style.getPropertyValue('--ds-menu-level')).toBe('1');
    expect(child.style.getPropertyValue('--ds-menu-inline-indent')).toBe('20px');
  });

  it('marks selection with aria-current and data-selected', () => {
    render(<ModernMenu items={items} selectedKeys={['dashboard']} />);

    const selected = screen.getByText('Dashboard').closest('[data-part="item"]') as HTMLElement;
    expect(selected).toHaveAttribute('data-selected', 'true');
    expect(selected).toHaveAttribute('aria-current', 'page');

    const other = screen.getByText('Delete workspace').closest('[data-part="item"]') as HTMLElement;
    expect(other).toHaveAttribute('data-selected', 'false');
    expect(other).not.toHaveAttribute('aria-current');
  });

  it('routes click and keyboard activation through onClick/onSelect', () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    render(<ModernMenu items={items} onClick={onClick} onSelect={onSelect} />);

    const dashboard = screen.getByText('Dashboard').closest('[data-part="item"]') as HTMLElement;
    fireEvent.click(dashboard);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'dashboard' }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'dashboard', selectedKeys: ['dashboard'] })
    );

    const del = screen.getByText('Delete workspace').closest('[data-part="item"]') as HTMLElement;
    expect(del).toHaveAttribute('data-tone', 'danger');
    fireEvent.keyDown(del, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'delete' }));
    fireEvent.keyDown(del, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('keeps disabled items out of the tab order and unresponsive', () => {
    const onClick = vi.fn();
    render(<ModernMenu items={items} defaultOpenKeys={['settings']} onClick={onClick} />);

    const billing = screen.getByText('Billing').closest('[data-part="item"]') as HTMLElement;
    expect(billing).toHaveAttribute('data-disabled', 'true');
    expect(billing).toHaveAttribute('aria-disabled', 'true');
    expect(billing.tabIndex).toBe(-1);

    fireEvent.click(billing);
    fireEvent.keyDown(billing, { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('expands and collapses submenus through the trigger with aria-expanded', () => {
    const onOpenChange = vi.fn();
    render(<ModernMenu items={items} onOpenChange={onOpenChange} />);

    const trigger = screen.getByText('Settings').closest('[data-part="trigger"]') as HTMLElement;
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(['settings']);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-open', 'true');

    fireEvent.keyDown(trigger, { key: ' ' });
    expect(onOpenChange).toHaveBeenLastCalledWith([]);
  });

  it('auto-opens the submenu that contains the selected descendant', () => {
    render(<ModernMenu items={items} selectedKeys={['profile']} />);

    const trigger = screen.getByText('Settings').closest('[data-part="trigger"]') as HTMLElement;
    expect(trigger).toHaveAttribute('data-selected-descendant', 'true');
    expect(trigger).toHaveAttribute('data-open', 'true');
  });

  it('renders group labels and dividers as inert structure', () => {
    const { container } = render(
      <ModernMenu
        items={[
          { key: 'g', type: 'group', label: 'Account', title: 'Account', children: [{ key: 'profile', label: 'Profile' }] },
          { key: 'd', type: 'divider' },
          { key: 'logout', label: 'Log out', danger: true },
        ]}
      />
    );

    const groupLabel = screen.getByText('Account');
    expect(groupLabel).toHaveAttribute('data-part', 'group-label');
    expect(groupLabel.closest('li')).toHaveAttribute('data-part', 'group');

    const divider = container.querySelector('[data-part="divider"]') as HTMLElement;
    expect(divider).toHaveAttribute('role', 'separator');
    expect(divider.querySelector('a,button')).toBeNull();
  });

  it('keeps long labels intact in an Arabic RTL context', () => {
    render(
      <div dir="rtl" lang="ar">
        <ModernMenu
          items={[{ key: 'long', label: 'إعدادات مساحة العمل مع تسمية طويلة عمداً يجب أن تقتطع بأناقة' }]}
        />
      </div>
    );

    expect(screen.getByText(/إعدادات مساحة العمل/)).toHaveAttribute('data-part', 'label');
  });

});
