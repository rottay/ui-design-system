/**
 * Pass-through honesty law contract (audit SKN-03): engines win on `data-part`;
 * callers win on `id`, `aria-*`, and every other `data-*` attribute. Every
 * engine render path (including rustic's anchor branch) must forward the
 * caller's passthrough to the element it owns and stamp `data-part="trigger"`
 * after it. The law is documented on `BaseComponentProps` in
 * `foundation/contracts/kernel/common`.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ClassicButton from '../engines/classic';
import ModernButton from '../engines/modern';
import RusticButton from '../engines/rustic';

const passthrough = {
  id: 'caller-button-id',
  'aria-label': 'Caller label',
  'data-custom': 'caller-data',
  // The one attribute the caller must NOT win: the engine re-stamps its part.
  'data-part': 'caller-part-attempt',
} as const;

describe('Button pass-through honesty law', () => {
  it('modern: forwards id/aria-label/data-* and keeps data-part="trigger"', () => {
    const { container } = render(<ModernButton {...passthrough}>Go</ModernButton>);

    const button = container.querySelector('button.rottay-button--modern') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('id', 'caller-button-id');
    expect(button).toHaveAttribute('aria-label', 'Caller label');
    expect(button).toHaveAttribute('data-custom', 'caller-data');
    expect(button).toHaveAttribute('data-part', 'trigger');
  });

  it('rustic button path: forwards id/aria-label/data-* and keeps data-part="trigger"', () => {
    const { container } = render(<RusticButton {...passthrough}>Go</RusticButton>);

    const button = container.querySelector('button.rottay-button--rustic') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('id', 'caller-button-id');
    expect(button).toHaveAttribute('aria-label', 'Caller label');
    expect(button).toHaveAttribute('data-custom', 'caller-data');
    expect(button).toHaveAttribute('data-part', 'trigger');
  });

  it('rustic anchor path: obeys the same law on the rendered <a>', () => {
    const { container } = render(
      <RusticButton href="/somewhere" {...passthrough}>
        Go
      </RusticButton>
    );

    const anchor = container.querySelector('a.rottay-button--rustic') as HTMLAnchorElement;
    expect(anchor).toBeTruthy();
    expect(anchor).toHaveAttribute('href', '/somewhere');
    expect(anchor).toHaveAttribute('id', 'caller-button-id');
    expect(anchor).toHaveAttribute('aria-label', 'Caller label');
    expect(anchor).toHaveAttribute('data-custom', 'caller-data');
    expect(anchor).toHaveAttribute('data-part', 'trigger');
  });

  it('classic: forwards id/aria-label/data-* through AntD and stamps data-part="trigger"', () => {
    const { container } = render(<ClassicButton {...passthrough}>Go</ClassicButton>);

    const button = container.querySelector('.rottay-button--classic') as HTMLElement;
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('id', 'caller-button-id');
    expect(button).toHaveAttribute('aria-label', 'Caller label');
    expect(button).toHaveAttribute('data-custom', 'caller-data');
    expect(button).toHaveAttribute('data-part', 'trigger');
  });
});
