/**
 * Pass-through honesty law contract (audit SKN-03, governed by P-88 since the
 * owner ruling of 2026-10-06, which supersedes the P-79 caller-wins wording):
 * callers win on `id`, `aria-*`, and every `data-*` attribute other than the
 * anatomy channels. A skinned Button keeps its canonical `data-part="trigger"`
 * and its engine `data-state`; a caller `data-part`/`data-state` cannot replace
 * them and is not forwarded to the trigger. The runtime does not honour that yet
 * (ARC-12): every engine still lets a caller part win, classic forwards a caller
 * state (D2) and modern/rustic forward a resting caller state (D3). Those cases
 * are `it.fails` KNOWN DEBT pins that turn red the day the fix lands. The law is
 * documented on `BaseComponentProps` in `foundation/contracts/kernel/common`.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import ClassicButton from '../engines/classic';
import ModernButton from '../engines/modern';
import RusticButton from '../engines/rustic';

const passthrough = {
  id: 'caller-button-id',
  'aria-label': 'Caller label',
  'data-custom': 'caller-data',
  // P-88: the caller must NOT win on the part; the pins below register the ARC-12 debt.
  'data-part': 'caller-part-attempt',
} as const;

describe('Button pass-through honesty law', () => {
  it('modern: forwards id/aria-label/data-* to the trigger', () => {
    const { container } = render(<ModernButton {...passthrough}>Go</ModernButton>);

    const button = container.querySelector('button.ds-button--modern') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('id', 'caller-button-id');
    expect(button).toHaveAttribute('aria-label', 'Caller label');
    expect(button).toHaveAttribute('data-custom', 'caller-data');
  });

  it.fails('KNOWN DEBT (ARC-12): modern: the caller data-part does not win and the trigger keeps data-part="trigger" (P-88)', () => {
    const { container } = render(<ModernButton {...passthrough}>Go</ModernButton>);

    const button = container.querySelector('button.ds-button--modern') as HTMLButtonElement;
    expect(button).not.toHaveAttribute('data-part', 'caller-part-attempt');
    expect(button).toHaveAttribute('data-part', 'trigger');
  });

  it.fails('KNOWN DEBT (ARC-12): modern anchor path: the caller data-part does not win and the <a> keeps data-part="trigger" (P-88)', () => {
    const { container } = render(
      <ModernButton href="/somewhere" {...passthrough}>
        Go
      </ModernButton>
    );

    const anchor = container.querySelector('a.ds-button--modern') as HTMLAnchorElement;
    expect(anchor).not.toHaveAttribute('data-part', 'caller-part-attempt');
    expect(anchor).toHaveAttribute('data-part', 'trigger');
  });

  it('modern: stamps the default data-part="trigger" when the caller passes none', () => {
    const { container } = render(<ModernButton>Go</ModernButton>);

    const button = container.querySelector('button.ds-button--modern') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('data-part', 'trigger');
  });

  it('rustic button path: forwards id/aria-label/data-* to the trigger', () => {
    const { container } = render(<RusticButton {...passthrough}>Go</RusticButton>);

    const button = container.querySelector('button.rottay-button--rustic') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('id', 'caller-button-id');
    expect(button).toHaveAttribute('aria-label', 'Caller label');
    expect(button).toHaveAttribute('data-custom', 'caller-data');
  });

  it.fails('KNOWN DEBT (ARC-12): rustic button path: the caller data-part does not win and the trigger keeps data-part="trigger" (P-88)', () => {
    const { container } = render(<RusticButton {...passthrough}>Go</RusticButton>);

    const button = container.querySelector('button.rottay-button--rustic') as HTMLButtonElement;
    expect(button).not.toHaveAttribute('data-part', 'caller-part-attempt');
    expect(button).toHaveAttribute('data-part', 'trigger');
  });

  it('rustic anchor path: forwards id/aria-label/data-* to the rendered <a>', () => {
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
  });

  it.fails('KNOWN DEBT (ARC-12): rustic anchor path: the caller data-part does not win and the <a> keeps data-part="trigger" (P-88)', () => {
    const { container } = render(
      <RusticButton href="/somewhere" {...passthrough}>
        Go
      </RusticButton>
    );

    const anchor = container.querySelector('a.rottay-button--rustic') as HTMLAnchorElement;
    expect(anchor).not.toHaveAttribute('data-part', 'caller-part-attempt');
    expect(anchor).toHaveAttribute('data-part', 'trigger');
  });

  it('classic: forwards id/aria-label/data-* through AntD to the trigger', () => {
    const { container } = render(<ClassicButton {...passthrough}>Go</ClassicButton>);

    const button = container.querySelector('.rottay-button--classic') as HTMLElement;
    expect(button).toBeTruthy();
    expect(button).toHaveAttribute('id', 'caller-button-id');
    expect(button).toHaveAttribute('aria-label', 'Caller label');
    expect(button).toHaveAttribute('data-custom', 'caller-data');
  });

  it.fails('KNOWN DEBT (ARC-12): classic: the caller data-part does not win and the trigger keeps data-part="trigger" (P-88)', () => {
    const { container } = render(<ClassicButton {...passthrough}>Go</ClassicButton>);

    const button = container.querySelector('.rottay-button--classic') as HTMLElement;
    expect(button).not.toHaveAttribute('data-part', 'caller-part-attempt');
    expect(button).toHaveAttribute('data-part', 'trigger');
  });

  // P-88 state arm (kernel/common BaseComponentProps): a caller data-state cannot
  // replace the engine-stamped data-state on the trigger the engine owns.
  it('modern: a caller data-state does not replace the engine-stamped trigger state (P-88)', () => {
    const { container } = render(
      <ModernButton disabled data-state="caller-state-attempt">
        Go
      </ModernButton>
    );

    const button = container.querySelector('button.ds-button--modern') as HTMLButtonElement;
    expect(button).toHaveAttribute('data-state', 'disabled');
  });

  it('rustic button path: a caller data-state does not replace the engine-stamped trigger state (P-88)', () => {
    const { container } = render(
      <RusticButton disabled data-state="caller-state-attempt">
        Go
      </RusticButton>
    );

    const button = container.querySelector('button.rottay-button--rustic') as HTMLButtonElement;
    expect(button).toHaveAttribute('data-state', 'disabled');
  });

  it('rustic anchor path: a caller data-state does not replace the engine-stamped trigger state (P-88)', () => {
    const { container } = render(
      <RusticButton href="/somewhere" data-state="caller-state-attempt">
        Go
      </RusticButton>
    );

    const anchor = container.querySelector('a.rottay-button--rustic') as HTMLAnchorElement;
    fireEvent.pointerEnter(anchor);
    expect(anchor).toHaveAttribute('data-state', 'hovered');
  });

  it.fails('KNOWN DEBT (ARC-12): classic: a caller data-state does not replace the engine-owned trigger state (P-88, D2)', () => {
    const { container } = render(
      <ClassicButton data-state="caller-state-attempt">Go</ClassicButton>
    );

    const button = container.querySelector('.rottay-button--classic') as HTMLElement;
    expect(button).not.toHaveAttribute('data-state', 'caller-state-attempt');
  });

  // P-88 D3: at rest the engine stamps no data-state, so a caller value must not appear.
  it.fails('KNOWN DEBT (ARC-12): modern Button should not forward a resting caller data-state', () => {
    const { container } = render(<ModernButton data-state="caller-state-attempt">Go</ModernButton>);

    const button = container.querySelector('button.ds-button--modern') as HTMLButtonElement;
    expect(button).not.toHaveAttribute('data-state', 'caller-state-attempt');
  });

  it.fails('KNOWN DEBT (ARC-12): modern Button anchor path should not forward a resting caller data-state', () => {
    const { container } = render(
      <ModernButton href="/somewhere" data-state="caller-state-attempt">
        Go
      </ModernButton>
    );

    const anchor = container.querySelector('a.ds-button--modern') as HTMLAnchorElement;
    expect(anchor).not.toHaveAttribute('data-state', 'caller-state-attempt');
  });

  it.fails('KNOWN DEBT (ARC-12): rustic Button should not forward a resting caller data-state', () => {
    const { container } = render(<RusticButton data-state="caller-state-attempt">Go</RusticButton>);

    const button = container.querySelector('button.rottay-button--rustic') as HTMLButtonElement;
    expect(button).not.toHaveAttribute('data-state', 'caller-state-attempt');
  });

  it.fails('KNOWN DEBT (ARC-12): rustic Button anchor path should not forward a resting caller data-state', () => {
    const { container } = render(
      <RusticButton href="/somewhere" data-state="caller-state-attempt">
        Go
      </RusticButton>
    );

    const anchor = container.querySelector('a.rottay-button--rustic') as HTMLAnchorElement;
    expect(anchor).not.toHaveAttribute('data-state', 'caller-state-attempt');
  });
});
