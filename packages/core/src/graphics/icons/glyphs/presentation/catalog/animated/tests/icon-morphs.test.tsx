/**
 * HamburgerToX / CopyToCheck icon-morph tests (WO-CRA-07).
 *
 * Neither morph existed before this WO. These tests fail if the open/copied
 * boolean stops driving the transform/opacity values, or if the
 * reduced-motion guard is deleted.
 */
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';

import { HamburgerToX } from '../hamburger-to-x';
import { CopyToCheck } from '../copy-to-check';

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

describe('HamburgerToX', () => {
  it('renders three bars with no rotation and full middle-bar opacity when closed', () => {
    stubReducedMotion(false);
    const { container } = render(<HamburgerToX open={false} />);

    const top = container.querySelector('[data-bar="top"]') as HTMLElement;
    const middle = container.querySelector('[data-bar="middle"]') as HTMLElement;
    const bottom = container.querySelector('[data-bar="bottom"]') as HTMLElement;

    expect(top.style.transform).toBe('none');
    expect(bottom.style.transform).toBe('none');
    expect(middle.style.opacity).toBe('1');
  });

  it('rotates the top/bottom bars into an X and hides the middle bar when open', () => {
    stubReducedMotion(false);
    const { container } = render(<HamburgerToX open />);

    const top = container.querySelector('[data-bar="top"]') as HTMLElement;
    const middle = container.querySelector('[data-bar="middle"]') as HTMLElement;
    const bottom = container.querySelector('[data-bar="bottom"]') as HTMLElement;

    expect(top.style.transform).toContain('rotate(45deg)');
    expect(bottom.style.transform).toContain('rotate(-45deg)');
    expect(middle.style.opacity).toBe('0');
  });

  it('uses only transform and opacity -- no other animatable property changes with `open`', () => {
    stubReducedMotion(false);
    const { container: closedContainer } = render(<HamburgerToX open={false} />);
    const { container: openContainer } = render(<HamburgerToX open />);

    const closedTop = (closedContainer.querySelector('[data-bar="top"]') as HTMLElement).style;
    const openTop = (openContainer.querySelector('[data-bar="top"]') as HTMLElement).style;

    // Every non-transform/opacity/transition declaration must be identical
    // between the two states.
    expect(closedTop.left).toBe(openTop.left);
    expect(closedTop.width).toBe(openTop.width);
    expect(closedTop.height).toBe(openTop.height);
    expect(closedTop.top).toBe(openTop.top);
    expect(closedTop.background).toBe(openTop.background);
  });

  it('disables the bar transition under prefers-reduced-motion', () => {
    stubReducedMotion(true);
    const { container } = render(<HamburgerToX open />);
    const top = container.querySelector('[data-bar="top"]') as HTMLElement;
    expect(top.style.transition).toBe('none');
  });
});

describe('CopyToCheck', () => {
  it('shows the copy icon and hides the check icon when not copied', () => {
    stubReducedMotion(false);
    const { container } = render(<CopyToCheck copied={false} />);

    const [copyLayer, checkLayer] = Array.from(container.querySelectorAll('span[aria-hidden]')) as HTMLElement[];
    expect(copyLayer.getAttribute('aria-hidden')).toBe('false');
    expect(copyLayer.style.opacity).toBe('1');
    expect(checkLayer.getAttribute('aria-hidden')).toBe('true');
    expect(checkLayer.style.opacity).toBe('0');
  });

  it('shows the check icon and hides the copy icon when copied', () => {
    stubReducedMotion(false);
    const { container } = render(<CopyToCheck copied />);

    const [copyLayer, checkLayer] = Array.from(container.querySelectorAll('span[aria-hidden]')) as HTMLElement[];
    expect(copyLayer.getAttribute('aria-hidden')).toBe('true');
    expect(copyLayer.style.opacity).toBe('0');
    expect(checkLayer.getAttribute('aria-hidden')).toBe('false');
    expect(checkLayer.style.opacity).toBe('1');
  });

  it('disables the crossfade transition under prefers-reduced-motion', () => {
    stubReducedMotion(true);
    const { container } = render(<CopyToCheck copied={false} />);
    const [copyLayer] = Array.from(container.querySelectorAll('span[aria-hidden]')) as HTMLElement[];
    expect(copyLayer.style.transition).toBe('none');
  });
});
