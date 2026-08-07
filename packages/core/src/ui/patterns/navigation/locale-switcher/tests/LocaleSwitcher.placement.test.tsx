import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernLocaleSwitcher from '../engines/modern';

/**
 * P1 regression: the panel is anchored on the trigger's inline-start edge and
 * grows toward the inline-end, so a switcher sitting near that edge of a
 * narrow viewport used to push the panel past the viewport.
 */

const PANEL_WIDTH = 200;
const TRIGGER_WIDTH = 60;

function rect(left: number, width: number): DOMRect {
  return {
    x: left,
    y: 0,
    width,
    height: 32,
    top: 0,
    bottom: 32,
    left,
    right: left + width,
    toJSON: () => ({}),
  };
}

/** Places the switcher's root at `anchorLeft` in a `viewportWidth` viewport. */
function measureAt(anchorLeft: number, viewportWidth: number): void {
  Object.defineProperty(window, 'innerWidth', {
    value: viewportWidth,
    configurable: true,
    writable: true,
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function measured(this: HTMLElement): DOMRect {
      const part = this.getAttribute('data-part');
      if (part === 'panel') return rect(anchorLeft, PANEL_WIDTH);
      if (part === 'root') return rect(anchorLeft, TRIGGER_WIDTH);
      return rect(0, 0);
    },
  );
}

function openPanel(): HTMLElement {
  fireEvent.click(screen.getByTestId('locale-switcher-trigger'));
  return screen.getByTestId('locale-switcher-menu');
}

describe('LocaleSwitcher (modern) panel placement', () => {
  beforeEach(() => {
    document.documentElement.dir = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.dir = '';
  });

  it('flips to the inline-end anchor when the inline-start anchor overflows', () => {
    // 320px viewport, switcher at x=200: 120px of room, 200px of panel.
    measureAt(200, 320);
    render(<ModernLocaleSwitcher locale="en" onChange={vi.fn()} />);

    expect(openPanel()).toHaveAttribute('data-placement', 'end');
  });

  it('keeps the inline-start anchor when the panel fits', () => {
    measureAt(8, 320);
    render(<ModernLocaleSwitcher locale="en" onChange={vi.fn()} />);

    expect(openPanel()).toHaveAttribute('data-placement', 'start');
  });

  it('mirrors the overflow test under RTL', () => {
    document.documentElement.dir = 'rtl';
    // Under RTL the panel grows toward x=0 from the trigger's right edge:
    // right = 60 leaves 60px of room for a 200px panel, so it must flip.
    measureAt(0, 320);
    render(<ModernLocaleSwitcher locale="en" onChange={vi.fn()} />);

    expect(openPanel()).toHaveAttribute('data-placement', 'end');
  });

  it('restores the default anchor once the panel closes', () => {
    measureAt(200, 320);
    render(<ModernLocaleSwitcher locale="en" onChange={vi.fn()} />);

    expect(openPanel()).toHaveAttribute('data-placement', 'end');
    fireEvent.keyDown(screen.getByTestId('locale-switcher-trigger'), { key: 'Escape' });

    measureAt(8, 320);
    expect(openPanel()).toHaveAttribute('data-placement', 'start');
  });
});
