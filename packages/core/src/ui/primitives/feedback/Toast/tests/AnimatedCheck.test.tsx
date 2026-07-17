/**
 * AnimatedCheck draw-in tests (WO-CRA-07).
 *
 * AnimatedCheck did not exist before this WO. These tests fail if the
 * stroke-draw animation (dashoffset 1 -> 0) stops being wired, if it is ever
 * given a non-default iteration count (it must draw exactly once), or if the
 * reduced-motion guard -- render fully drawn, no animation at all -- is
 * deleted.
 */
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import { render } from '@testing-library/react';

import { AnimatedCheck } from '../compound/AnimatedCheck';

function stubReducedMotion(reduced: boolean) {
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
});

describe('AnimatedCheck', () => {
  it('draws the check via a normalized (pathLength=1) stroke-dashoffset animation', () => {
    stubReducedMotion(false);
    const { container } = render(<AnimatedCheck />);

    const path = container.querySelector('path') as SVGPathElement;
    expect(path.getAttribute('pathLength')).toBe('1');
    expect(path.style.strokeDasharray).toBe('1');
    // Starts hidden (dashoffset 1) and the injected keyframe animates it to 0.
    expect(path.style.strokeDashoffset).toBe('1');
    expect(path.style.animationName).toBeTruthy();
    expect(path.style.animationDuration).toBe('var(--ds-motion-slow)');
    expect(path.style.animationTimingFunction).toBe('var(--ds-motion-ease-out)');

    const styleTag = container.querySelector('style');
    expect(styleTag?.textContent).toContain('stroke-dashoffset:1');
    expect(styleTag?.textContent).toContain('stroke-dashoffset:0');
  });

  it('never sets a non-default (or infinite) animation-iteration-count -- it must draw exactly once', () => {
    stubReducedMotion(false);
    const { container } = render(<AnimatedCheck />);
    const path = container.querySelector('path') as SVGPathElement;
    expect(path.style.animationIterationCount).toBe('');
    expect(path.getAttribute('style')).not.toContain('infinite');
  });

  it('renders fully drawn with no animation at all under prefers-reduced-motion', () => {
    stubReducedMotion(true);
    const { container } = render(<AnimatedCheck />);

    const path = container.querySelector('path') as SVGPathElement;
    expect(path.style.strokeDashoffset).toBe('0');
    expect(path.style.animationName).toBeFalsy();
    // No keyframe stylesheet is even injected -- there is nothing to guard.
    expect(container.querySelector('style')).toBeNull();
  });

  it('accepts a custom size, stroke width, and color', () => {
    stubReducedMotion(false);
    const { container } = render(<AnimatedCheck size={32} strokeWidth={4} color="var(--ds-color-primary)" />);

    const svg = container.querySelector('svg') as SVGSVGElement;
    const path = container.querySelector('path') as SVGPathElement;
    expect(svg.getAttribute('width')).toBe('32');
    expect(path.getAttribute('stroke-width')).toBe('4');
    expect(path.getAttribute('stroke')).toBe('var(--ds-color-primary)');
  });
});
