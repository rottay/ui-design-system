import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModernAffix from '../engines/modern';
import RusticAffix from '../engines/rustic';

function createRect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    top: 0,
    bottom: 48,
    left: 16,
    right: 216,
    width: 200,
    height: 48,
    x: 16,
    y: 0,
    toJSON: () => ({}),
    ...overrides,
  } as DOMRect;
}

describe('Affix runtime engines', () => {
  let placeholderRect = createRect({ top: 4, bottom: 52 });

  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      callback(1000);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => placeholderRect);

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders sticky mode for the modern engine without measurement tracking', () => {
    render(
      <ModernAffix offsetTop={24} zIndex={50} className="sticky-shell">
        <span>Sticky header</span>
      </ModernAffix>
    );

    const affix = screen.getByText('Sticky header').parentElement as HTMLDivElement;
    expect(affix).toHaveStyle({
      position: 'sticky',
      top: '24px',
      zIndex: '50',
    });
    expect(affix.className).toContain('z-50');
    expect(affix.className).toContain('sticky-shell');
  });

  it('tracks bottom affix state in the modern engine when the viewport threshold is crossed', async () => {
    const handleChange = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    placeholderRect = createRect({ top: 820, bottom: 895, left: 12, right: 212, width: 200, height: 75 });

    const { unmount } = render(
      <ModernAffix
        offsetBottom={10}
        onChange={handleChange}
        zIndex={30}
        className="action-bar"
      >
        <span>Actions</span>
      </ModernAffix>
    );

    const affix = (await screen.findByText('Actions')).parentElement as HTMLDivElement;

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(affix.style.position).toBe('fixed');
    });

    expect(affix.style.bottom).toBe('10px');
    expect(affix.className).toContain('shadow-md');
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

    placeholderRect = createRect({ top: 640, bottom: 715, left: 12, right: 212, width: 200, height: 75 });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(affix.style.position).toBe('');
    });

    expect(affix.className).not.toContain('shadow-md');

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('tracks top affix state and CSS variables in the rustic engine', async () => {
    const handleChange = vi.fn();
    placeholderRect = createRect({ top: 6, bottom: 42, left: 24, right: 244, width: 220, height: 36 });

    render(
      <RusticAffix
        offsetTop={12}
        onChange={handleChange}
        zIndex={40}
        className="nav-shell"
        style={{ backgroundColor: 'rgb(1, 2, 3)' }}
      >
        <span>Navigation</span>
      </RusticAffix>
    );

    const affix = (await screen.findByText('Navigation')).parentElement as HTMLDivElement;

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(affix.style.position).toBe('fixed');
    });

    expect(affix.className).toContain('rottay-affix--affixed');
    expect(affix.className).toContain('nav-shell');
    expect(affix.style.top).toBe('12px');
    expect(affix.style.getPropertyValue('--ds-affix-offset-top')).toBe('12px');
    expect(affix.style.backgroundColor).toBe('rgb(1, 2, 3)');

    placeholderRect = createRect({ top: 48, bottom: 84, left: 24, right: 244, width: 220, height: 36 });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(affix.style.position).toBe('');
    });

    expect(affix.className).not.toContain('rottay-affix--affixed');
  });
});
