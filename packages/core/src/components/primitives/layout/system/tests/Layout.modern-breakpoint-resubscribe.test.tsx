import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Sider } from '../engines/modern';

type Listener = () => void;

function installMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches,
    addEventListener: (_: string, fn: Listener) => {
      listeners.add(fn);
    },
    removeEventListener: (_: string, fn: Listener) => {
      listeners.delete(fn);
    },
  };
  const factory = vi.fn(() => mql);
  (window as unknown as Record<string, unknown>).matchMedia = factory;
  return { mql, listeners, factory };
}

const originalMatchMedia = (window as unknown as Record<string, unknown>).matchMedia;

afterEach(() => {
  (window as unknown as Record<string, unknown>).matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('Layout.Sider modern: breakpoint auto-collapse must not re-fire', () => {
  it('keeps the user expansion when the parent re-renders with a fresh onCollapse', () => {
    installMatchMedia(true);

    function Host() {
      const [mirrored, setMirrored] = React.useState<boolean | null>(null);
      return (
        <>
          <span data-testid="mirror">{String(mirrored)}</span>
          <Sider
            breakpoint="lg"
            collapsible
            onCollapse={(next) => setMirrored(next)}
          >
            nav
          </Sider>
        </>
      );
    }

    render(<Host />);
    const sider = screen.getByText('nav').closest('[data-part="sider"]') as HTMLElement;
    expect(sider.getAttribute('data-collapsed')).toBe('true');

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('mirror').textContent).toBe('false');
    expect(sider.getAttribute('data-collapsed')).toBe('false');
  });

  it('subscribes once for a stable breakpoint across parent re-renders', () => {
    const { factory } = installMatchMedia(false);

    function Host() {
      const [tick, setTick] = React.useState(0);
      return (
        <>
          <button type="button" data-testid="tick" onClick={() => setTick(tick + 1)}>
            {tick}
          </button>
          <Sider breakpoint="lg" onCollapse={() => undefined}>
            nav
          </Sider>
        </>
      );
    }

    render(<Host />);
    expect(factory).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('tick'));
    fireEvent.click(screen.getByTestId('tick'));

    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('reports a crossing with the latest onCollapse after the parent swaps it', () => {
    const { mql, listeners } = installMatchMedia(false);
    const first = vi.fn();
    const second = vi.fn();

    function Host() {
      const [useSecond, setUseSecond] = React.useState(false);
      return (
        <>
          <button type="button" data-testid="swap" onClick={() => setUseSecond(true)}>
            swap
          </button>
          <Sider breakpoint="lg" onCollapse={useSecond ? second : first}>
            nav
          </Sider>
        </>
      );
    }

    render(<Host />);
    fireEvent.click(screen.getByTestId('swap'));

    mql.matches = true;
    act(() => {
      for (const fn of listeners) fn();
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(true);
  });
});
