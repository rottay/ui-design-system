/**
 * Menu.SubMenu: an inline disclosure that is a legal child of a menu. The
 * trigger is a menuitem with `aria-expanded`, the nested list stays the
 * documented `panel` part, the track opens through `data-open` (the skin
 * animates the grid rows; nothing inline), the forward key resolves on the
 * reading direction through the shared collection kernel, and the row's
 * hover, press and focus are decided by the interaction kernel.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MenuSubMenu } from '../index';
import { MenuItem } from '../../item';

function renderSub(props: Partial<React.ComponentProps<typeof MenuSubMenu>> = {}, dir: 'ltr' | 'rtl' = 'ltr') {
  return render(
    <div dir={dir}>
      <ul role="menu">
        <MenuSubMenu itemKey="sub" title="Sub" {...props}>
          <MenuItem itemKey="child">Child</MenuItem>
        </MenuSubMenu>
      </ul>
    </div>,
  );
}

const trigger = () => screen.getByRole('menuitem', { name: /Sub/ });
const track = () => screen.getByText('Child').closest('.ds-menu-submenu__track') as HTMLElement;

describe('Menu.SubMenu disclosure', () => {
  it('opens and closes the track through data-open, never through an inline height', () => {
    renderSub();
    expect(track()).toHaveAttribute('data-open', 'false');
    expect(track().getAttribute('style')).toBeNull();

    fireEvent.click(trigger());
    expect(track()).toHaveAttribute('data-open', 'true');
    expect(track().getAttribute('style')).toBeNull();

    fireEvent.click(trigger());
    expect(track()).toHaveAttribute('data-open', 'false');
  });

  it('keeps data-part="panel" on the nested <ul role="menu"> the trigger controls', () => {
    renderSub();
    const panel = screen.getByText('Child').closest('[data-part="panel"]') as HTMLElement;
    expect(panel.tagName).toBe('UL');
    expect(panel).toHaveAttribute('role', 'menu');
    expect(panel.parentElement).toBe(track());
    expect(track()).not.toHaveAttribute('data-part');
    expect(trigger()).toHaveAttribute('aria-controls', panel.id);
  });

  it('is a menuitem row, not a button, so a menu owns only what it may', () => {
    renderSub();
    expect(trigger().tagName).toBe('DIV');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger().closest('li')).toHaveAttribute('role', 'none');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('toggles aria-hidden/aria-expanded and calls onTitleClick on toggle', () => {
    const onTitleClick = vi.fn();
    renderSub({ onTitleClick });
    const panel = screen.getByText('Child').closest('[data-part="panel"]') as HTMLElement;
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(trigger());
    expect(onTitleClick).toHaveBeenCalledTimes(1);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveAttribute('aria-hidden', 'false');
  });

  it('opens on the forward arrow and closes on the back arrow', () => {
    renderSub();
    fireEvent.keyDown(trigger(), { key: 'ArrowRight' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(trigger(), { key: 'ArrowLeft' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('mirrors the disclosure arrows under RTL through the collection kernel', () => {
    renderSub({}, 'rtl');
    fireEvent.keyDown(trigger(), { key: 'ArrowRight' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(trigger(), { key: 'ArrowLeft' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(trigger(), { key: 'ArrowRight' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('disabled submenu ignores click and keys and reports the kernel state', () => {
    renderSub({ disabled: true });
    expect(trigger()).toHaveAttribute('data-state', 'disabled');
    expect(trigger().tabIndex).toBe(-1);
    fireEvent.click(trigger());
    fireEvent.keyDown(trigger(), { key: 'ArrowRight' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('stamps hover, press and focus from the interaction kernel', () => {
    renderSub();
    fireEvent.pointerEnter(trigger());
    expect(trigger()).toHaveAttribute('data-state', 'hovered');
    fireEvent.pointerDown(trigger());
    expect(trigger()).toHaveAttribute('data-state', 'hovered pressed');
    fireEvent.pointerUp(trigger());
    fireEvent.pointerLeave(trigger());
    expect(trigger()).not.toHaveAttribute('data-state');
    fireEvent.focus(trigger());
    expect(trigger()).toHaveAttribute('data-state', 'focused focus-visible');
  });
});
