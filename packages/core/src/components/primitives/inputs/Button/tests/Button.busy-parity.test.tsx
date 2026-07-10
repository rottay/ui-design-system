/**
 * @fileoverview A busy button is inert in both interactive engines (P-50).
 *
 * `behavior/anatomy.ts` centralises the hover/press/focus triad so two skins of
 * one component cannot disagree about what a press is. The disagreement moved
 * into the hook's argument instead: the modern engine constructed the triad with
 * `disabled: disabled || busy`, the rustic engine with `disabled` alone, and a
 * busy rustic button published `hovered` and `pressed` on the DOM.
 *
 * A skin keyed on `[data-state~='hovered']` would animate a control that cannot
 * be activated. These tests are the contract; they render both engines through
 * the same table so a future engine cannot answer differently without turning
 * one of them red.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernButton from '../engines/modern';
import RusticButton from '../engines/rustic';

const ENGINES = [
  { name: 'modern', Button: ModernButton },
  { name: 'rustic', Button: RusticButton },
] as const;

/** The three ways a button can be told it must not be activated. */
const INERT_POSTURES = [
  { name: 'disabled', props: { disabled: true } },
  { name: 'pending', props: { pending: true } },
  { name: 'loading', props: { loading: true } },
] as const;

describe.each(ENGINES)('$name engine: an inert button reports no interaction', ({ Button }) => {
  it.each(INERT_POSTURES)('a $name button does not hover', ({ props }) => {
    render(<Button {...props}>Save</Button>);
    const button = screen.getByRole('button');

    fireEvent.pointerEnter(button);
    expect(button.getAttribute('data-state') ?? '').not.toContain('hovered');
  });

  it.each(INERT_POSTURES)('a $name button does not press', ({ props }) => {
    render(<Button {...props}>Save</Button>);
    const button = screen.getByRole('button');

    fireEvent.pointerDown(button);
    expect(button.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it.each(INERT_POSTURES)('a $name button draws no focus ring', ({ props }) => {
    render(<Button {...props}>Save</Button>);
    const button = screen.getByRole('button');

    fireEvent.focus(button);
    expect(button.getAttribute('data-state') ?? '').not.toContain('focus-visible');
  });
});

describe('and an idle button in either engine still does all three', () => {
  it.each(ENGINES)('$name', ({ Button }) => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button');

    fireEvent.pointerEnter(button);
    expect(button.getAttribute('data-state')).toContain('hovered');

    fireEvent.pointerDown(button);
    expect(button.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerUp(button);
    fireEvent.pointerLeave(button);
    fireEvent.focus(button);
    expect(button.getAttribute('data-state')).toContain('focus-visible');
  });
});
