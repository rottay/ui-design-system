/**
 * The Modern menu's anatomy contract, executed: one `ds-menu` namespace, the
 * interaction kernel deciding every row's state once, a menu tree axe accepts
 * (no nested interactive, only owned children), keyboard reach that follows
 * the reading direction, and labels that survive a right-to-left locale.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import ModernMenu from '../engines/modern';
import { MenuDivider, MenuGroup, MenuItem, MenuSubMenu } from '../compound';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: <span>D</span> },
  {
    key: 'settings',
    label: 'Settings',
    children: [
      { key: 'profile', label: 'Profile' },
      { key: 'billing', label: 'Billing', disabled: true },
    ],
  },
  { key: 'g', type: 'group' as const, label: 'Danger zone', children: [{ key: 'delete', label: 'Delete workspace', danger: true }] },
  { key: 'd', type: 'divider' as const },
];

const STRUCTURE_RULES = ['nested-interactive', 'aria-required-children', 'aria-required-parent', 'aria-allowed-role', 'aria-allowed-attr'];

async function violationIds(container: HTMLElement, values: string[]): Promise<string[]> {
  const results = await axe.run(container, { runOnly: { type: 'rule', values } });
  return results.violations.map((v) => v.id);
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('one namespace', () => {
  it('emits ds-menu classes only, on the engine tree and on the compounds', () => {
    const { container } = render(
      <>
        <ModernMenu items={items} defaultOpenKeys={['settings']} theme="dark" />
        <ModernMenu>
          <MenuGroup title="Account">
            <MenuItem itemKey="a">Profile</MenuItem>
          </MenuGroup>
          <MenuDivider dashed />
          <MenuSubMenu itemKey="s" title="More">
            <MenuItem itemKey="b" danger>Leave</MenuItem>
          </MenuSubMenu>
        </ModernMenu>
      </>,
    );
    const classes = new Set(Array.from(container.querySelectorAll('[class]')).flatMap((el) => Array.from(el.classList)));
    const own = [...classes].filter((token) => /(^|-)menu(-|$)/.test(token));
    expect(own.length).toBeGreaterThan(0);
    expect(own.every((token) => token.startsWith('ds-menu'))).toBe(true);
    expect(container.querySelector('[class*="rottay-menu"]')).toBeNull();
  });
});

describe('the kernel decides state once', () => {
  it('stamps hover, press, focus and disabled on engine rows as data-state', () => {
    render(<ModernMenu items={items} defaultOpenKeys={['settings']} />);
    const row = screen.getByText('Dashboard').closest('[data-part="item"]') as HTMLElement;
    const trigger = screen.getByText('Settings').closest('[data-part="trigger"]') as HTMLElement;
    const billing = screen.getByText('Billing').closest('[data-part="item"]') as HTMLElement;

    expect(row).not.toHaveAttribute('data-state');
    fireEvent.pointerEnter(row);
    expect(row).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(row);
    expect(row).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(row);
    fireEvent.pointerLeave(row);
    expect(row).not.toHaveAttribute('data-state');

    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.blur(trigger);
    expect(trigger).not.toHaveAttribute('data-state');

    expect(billing).toHaveAttribute('data-state', 'disabled');
    fireEvent.pointerEnter(billing);
    expect(billing).toHaveAttribute('data-state', 'disabled');
  });

  it('keeps the roving tab stop while the kernel tracks focus on the same row', () => {
    render(<ModernMenu items={items} />);
    const row = screen.getByText('Dashboard').closest('[data-part="item"]') as HTMLElement;
    expect(row.tabIndex).toBe(0);
    fireEvent.focus(row);
    expect(row).toHaveAttribute('data-state', 'focused focus-visible');
    fireEvent.keyDown(row, { key: 'ArrowDown' });
    const trigger = screen.getByText('Settings').closest('[data-part="trigger"]') as HTMLElement;
    expect(trigger.tabIndex).toBe(0);
    expect(row.tabIndex).toBe(-1);
  });
});

describe('a menu axe accepts', () => {
  it('reports no structural violation on the engine tree with an open submenu', async () => {
    const { container } = render(<ModernMenu items={items} defaultOpenKeys={['settings']} selectedKeys={['profile']} />);
    expect(await violationIds(container, STRUCTURE_RULES)).toEqual([]);
  });

  it('reports no structural violation on the compound tree with an open submenu', async () => {
    const { container } = render(
      <ModernMenu>
        <MenuGroup title="Account">
          <MenuItem itemKey="a" icon={<span>P</span>}>Profile</MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuSubMenu itemKey="s" title="More">
          <MenuItem itemKey="b" danger>Leave</MenuItem>
        </MenuSubMenu>
      </ModernMenu>,
    );
    fireEvent.click(screen.getByRole('menuitem', { name: /More/ }));
    expect(await violationIds(container, STRUCTURE_RULES)).toEqual([]);
  });

  it('non-vacuity guard: a control nested in an option trips the same rules', async () => {
    const { container } = render(
      <div role="listbox" aria-label="Rows">
        <div role="option" aria-selected="true">
          Row
          <button type="button" aria-label="Action" />
        </div>
      </div>,
    );
    expect(await violationIds(container, STRUCTURE_RULES)).toContain('nested-interactive');
  });
});

describe('direction and locale', () => {
  it('walks a horizontal menubar with the arrows mirrored under RTL', () => {
    // Direction arrives through the i18n authority the kernel now reads.
    // `document.documentElement.dir` is what the provider WRITES, not what the
    // components read.
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernMenu items={items} mode="horizontal" />
      </I18nProvider>,
    );
    const dashboard = screen.getByText('Dashboard').closest('[data-part="item"]') as HTMLElement;
    const settings = screen.getByText('Settings').closest('[data-part="trigger"]') as HTMLElement;
    fireEvent.focus(dashboard);
    fireEvent.keyDown(dashboard, { key: 'ArrowLeft' });
    expect(settings.tabIndex).toBe(0);
    fireEvent.keyDown(settings, { key: 'ArrowRight' });
    expect(dashboard.tabIndex).toBe(0);
  });

  it('keeps an Arabic label as the row name and the collapsed rail still names it', () => {
    const label = 'إعدادات مساحة العمل';
    render(
      <div dir="rtl" lang="ar">
        <ModernMenu items={[{ key: 'ar', label, icon: <span>ع</span> }]} inlineCollapsed />
      </div>,
    );
    const row = screen.getByRole('menuitem', { name: new RegExp(label) });
    expect(row.querySelector('[data-part="label"]')).toHaveTextContent(label);
    expect(row.closest('[data-part="root"]')).toHaveAttribute('data-collapsed', 'true');
  });
});
