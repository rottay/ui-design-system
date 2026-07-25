/**
 * Dropdown modern engine — disclosure ARIA & the Escape contract (R1).
 *
 * The trigger wrapper span used to carry `aria-haspopup`/`aria-expanded`
 * itself; a role-less span may not (axe `aria-allowed-attr`, critical on the
 * K4 lane cells). The semantics are now cloned onto the consumer's trigger
 * ELEMENT (Popover's describeTrigger precedent), and the surface is linked
 * back with `aria-controls`.
 *
 * Escape is part of the premium overlay contract: it must dismiss the menu
 * AND return focus to the trigger (the consumer's control when one exists,
 * the programmatic-only container otherwise).
 */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Dropdown as ModernDropdown } from '../engines/modern';

const MENU = {
  items: [
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete', danger: true },
  ],
};

afterEach(() => cleanup());

describe('Dropdown modern engine — disclosure ARIA lives on a valid host', () => {
  it('clones aria-haspopup/expanded/controls onto the consumer trigger element, never the span', () => {
    const { container } = render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const wrapper = container.querySelector('[data-part="trigger-content"]') as HTMLElement;
    expect(wrapper.hasAttribute('aria-haspopup')).toBe(false);
    expect(wrapper.hasAttribute('aria-expanded')).toBe(false);
    expect(wrapper.hasAttribute('aria-controls')).toBe(false);

    const button = screen.getByRole('button', { name: 'Actions' });
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button.getAttribute('aria-controls')).toBeTruthy();
  });

  it('reflects the open state and points aria-controls at the surface', () => {
    render(
      <ModernDropdown open trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const button = screen.getByRole('button', { name: 'Actions' });
    const surface = document.querySelector('[data-part="surface"]') as HTMLElement;

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button.getAttribute('aria-controls')).toBe(surface.id);
  });

  it('stamps nothing when the trigger is a bare string (no valid host)', () => {
    const { container } = render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        Plain label
      </ModernDropdown>,
    );

    const wrapper = container.querySelector('[data-part="trigger-content"]') as HTMLElement;
    expect(wrapper.textContent).toBe('Plain label');
    expect(wrapper.querySelector('[aria-haspopup]')).toBeNull();
  });
});

describe('Dropdown modern engine — Escape dismisses and returns focus', () => {
  it('closes the menu on Escape and refocuses the consumer trigger control', () => {
    render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        <button type="button">Actions</button>
      </ModernDropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('falls back to the programmatic-only container when nothing inside is focusable', () => {
    const { container } = render(
      <ModernDropdown trigger={['click']} menu={MENU}>
        Plain label
      </ModernDropdown>,
    );

    const host = container.querySelector('[data-part="trigger"]') as HTMLElement;
    expect(host).toHaveAttribute('tabindex', '-1');

    fireEvent.click(host);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(host);
  });
});
