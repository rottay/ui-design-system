import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { motion } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useReducedMotion } from '../../../motion/hooks/use-reduced-motion';
import { MotionProvider as PublicMotionProvider } from '../../../index';
import { MotionProvider } from '../MotionProvider';

type ChangeListener = (event: MediaQueryListEvent) => void;

function createReducedMotionController(initial: boolean, legacy = false) {
  let matches = initial;
  const listeners = new Set<ChangeListener>();
  const pointerListeners = new Set<ChangeListener>();

  const addEventListener = vi.fn((_type: string, listener: ChangeListener) => {
    listeners.add(listener);
  });
  const removeEventListener = vi.fn((_type: string, listener: ChangeListener) => {
    listeners.delete(listener);
  });
  const addListener = vi.fn((listener: ChangeListener) => listeners.add(listener));
  const removeListener = vi.fn((listener: ChangeListener) => listeners.delete(listener));

  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: legacy ? undefined : addEventListener,
    removeEventListener: legacy ? undefined : removeEventListener,
    addListener,
    removeListener,
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  const pointerMediaQuery = {
    matches: false,
    media: '(pointer: coarse)',
    onchange: null,
    addEventListener: vi.fn((_type: string, listener: ChangeListener) => {
      pointerListeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: ChangeListener) => {
      pointerListeners.delete(listener);
    }),
    addListener: vi.fn((listener: ChangeListener) => pointerListeners.add(listener)),
    removeListener: vi.fn((listener: ChangeListener) => pointerListeners.delete(listener)),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  const matchMedia = vi.fn((query: string) =>
    query === '(pointer: coarse)' ? pointerMediaQuery : mediaQuery
  );

  return {
    addEventListener,
    addListener,
    listeners,
    pointerListeners,
    matchMedia,
    removeEventListener,
    removeListener,
    emit(next: boolean) {
      matches = next;
      const event = { matches: next, media: mediaQuery.media } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function PreferenceProbe({ id = 'preference' }: { id?: string }): React.ReactElement {
  return <output data-testid={id}>{String(useReducedMotion())}</output>;
}

let originalMatchMedia: typeof window.matchMedia;

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-ds-motion');
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('MotionProvider', () => {
  it('is exported from the package root', () => {
    expect(PublicMotionProvider).toBe(MotionProvider);
  });

  it('uses a static reduced server snapshot and hydrates without divergence', async () => {
    const controller = createReducedMotionController(false);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;
    const element = (
      <MotionProvider>
        <PreferenceProbe />
      </MotionProvider>
    );

    const html = renderToString(element);
    expect(html).toContain('>true<');

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(container.textContent).toBe('false');
    expect(
      consoleError.mock.calls.some((call) => String(call[0]).toLowerCase().includes('hydration')),
    ).toBe(false);

    await act(async () => root?.unmount());
    container.remove();
  });

  it('fans all React consumers out through one listener per environment authority', () => {
    const controller = createReducedMotionController(false);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;

    const { unmount } = render(
      <MotionProvider>
        <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} />
        {Array.from({ length: 20 }, (_, index) => (
          <PreferenceProbe id={`preference-${index}`} key={index} />
        ))}
      </MotionProvider>,
    );

    expect(controller.listeners.size).toBe(1);
    expect(controller.pointerListeners.size).toBe(1);
    expect(controller.addEventListener).toHaveBeenCalledTimes(1);
    expect(controller.matchMedia).toHaveBeenCalledTimes(2);

    act(() => controller.emit(true));
    expect(screen.getByTestId('preference-0')).toHaveTextContent('true');
    expect(screen.getByTestId('preference-19')).toHaveTextContent('true');

    act(() => controller.emit(false));
    expect(screen.getByTestId('preference-0')).toHaveTextContent('false');

    unmount();
    expect(controller.listeners.size).toBe(0);
    expect(controller.pointerListeners.size).toBe(0);
    expect(controller.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('allows only an additive reduced-motion override', () => {
    const controller = createReducedMotionController(false);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;

    const { rerender } = render(
      <MotionProvider reducedMotion>
        <PreferenceProbe />
      </MotionProvider>,
    );
    expect(screen.getByTestId('preference')).toHaveTextContent('true');
    expect(document.documentElement).toHaveAttribute('data-ds-motion', 'reduced');

    rerender(
      <MotionProvider reducedMotion={false}>
        <PreferenceProbe />
      </MotionProvider>,
    );
    expect(screen.getByTestId('preference')).toHaveTextContent('false');
    expect(document.documentElement).not.toHaveAttribute('data-ds-motion');

    act(() => controller.emit(true));
    expect(screen.getByTestId('preference')).toHaveTextContent('true');
  });

  it('inherits an outer forced policy and ref-counts nested CSS registrations', () => {
    const controller = createReducedMotionController(false);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;

    function Providers({ innerForced = true }: { innerForced?: boolean }) {
      return (
        <MotionProvider reducedMotion>
          <PreferenceProbe id="outer-preference" />
          {innerForced ? (
            <MotionProvider reducedMotion>
              <PreferenceProbe id="inner-preference" />
            </MotionProvider>
          ) : (
            <MotionProvider reducedMotion={false}>
              <PreferenceProbe id="inner-preference" />
            </MotionProvider>
          )}
        </MotionProvider>
      );
    }

    const { rerender, unmount } = render(<Providers />);
    expect(screen.getByTestId('outer-preference')).toHaveTextContent('true');
    expect(screen.getByTestId('inner-preference')).toHaveTextContent('true');
    expect(document.documentElement).toHaveAttribute('data-ds-motion', 'reduced');

    // Removing one forced registration must keep the outer provider's CSS law.
    rerender(<Providers innerForced={false} />);
    expect(screen.getByTestId('inner-preference')).toHaveTextContent('true');
    expect(document.documentElement).toHaveAttribute('data-ds-motion', 'reduced');

    unmount();
    expect(document.documentElement).not.toHaveAttribute('data-ds-motion');
  });

  it('restores a document-shell motion attribute after the last forced provider unmounts', () => {
    const controller = createReducedMotionController(false);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;
    document.documentElement.setAttribute('data-ds-motion', 'document-policy');

    const { unmount } = render(
      <MotionProvider reducedMotion>
        <PreferenceProbe />
      </MotionProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-ds-motion', 'reduced');

    unmount();
    expect(document.documentElement).toHaveAttribute(
      'data-ds-motion',
      'document-policy',
    );
  });

  it('supports the legacy Safari MediaQueryList listener API', () => {
    const controller = createReducedMotionController(false, true);
    window.matchMedia = controller.matchMedia as typeof window.matchMedia;

    const { unmount } = render(<PreferenceProbe />);
    expect(controller.listeners.size).toBe(1);
    expect(controller.addListener).toHaveBeenCalledTimes(1);

    act(() => controller.emit(true));
    expect(screen.getByTestId('preference')).toHaveTextContent('true');

    unmount();
    expect(controller.removeListener).toHaveBeenCalledTimes(1);
  });
});
