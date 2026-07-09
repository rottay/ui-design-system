/**
 * usePulseOnChange / PulseValue tests (WO-CRA-07).
 *
 * Neither existed before this WO -- there was no data-changed pulse
 * mechanism anywhere in the codebase (grep for `pulse-changed` /
 * `usePulseOnChange` returned nothing). These tests fail if change detection
 * stops firing exactly once per change, if it fires on initial mount (which
 * would flash every cell on page load instead of only on live updates), or
 * if the remount-driven retrigger (the mechanism that lets a CSS
 * `animation` replay) is deleted.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, renderHook } from '@testing-library/react';

import { usePulseOnChange, PulseValue } from '../usePulseOnChange';

describe('usePulseOnChange', () => {
  it('does not report a pulse on initial mount', () => {
    const { result } = renderHook(({ value }) => usePulseOnChange(value), {
      initialProps: { value: 10 },
    });

    expect(result.current.hasPulsed).toBe(false);
    expect(result.current.pulseKey).toBe(0);
  });

  it('increments the pulse key exactly once per actual value change', () => {
    const { result, rerender } = renderHook(({ value }) => usePulseOnChange(value), {
      initialProps: { value: 10 },
    });

    rerender({ value: 20 });
    expect(result.current.hasPulsed).toBe(true);
    expect(result.current.pulseKey).toBe(1);

    // Re-rendering with the SAME value must not fire another pulse.
    rerender({ value: 20 });
    expect(result.current.pulseKey).toBe(1);

    rerender({ value: 30 });
    expect(result.current.pulseKey).toBe(2);
  });
});

describe('PulseValue', () => {
  it('renders without the ds-pulse-changed class on initial mount', () => {
    const { container } = render(<PulseValue value={10}>10</PulseValue>);
    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).not.toContain('ds-pulse-changed');
  });

  it('applies ds-pulse-changed and remounts the node once the value changes', () => {
    const { container, rerender } = render(<PulseValue value={10}>10</PulseValue>);
    const nodeBeforeChange = container.querySelector('span');

    rerender(<PulseValue value={20}>20</PulseValue>);
    const nodeAfterChange = container.querySelector('span') as HTMLElement;

    expect(nodeAfterChange.className).toContain('ds-pulse-changed');
    // A CSS `animation` only (re)plays on element insertion, not on a style
    // change to an existing node -- the retrigger depends on this being a
    // genuinely new DOM node, not the same node with an updated class.
    expect(nodeAfterChange).not.toBe(nodeBeforeChange);
  });

  it('preserves a caller-supplied className alongside ds-pulse-changed', () => {
    const { container, rerender } = render(
      <PulseValue value={10} className="price-cell">
        10
      </PulseValue>
    );
    rerender(
      <PulseValue value={20} className="price-cell">
        20
      </PulseValue>
    );

    const span = container.querySelector('span') as HTMLElement;
    expect(span.className).toContain('ds-pulse-changed');
    expect(span.className).toContain('price-cell');
  });
});
