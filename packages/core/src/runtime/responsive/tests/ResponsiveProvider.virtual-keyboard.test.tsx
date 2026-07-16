import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResponsiveProvider, useResponsive } from '../index';

type ViewportEvent = 'resize' | 'scroll';

function createVisualViewportMock() {
  const listeners = new Map<ViewportEvent, Set<EventListener>>([
    ['resize', new Set()],
    ['scroll', new Set()],
  ]);
  const viewport = {
    height: 800,
    offsetTop: 0,
    scale: 1,
    addEventListener: vi.fn((type: ViewportEvent, listener: EventListener) => {
      listeners.get(type)?.add(listener);
    }),
    removeEventListener: vi.fn((type: ViewportEvent, listener: EventListener) => {
      listeners.get(type)?.delete(listener);
    }),
    dispatch(type: ViewportEvent) {
      listeners.get(type)?.forEach((listener) => listener(new Event(type)));
    },
  };

  return viewport;
}

function ResponsiveKeyboardConsumer() {
  const { virtualKeyboardInset, isVirtualKeyboardOpen } = useResponsive();
  return (
    <div>
      <input aria-label="Editable" />
      <button type="button">Not editable</button>
      <span data-testid="keyboard-inset">{virtualKeyboardInset}</span>
      <span data-testid="keyboard-open">{String(isVirtualKeyboardOpen)}</span>
    </div>
  );
}

const originalVisualViewportDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');
const originalInnerHeightDescriptor = Object.getOwnPropertyDescriptor(window, 'innerHeight');

describe('ResponsiveProvider virtual keyboard authority', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === '(hover: none) and (pointer: coarse)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    if (originalVisualViewportDescriptor) {
      Object.defineProperty(window, 'visualViewport', originalVisualViewportDescriptor);
    } else {
      Reflect.deleteProperty(window, 'visualViewport');
    }
    if (originalInnerHeightDescriptor) {
      Object.defineProperty(window, 'innerHeight', originalInnerHeightDescriptor);
    }
    vi.restoreAllMocks();
  });

  it('starts from zero keyboard-safe defaults', () => {
    const viewport = createVisualViewportMock();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });

    render(
      <ResponsiveProvider>
        <ResponsiveKeyboardConsumer />
      </ResponsiveProvider>
    );

    expect(screen.getByTestId('keyboard-inset')).toHaveTextContent('0');
    expect(screen.getByTestId('keyboard-open')).toHaveTextContent('false');
  });

  it('reports viewport occlusion only while an editable element has focus', () => {
    const viewport = createVisualViewportMock();
    viewport.height = 500;
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
    render(
      <ResponsiveProvider>
        <ResponsiveKeyboardConsumer />
      </ResponsiveProvider>
    );

    act(() => screen.getByRole('textbox', { name: 'Editable' }).focus());
    expect(screen.getByTestId('keyboard-inset')).toHaveTextContent('300');
    expect(screen.getByTestId('keyboard-open')).toHaveTextContent('true');

    act(() => screen.getByRole('button', { name: 'Not editable' }).focus());
    expect(screen.getByTestId('keyboard-inset')).toHaveTextContent('0');
    expect(screen.getByTestId('keyboard-open')).toHaveTextContent('false');
  });

  it('reacts to viewport resize and scroll while preserving offsetTop', () => {
    const viewport = createVisualViewportMock();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
    render(
      <ResponsiveProvider>
        <ResponsiveKeyboardConsumer />
      </ResponsiveProvider>
    );
    act(() => screen.getByRole('textbox').focus());

    act(() => {
      viewport.height = 520;
      viewport.dispatch('resize');
    });
    expect(screen.getByTestId('keyboard-inset')).toHaveTextContent('280');

    act(() => {
      viewport.offsetTop = 20;
      viewport.dispatch('scroll');
    });
    expect(screen.getByTestId('keyboard-inset')).toHaveTextContent('260');
  });

  it('suppresses keyboard inference while the visual viewport is zoomed', () => {
    const viewport = createVisualViewportMock();
    viewport.height = 500;
    viewport.scale = 2;
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
    render(
      <ResponsiveProvider>
        <ResponsiveKeyboardConsumer />
      </ResponsiveProvider>
    );

    fireEvent.focusIn(screen.getByRole('textbox'));
    expect(screen.getByTestId('keyboard-inset')).toHaveTextContent('0');
    expect(screen.getByTestId('keyboard-open')).toHaveTextContent('false');
  });

  it('cleans up viewport and focus subscriptions on unmount', () => {
    const viewport = createVisualViewportMock();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
    const documentRemoveSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(
      <ResponsiveProvider>
        <ResponsiveKeyboardConsumer />
      </ResponsiveProvider>
    );

    unmount();
    expect(viewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(viewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(documentRemoveSpy).toHaveBeenCalledWith('focusin', expect.any(Function));
    expect(documentRemoveSpy).toHaveBeenCalledWith('focusout', expect.any(Function));
  });
});
