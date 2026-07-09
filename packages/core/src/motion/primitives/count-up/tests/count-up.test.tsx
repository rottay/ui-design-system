/**
 * CountUp tabular-numerals + reduced-motion tests (WO-CRA-07).
 *
 * Before this WO, `motion/primitives/count-up/index.tsx` applied no tabular-
 * numeral styling at all (confirmed by grep: zero hits for `tabular` or
 * `font-variant` in the file), so digits jittered column-to-column as the
 * value ticked. These tests fail if the `ds-nums-tabular` class (CRA-01,
 * `foundation/base/typography.css`) is ever removed from the digit span, and
 * separately prove the pre-existing reduced-motion path still renders the
 * final value with no animated ramp.
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import * as framerMotion from 'framer-motion';

import { CountUp } from '..';
import { renderSurface } from '../../../../components/surfaces/foundation/common/test-utils';

// `useSpring`'s `duration` argument is the actual reduced-motion contract:
// `shouldReduceMotion ? 0 : duration * 1000` (count-up/index.tsx). Spying on
// it proves the guard deterministically, without depending on framer-motion's
// real frame loop settling in test time (which is slow/flaky in this
// environment and not what the guard itself is responsible for).
//
// `useReducedMotion` is mocked directly (not via a `matchMedia` stub):
// framer-motion reads the media query through its own internal caching, so a
// per-test `window.matchMedia` stub set after the module first evaluates does
// not reliably reach it. Mocking the hook is also the correctly-scoped unit
// test here -- this suite verifies CountUp's consumption of the flag, not
// framer-motion's own browser integration.
const useReducedMotionMock = vi.fn(() => false);
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useSpring: vi.fn(actual.useSpring), useReducedMotion: () => useReducedMotionMock() };
});

class IntersectionObserverMock {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe = vi.fn((element: Element) => {
    this.callback(
      [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  });

  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  useReducedMotionMock.mockReset().mockReturnValue(false);
});

describe('CountUp tabular numerals', () => {
  it('applies the ds-nums-tabular class to the digit span so digits never jitter', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
    stubMatchMedia(false);

    renderSurface(<CountUp from={0} to={1250} />);

    const digitSpan = screen.getByText('0', { exact: false });
    expect(digitSpan.className).toContain('ds-nums-tabular');
  });

  it('keeps the tabular class when a prefix/suffix and custom formatter are used', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
    stubMatchMedia(false);

    renderSurface(<CountUp from={0} to={99} prefix="$" suffix="k" formatter={(n) => n.toFixed(0)} />);

    const digitSpan = screen.getByText('$0k', { exact: false });
    expect(digitSpan.className).toContain('ds-nums-tabular');
  });
});

describe('CountUp reduced motion', () => {
  it('collapses the spring duration to 0 when prefers-reduced-motion is set', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
    stubMatchMedia(true);
    useReducedMotionMock.mockReturnValue(true);

    renderSurface(<CountUp from={0} to={500} duration={2} />);

    const useSpringMock = framerMotion.useSpring as unknown as ReturnType<typeof vi.fn>;
    expect(useSpringMock).toHaveBeenCalled();
    const [, options] = useSpringMock.mock.calls[useSpringMock.mock.calls.length - 1];
    expect(options.duration).toBe(0);
  });

  it('uses the full duration when motion is not reduced, proving the branch is real', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
    stubMatchMedia(false);

    renderSurface(<CountUp from={0} to={500} duration={2} />);

    const useSpringMock = framerMotion.useSpring as unknown as ReturnType<typeof vi.fn>;
    const [, options] = useSpringMock.mock.calls[useSpringMock.mock.calls.length - 1];
    // 2 seconds -> 2000ms, per `duration * 1000`. If the reduced-motion guard
    // were deleted (always 0, or always the literal duration), one of these
    // two tests would fail.
    expect(options.duration).toBe(2000);
  });
});
