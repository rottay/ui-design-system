/**
 * Pass-through honesty law contract (audit SKN-03, revised by P-79): callers
 * win on `id`, `aria-*`, and every other `data-*` attribute INCLUDING an
 * explicit `data-part` — a composing component owns the parts it names. The
 * engine stamps its own default root part only when the caller passed none.
 * Rustic keeps the historical engine-wins behavior until the Classic/Rustic
 * parity tranche (engine policy 2026-07-25: read-only in this wave). The law
 * is documented on `BaseComponentProps` in `foundation/contracts/kernel/common`.
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
  // P-79: an explicit caller part names the composing component's own part.
  'data-part': 'caller-part-attempt',
} as const;

describe('Button pass-through honesty law', () => {
  it('modern: forwards id/aria-label/data-* and the caller data-part wins', () => {
    const { container } = render(<ModernButton {...passthrough}>Go</ModernButton>);

    const button = container.querySelector('button.rottay-button--modern') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('id', 'caller-button-id');
    expect(button).toHaveAttribute('aria-label', 'Caller label');
    expect(button).toHaveAttribute('data-custom', 'caller-data');
    expect(button).toHaveAttribute('data-part', 'caller-part-attempt');
  });

  it('modern: stamps the default data-part="trigger" when the caller passes none', () => {
    const { container } = render(<ModernButton>Go</ModernButton>);

    const button = container.querySelector('button.rottay-button--modern') as HTMLButtonElement;
    expect(button).toBeTruthy();
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
