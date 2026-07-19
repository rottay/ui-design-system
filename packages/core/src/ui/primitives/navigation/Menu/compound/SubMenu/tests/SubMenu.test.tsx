/**
 * Menu.SubMenu grid-template-rows migration tests (W6-E).
 *
 * Before this WO, SubMenu measured `scrollHeight` in a `useEffect` and
 * animated a JS-computed pixel `height` on the `<ul role="menu">` itself.
 * These tests fail if pixel-height measurement is reintroduced, if the
 * grid-template-rows values stop tracking `isOpen`, or if `data-part="panel"`
 * (the documented submenu-flyout contract, see
 * docs-engineering/engineering/design-system/runtime/skins/data-part-contracts)
 * moves off the `<ul role="menu">` onto the grid-track wrapper.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MenuSubMenu } from '../index';
import { MenuItem } from '../../Item';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SKIN_CSS_PATH = resolve(
  TEST_DIR,
  '..', '..', '..', '..', '..', '..', '..',
  'foundation', 'tokens', 'css', 'presentation', 'components', 'skin', 'menu-compounds.css'
);

describe('Menu.SubMenu grid-row auto-height (W6-E)', () => {
  it('expands the grid-row track to 1fr and collapses it to 0fr on toggle, never using a pixel height', () => {
    render(
      <ul>
        <MenuSubMenu itemKey="sub" title="Sub">
          <MenuItem itemKey="child">Child</MenuItem>
        </MenuSubMenu>
      </ul>
    );

    const panel = screen.getByText('Child').closest('.rottay-menu-submenu__panel') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('style')).toContain('grid-template-rows: 0fr');
    expect(panel.getAttribute('style')).not.toMatch(/height:\s*\d/);

    fireEvent.click(screen.getByText('Sub'));
    expect(panel.getAttribute('style')).toContain('grid-template-rows: 1fr');
    expect(panel.getAttribute('style')).not.toMatch(/height:\s*\d/);

    fireEvent.click(screen.getByText('Sub'));
    expect(panel.getAttribute('style')).toContain('grid-template-rows: 0fr');
  });

  it('keeps data-part="panel" on the <ul role="menu"> (the documented submenu-flyout contract), not on the grid-track wrapper', () => {
    render(
      <ul>
        <MenuSubMenu itemKey="sub" title="Sub">
          <MenuItem itemKey="child">Child</MenuItem>
        </MenuSubMenu>
      </ul>
    );

    const list = screen.getByRole('menu', { hidden: true });
    expect(list.tagName).toBe('UL');
    expect(list.getAttribute('data-part')).toBe('panel');
    expect(list.className).toContain('rottay-menu-submenu__content');

    const wrapper = list.parentElement as HTMLElement;
    expect(wrapper.className).toContain('rottay-menu-submenu__panel');
    expect(wrapper.getAttribute('data-part')).toBeNull();
  });

  it('toggles aria-hidden/aria-expanded and calls onTitleClick on toggle', () => {
    const onTitleClick = vi.fn();
    render(
      <ul>
        <MenuSubMenu itemKey="sub" title="Sub" onTitleClick={onTitleClick}>
          <MenuItem itemKey="child">Child</MenuItem>
        </MenuSubMenu>
      </ul>
    );

    const trigger = screen.getByRole('button', { name: /Sub/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    const list = screen.getByRole('menu', { hidden: true });
    expect(list.getAttribute('aria-hidden')).toBe('true');

    fireEvent.click(trigger);
    expect(onTitleClick).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(list.getAttribute('aria-hidden')).toBe('false');
  });

  it('ArrowRight opens and ArrowLeft closes via keyboard', () => {
    render(
      <ul>
        <MenuSubMenu itemKey="sub" title="Sub">
          <MenuItem itemKey="child">Child</MenuItem>
        </MenuSubMenu>
      </ul>
    );
    const trigger = screen.getByRole('button', { name: /Sub/ });

    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fireEvent.keyDown(trigger, { key: 'ArrowLeft' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('disabled submenu ignores click and never opens', () => {
    render(
      <ul>
        <MenuSubMenu itemKey="sub" title="Sub" disabled>
          <MenuItem itemKey="child">Child</MenuItem>
        </MenuSubMenu>
      </ul>
    );
    const trigger = screen.getByRole('button', { name: /Sub/ });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('the co-located skin declares the grid-rows transition, min-height:0 on the content track, and a reduced-motion override', () => {
    const css = readFileSync(SKIN_CSS_PATH, 'utf-8');

    expect(css).toMatch(/\.rottay-menu-submenu__panel\s*\{[^}]*display:\s*grid/);
    expect(css).toMatch(/\.rottay-menu-submenu__panel\s*\{[^}]*transition:\s*grid-template-rows/);
    expect(css).toMatch(/\.rottay-menu-submenu__content\s*\{[^}]*min-height:\s*0/);
    expect(css).toMatch(/\.rottay-menu-submenu__content\s*\{[^}]*overflow:\s*hidden/);

    const reducedMotionBlock = css.slice(css.indexOf('prefers-reduced-motion'));
    expect(reducedMotionBlock).toContain('.rottay-menu-submenu__panel');
    expect(reducedMotionBlock).toContain('transition: none');
  });
});
