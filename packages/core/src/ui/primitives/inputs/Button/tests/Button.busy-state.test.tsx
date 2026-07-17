/**
 * Busy-state consolidation tests (WO-CRA-02).
 *
 * Pins three things an adversarial review found missing:
 * 1. The precedence order `resolveButtonBusyState` implements across the
 *    overlapping busy props (`pending`/`pendingLabel` vs the deprecated
 *    `loading`/`loadingText`).
 * 2. That a `pending` button never fires `onClick`.
 * 3. That the modern engine's `pending` posture is UNCONDITIONALLY
 *    width-stable -- not just when `pendingLabel` happens to be short.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { resolveButtonBusyState } from '../contracts';
import ModernButton from '../engines/modern';
import ClassicButton from '../engines/classic';
import RusticButton from '../engines/rustic';

describe('resolveButtonBusyState (busy-prop resolution order)', () => {
  it('is not busy when neither pending nor loading is set', () => {
    expect(resolveButtonBusyState({})).toEqual({
      busy: false,
      widthStable: false,
      label: undefined,
    });
  });

  it('is busy via the deprecated loading alone, without width stability', () => {
    expect(resolveButtonBusyState({ loading: true })).toEqual({
      busy: true,
      widthStable: false,
      label: undefined,
    });
  });

  it('is busy and width-stable via pending alone', () => {
    expect(resolveButtonBusyState({ pending: true })).toEqual({
      busy: true,
      widthStable: true,
      label: undefined,
    });
  });

  it('keeps width stability when both pending and the deprecated loading are set (pending wins the render path)', () => {
    expect(resolveButtonBusyState({ pending: true, loading: true })).toEqual({
      busy: true,
      widthStable: true,
      label: undefined,
    });
  });

  it('resolves pendingLabel over the deprecated loadingText when both are set', () => {
    expect(
      resolveButtonBusyState({
        pending: true,
        pendingLabel: 'Saving',
        loading: true,
        loadingText: 'Loading legacy',
      }).label
    ).toBe('Saving');
  });

  it('falls back to the deprecated loadingText when pendingLabel is absent', () => {
    expect(resolveButtonBusyState({ loading: true, loadingText: 'Verifying...' }).label).toBe(
      'Verifying...'
    );
  });

  it('resolves no label when neither pendingLabel nor loadingText is set', () => {
    expect(resolveButtonBusyState({ pending: true }).label).toBeUndefined();
  });
});

describe('ModernButton pending posture', () => {
  it('does not fire onClick while pending', () => {
    const handleClick = vi.fn();
    render(
      <ModernButton pending onClick={handleClick}>
        Save
      </ModernButton>
    );

    // Not queried by accessible name: a `pending` button with no
    // `pendingLabel` has no visible/accessible text in the modern engine
    // (the resting label is `visibility: hidden`, pre-existing behavior this
    // change does not alter) -- there is exactly one button in this render.
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders the deprecated loadingText as the busy label when set via loading alone', () => {
    render(
      <ModernButton loading loadingText="Verifying...">
        Continue
      </ModernButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Verifying...');
    // loadingText must never leak onto the DOM as a raw attribute.
    expect(button).not.toHaveAttribute('loadingtext');
  });

  it('prefers pendingLabel over loadingText when both are set', () => {
    render(
      <ModernButton pending pendingLabel="Saving" loadingText="Legacy label">
        Continue
      </ModernButton>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Saving');
  });
});

/**
 * happy-dom (this project's test environment) does not compute real CSS
 * layout, so `offsetWidth` is always 0 on every element. This measures a
 * deterministic pseudo-width from the DOM tree using the two CSS rules the
 * `pending` posture's width-stability depends on:
 *   - `display: none` and `position: absolute` remove an element from normal
 *     flow, so it contributes 0 to its parent's auto width.
 *   - Everything else (including `visibility: hidden`, which still occupies
 *     space) contributes the sum of its children, or its own trimmed text
 *     length for a leaf.
 * If the modern engine's overlay ever loses its `position: absolute` (or the
 * hidden reserve layer loses its normal-flow placement), this measurement
 * changes and the assertions below fail.
 */
function measureFlowWidth(el: Element): number {
  const style = (el as HTMLElement).style;
  if (style.display === 'none' || style.position === 'absolute') {
    return 0;
  }
  const children = Array.from(el.children);
  if (children.length === 0) {
    return (el.textContent ?? '').trim().length;
  }
  return children.reduce((sum, child) => sum + measureFlowWidth(child), 0);
}

function stubOffsetWidth(el: HTMLElement): void {
  Object.defineProperty(el, 'offsetWidth', {
    configurable: true,
    get: () => measureFlowWidth(el),
  });
}

describe('ModernButton pending width stability', () => {
  it('never changes the button offsetWidth, even when pendingLabel is longer than the resting label', () => {
    const { rerender } = render(<ModernButton>Save</ModernButton>);
    const button = screen.getByRole('button', { name: /save/i });
    stubOffsetWidth(button);

    const restingWidth = button.offsetWidth;
    expect(restingWidth).toBeGreaterThan(0);

    rerender(<ModernButton pending>Save</ModernButton>);
    expect(button.offsetWidth).toBe(restingWidth);

    rerender(
      <ModernButton pending pendingLabel="Saving your extremely long document title now">
        Save
      </ModernButton>
    );
    expect(button.offsetWidth).toBe(restingWidth);
  });

  it('stays width-stable with icon and full-width buttons too', () => {
    const { rerender } = render(
      <ModernButton fullWidth icon={<span>*</span>}>
        Publish changes
      </ModernButton>
    );
    const button = screen.getByRole('button', { name: /publish changes/i });
    stubOffsetWidth(button);

    const restingWidth = button.offsetWidth;
    expect(restingWidth).toBeGreaterThan(0);

    rerender(
      <ModernButton fullWidth icon={<span>*</span>} pending pendingLabel="Publishing your changes to production">
        Publish changes
      </ModernButton>
    );
    expect(button.offsetWidth).toBe(restingWidth);
  });
});

describe('ClassicButton legacy busy props', () => {
  it('renders the deprecated loadingText as content while busy and does not leak it onto the DOM', () => {
    render(
      <ClassicButton loading loadingText="Verifying...">
        Continue
      </ClassicButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Verifying...');
    expect(button).not.toHaveTextContent('Continue');
    expect(button).not.toHaveAttribute('loadingtext');
  });

  it('prefers pendingLabel over loadingText when both are set', () => {
    render(
      <ClassicButton pending pendingLabel="Saving" loadingText="Legacy label">
        Continue
      </ClassicButton>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Saving');
  });

  it('does not fire onClick while pending', () => {
    const handleClick = vi.fn();
    render(
      <ClassicButton pending onClick={handleClick}>
        Save
      </ClassicButton>
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('RusticButton legacy busy props', () => {
  it('renders the deprecated loadingText as content while busy and does not leak it onto the DOM', () => {
    render(
      <RusticButton loading loadingText="Verifying...">
        Continue
      </RusticButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Verifying...');
    expect(button).not.toHaveAttribute('loadingtext');
  });

  it('prefers pendingLabel over loadingText when both are set', () => {
    render(
      <RusticButton pending pendingLabel="Saving" loadingText="Legacy label">
        Continue
      </RusticButton>
    );

    expect(screen.getByRole('button')).toHaveTextContent('Saving');
  });

  it('does not fire onClick while pending', () => {
    const handleClick = vi.fn();
    render(
      <RusticButton pending onClick={handleClick}>
        Save
      </RusticButton>
    );

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
