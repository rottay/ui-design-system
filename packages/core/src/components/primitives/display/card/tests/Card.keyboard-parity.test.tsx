/**
 * @fileoverview A clickable Card is operable from the keyboard in both engines (P-51).
 *
 * The rustic engine announced every `clickable || onClick` card as a
 * `role="button"` with a tab stop, and carried no `onKeyDown` at all. A keyboard
 * user could reach it, was told it was a button, and could not activate it --
 * WCAG 2.1.1, the function available to a pointer and not to a keyboard. A
 * comment above the markup called this "the rustic engine's key a11y advantage
 * over modern/classic".
 *
 * The modern engine had it right: the role, the tab stop and the activation path
 * are gated together on `onClick`, and `clickable` is a styling flag rather than
 * a promise that the card does anything.
 *
 * Both engines run through the same table here, so neither can drift again.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernCard from '../engines/modern';
import RusticCard from '../engines/rustic';

const ENGINES = [
  { name: 'modern', Card: ModernCard },
  { name: 'rustic', Card: RusticCard },
] as const;

const root = (container: HTMLElement) => container.querySelector('[data-part="root"]') as HTMLElement;

describe.each(ENGINES)('$name engine: a card with onClick is a real button', ({ Card }) => {
  it('announces itself and takes a tab stop', () => {
    const { container } = render(<Card onClick={() => {}} title="Card" />);
    expect(root(container)).toHaveAttribute('role', 'button');
    expect(root(container)).toHaveAttribute('tabindex', '0');
  });

  it.each(['Enter', ' '])('activates on %s', (key) => {
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick} title="Card" />);

    fireEvent.keyDown(root(container), { key });
    expect(onClick, `${key} did not activate a card that says it is a button`).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const onClick = vi.fn();
    const { container } = render(<Card onClick={onClick} title="Card" />);

    fireEvent.keyDown(root(container), { key: 'a' });
    fireEvent.keyDown(root(container), { key: 'Escape' });
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe.each(ENGINES)('$name engine: a card that is merely styled clickable is not a button', ({ Card }) => {
  it('mints no role and no tab stop', () => {
    // A focusable `role="button"` with no activation path is worse than no
    // affordance at all: it tells a screen reader a lie and traps a Tab.
    const { container } = render(<Card clickable title="Card" />);
    expect(root(container)).not.toHaveAttribute('role');
    expect(root(container)).not.toHaveAttribute('tabindex');
  });
});
