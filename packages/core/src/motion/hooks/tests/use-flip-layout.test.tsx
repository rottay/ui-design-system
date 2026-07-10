import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFlipLayout } from '../use-flip-layout';
import { mockMatchMedia } from '../../../_internal/testing/helpers/match-media';

/**
 * happy-dom does not implement the Web Animations API (`Element.animate`/
 * `getAnimations`), same as the native View Transitions API it also lacks
 * (see use-view-transition.test.tsx). Installed directly on the prototype
 * for this file only -- each vitest file runs in its own fork
 * (vitest.config.ts), so this does not leak into other test files.
 */
type AnimateCall = { keyframes: unknown; options: unknown; target: Element };

let animateCalls: AnimateCall[];
let cancelSpy: ReturnType<typeof vi.fn>;
let commitStylesSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  animateCalls = [];
  cancelSpy = vi.fn();
  commitStylesSpy = vi.fn();

  Element.prototype.animate = function (this: Element, keyframes: unknown, options: unknown) {
    animateCalls.push({ keyframes, options, target: this });
    let finishedResolve!: () => void;
    const finished = new Promise<void>((resolve) => {
      finishedResolve = resolve;
    });
    finishedResolve();
    return {
      cancel: cancelSpy,
      commitStyles: commitStylesSpy,
      finished,
    } as unknown as Animation;
  } as typeof Element.prototype.animate;

  Element.prototype.getAnimations = vi.fn(() => []) as typeof Element.prototype.getAnimations;

  mockMatchMedia(1280, false);
});

afterEach(() => {
  // @ts-expect-error -- removing the test-local WAAPI polyfill installed above.
  delete Element.prototype.animate;
  // @ts-expect-error -- removing the test-local WAAPI polyfill installed above.
  delete Element.prototype.getAnimations;
  vi.restoreAllMocks();
});

/** A single flip-registered box whose rect the test drives via the `x` prop, so getBoundingClientRect() differs between "first" and "last" without a real layout engine. The stub is set directly in the ref callback (commit-phase, before any layout effect -- including useFlipLayout's own) rather than in a separate useLayoutEffect, so useFlipLayout's measurement always sees the CURRENT render's `x`, not a stale one from before hook-ordering resolves. */
function FlipHarness({ x }: { x: number }) {
  const { register, measure } = useFlipLayout<'box'>();

  return (
    <button
      type="button"
      data-testid="measure-button"
      onClick={() => measure()}
    >
      <div
        data-testid="box"
        ref={(node) => {
          register('box')(node);
          if (node) {
            node.getBoundingClientRect = () =>
              ({ left: x, top: 0, right: x + 100, bottom: 40, width: 100, height: 40, x, y: 0, toJSON() {} }) as DOMRect;
          }
        }}
        style={{ transitionDuration: 'unused' } as React.CSSProperties}
      />
    </button>
  );
}

describe('useFlipLayout', () => {
  it('plays a transform-only invert animation when a registered node moves after measure()', () => {
    const { rerender, getByTestId } = render(<FlipHarness x={0} />);
    const box = getByTestId('box');
    box.style.setProperty('--ds-motion-normal', '200ms');
    box.style.setProperty('--ds-motion-ease-out', 'ease-out');

    act(() => {
      getByTestId('measure-button').click(); // measure() at x=0
    });
    rerender(<FlipHarness x={100} />); // DOM update moves the box to x=100

    expect(animateCalls).toHaveLength(1);
    const [call] = animateCalls;
    expect(call.target).toBe(box);
    expect(call.options).toMatchObject({ duration: 200, easing: 'ease-out', fill: 'both' });
    const keyframes = call.keyframes as Array<{ transform: string }>;
    // Inverted delta: first(x=0) - last(x=100) = -100.
    expect(keyframes[0].transform).toContain('translate(-100px, 0px)');
    expect(keyframes[1].transform).toBe('none');
  });

  it('does not animate when the node did not move', () => {
    const { rerender, getByTestId } = render(<FlipHarness x={50} />);
    const box = getByTestId('box');
    box.style.setProperty('--ds-motion-normal', '200ms');

    act(() => {
      getByTestId('measure-button').click();
    });
    rerender(<FlipHarness x={50} />); // same position

    expect(animateCalls).toHaveLength(0);
  });

  it('does nothing when measure() was not called before the update', () => {
    const { rerender } = render(<FlipHarness x={0} />);
    rerender(<FlipHarness x={100} />); // moved, but no measure() snapshot armed

    expect(animateCalls).toHaveLength(0);
  });

  it('skips animating entirely under reduced motion', () => {
    mockMatchMedia(1280, true);
    const { rerender, getByTestId } = render(<FlipHarness x={0} />);
    const box = getByTestId('box');
    box.style.setProperty('--ds-motion-normal', '200ms');

    act(() => {
      getByTestId('measure-button').click();
    });
    rerender(<FlipHarness x={100} />);

    expect(animateCalls).toHaveLength(0);
  });

  it('cancels (via commitStyles then cancel) any animation already in flight on the node before starting a new one', () => {
    Element.prototype.getAnimations = vi.fn(() => [{ cancel: cancelSpy, commitStyles: commitStylesSpy }]) as unknown as typeof Element.prototype.getAnimations;

    const { rerender, getByTestId } = render(<FlipHarness x={0} />);
    const box = getByTestId('box');
    box.style.setProperty('--ds-motion-normal', '200ms');

    act(() => {
      getByTestId('measure-button').click();
    });
    rerender(<FlipHarness x={100} />);

    expect(commitStylesSpy).toHaveBeenCalledTimes(1);
    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('does not animate a newly-appeared key it has no prior measurement for', () => {
    function TwoKeys({ withSecond }: { withSecond: boolean }) {
      const { register, measure } = useFlipLayout<'a' | 'b'>();
      return (
        <button type="button" data-testid="measure" onClick={() => measure()}>
          <div data-testid="a" ref={register('a')} />
          {withSecond && <div data-testid="b" ref={register('b')} />}
        </button>
      );
    }

    const { rerender, getByTestId } = render(<TwoKeys withSecond={false} />);
    act(() => {
      getByTestId('measure').click();
    });
    rerender(<TwoKeys withSecond={true} />);

    // Only 'a' had a prior snapshot; 'b' just appeared and must not be
    // treated as having moved (it has nothing to invert from).
    expect(animateCalls.every((c) => c.target === getByTestId('a'))).toBe(true);
  });
});
