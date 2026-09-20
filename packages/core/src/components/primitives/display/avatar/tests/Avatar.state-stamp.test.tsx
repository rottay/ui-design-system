/**
 * The runtime producer behind the modern Avatar's interactive paint.
 *
 * The skin keys hover, press and the focus ring on the ROOT
 * (`[data-interactive='true']:is([data-state~='x'], :x) > [data-part='mask']`)
 * even though the lift and the ring land on the mask child, so the root is
 * where the kernel's single decision has to be stamped (F-37). This pins that
 * producer and pins that a non-interactive avatar stays silent.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';

import ModernAvatar from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/avatar/index.css',
  ),
  'utf8',
);

afterEach(cleanup);

const ROOT = ".rottay-avatar--modern[data-interactive='true']";

describe('Avatar modern state stamp', () => {
  it('pairs every state rule in the skin with its stamped twin', () => {
    for (const twin of ["[data-state~='hovered']", "[data-state~='pressed']", "[data-state~='focus-visible']"]) {
      expect(SKIN).toContain(twin);
    }
    expect(SKIN).not.toMatch(/\[data-interactive='true'\]:hover\s/u);
  });

  it('says nothing at rest, so resting paint is unchanged', () => {
    const { container } = render(<ModernAvatar name="Ada Lovelace" onClick={vi.fn()} />);
    const root = container.querySelector<HTMLElement>(ROOT)!;
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('stamps the root through the pointer triad', () => {
    const { container } = render(<ModernAvatar name="Ada Lovelace" onClick={vi.fn()} />);
    const root = container.querySelector<HTMLElement>(ROOT)!;

    fireEvent.pointerEnter(root);
    expect(root.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerDown(root);
    expect(root.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(root);
    expect(root.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerLeave(root);
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('presses from the keyboard, which a role="button" div never gets from :active', () => {
    const onClick = vi.fn();
    const { container } = render(<ModernAvatar name="Ada Lovelace" onClick={onClick} />);
    const root = container.querySelector<HTMLElement>(ROOT)!;

    fireEvent.keyDown(root, { key: 'Enter' });
    expect(root.getAttribute('data-state')).toContain('pressed');
    fireEvent.keyUp(root, { key: 'Enter' });
    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stamps focus-visible for a keyboard focus and clears it on blur', () => {
    const { container } = render(<ModernAvatar name="Ada Lovelace" clickable />);
    const root = container.querySelector<HTMLElement>(ROOT)!;

    fireEvent.focus(root);
    expect(root.getAttribute('data-state')).toContain('focus-visible');
    fireEvent.blur(root);
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('never stamps a non-interactive avatar, whose skin has no state rule to feed', () => {
    const { container } = render(<ModernAvatar name="Ada Lovelace" />);
    const root = container.querySelector<HTMLElement>('.rottay-avatar--modern')!;
    expect(root.hasAttribute('data-interactive')).toBe(false);

    fireEvent.pointerEnter(root);
    fireEvent.pointerDown(root);
    fireEvent.focus(root);
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('keeps the stamp when a composing family renames the part', () => {
    const { container } = render(
      <ModernAvatar name="Ada Lovelace" clickable data-part="assignee" />,
    );
    const root = container.querySelector<HTMLElement>("[data-part='assignee']")!;
    fireEvent.pointerEnter(root);
    expect(root.getAttribute('data-state')).toBe('hovered');
  });
});
