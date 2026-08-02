import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernMenu from '../engines/modern';

const here = dirname(fileURLToPath(import.meta.url));

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
          prop.startsWith('--rottay-menu-') || !PAINT_PROPS.test(prop),
          `${htmlEl.tagName}[data-part="${htmlEl.getAttribute('data-part')}"] carries inline "${prop}"`
        ).toBe(true);
      }
    }
  });

  it('stamps the root contract and the row parts', () => {
    const { container } = render(
      <ModernMenu items={items} mode="horizontal" theme="dark" defaultOpenKeys={['settings']} />
    );

    const root = container.querySelector('.rottay-menu--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('role', 'menu');
    expect(root).toHaveAttribute('data-mode', 'horizontal');
    expect(root.className).toContain('rottay-menu--dark');

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

  it('makes the skin pair every text surface with the card chrome tokens', () => {
    // PAIRED-SURFACE LAW pin: raw --ds-surface-card may be a dark feature
    // surface (TMM #18181c) while the text tokens stay dark; every
    // text-bearing state surface mixes from --ds-card-bg instead.
    const MENU_SKIN = readFileSync(
      join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/menu.css'),
      'utf8'
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    const stateRules = MENU_SKIN.match(/background[^;]*surface-card[^;]*;/g) ?? [];
    expect(stateRules.length).toBeGreaterThan(0);
    for (const rule of stateRules) {
      expect(rule, `surface mix bypasses the card pairing: ${rule}`).toContain('--ds-card-bg');
    }
  });

  it('exposes hierarchy through data-level and the custom-property channel', () => {
    render(<ModernMenu items={items} defaultOpenKeys={['settings']} inlineIndent={20} />);

    const top = screen.getByText('Dashboard').closest('[data-part="item"]') as HTMLElement;
    expect(top).toHaveAttribute('data-level', 'top');
    expect(top.style.getPropertyValue('--rottay-menu-level')).toBe('0');

    const child = screen.getByText('Profile').closest('[data-part="item"]') as HTMLElement;
    expect(child).toHaveAttribute('data-level', 'child');
    expect(child.style.getPropertyValue('--rottay-menu-level')).toBe('1');
    expect(child.style.getPropertyValue('--rottay-menu-inline-indent')).toBe('20px');
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

  it('keeps the label rule in a block formatting context so the ellipsis survives', () => {
    // K3-B Pass-2 regression pin: theme.css's legacy icon bridge
    // (`[data-tenant] .rottay-menu li > button > span:first-child`, (0,3,2))
    // pins an icon-less row's label span to `inline-flex`, and a flex
    // formatting context never ellipsizes — long labels clipped without the
    // "…" (sighted on the k3-lane-b matrix captures, both tenants). The skin
    // must therefore carry the doubled-attr label selector ((0,4,1)) AND an
    // explicit `display: block`.
    const MENU_SKIN = readFileSync(
      join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/menu.css'),
      'utf8'
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    const labelRule = MENU_SKIN.match(
      /\[data-part='label'\]\[data-part='label'\]\s*\{[^}]*\}/
    );
    expect(labelRule, 'label rule lost the doubled-attr selector').not.toBeNull();
    expect(labelRule?.[0]).toContain('display: block');
    expect(labelRule?.[0]).toContain('text-overflow: ellipsis');
  });

  it('owns the 62/45 level geometry against the legacy sidebar bridge', () => {
    // K3-B Pass-2 regression pin: theme.css's legacy sidebar bridge clamps
    // `.rottay-menu li > button/a` to `min-height: 60px`, flattening the
    // documented 62/45 hierarchy to 60/60 (sighted: submenu children
    // rendered as oversized 60px rows on every matrix capture). The top-row
    // chain must not read `--ds-menu-item-height` (default.css defines it at
    // 2.5rem for the compound Item's inline minHeight — it would hijack the
    // 62px frame with 40px), and both level rules must clear the min clamp.
    const MENU_SKIN = readFileSync(
      join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/menu.css'),
      'utf8'
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    const topRule = MENU_SKIN.match(/\[data-level='top'\][^{]*\{[^}]*\}/);
    expect(topRule?.[0]).toContain('min-block-size: 0');
    expect(topRule?.[0]).toContain("block-size: var(--ds-sidebar-item-height, 62px)");
    expect(topRule?.[0]).not.toContain('--ds-menu-item-height');

    const childRule = MENU_SKIN.match(/\[data-level='child'\][^{]*\{[^}]*\}/);
    expect(childRule?.[0]).toContain('min-block-size: 0');
    expect(childRule?.[0]).toContain('45px');

    // The coarse-pointer 44px floor is skin-owned (the bridge clamp that
    // used to satisfy it by accident is cleared above).
    // C2c law: a per-component touch channel chains to the single canonical
    // --ds-touch-target-min, so 44px survives only as that channel's own
    // fallback. Pinned as a chain, not a literal, so reformatting cannot lie.
    expect(MENU_SKIN).toMatch(
      /var\(\s*--ds-menu-touch-target-min\s*,\s*var\(\s*--ds-touch-target-min\s*,\s*44px\s*\)\s*\)/
    );
  });
});
