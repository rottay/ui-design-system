import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  ShortcutProvider,
  useGlobalShortcut,
  useGlobalShortcuts,
  useRegisteredShortcuts,
  formatShortcutKey,
} from './index';

// ---------------------------------------------------------------------------
// formatShortcutKey
// ---------------------------------------------------------------------------

describe('formatShortcutKey', () => {
  it('formats single keys', () => {
    expect(formatShortcutKey('escape')).toEqual(['Esc']);
    expect(formatShortcutKey('enter')).toEqual([expect.any(String)]); // platform-dependent
  });

  it('formats letter keys to uppercase', () => {
    expect(formatShortcutKey('c')).toEqual(['C']);
    expect(formatShortcutKey('k')).toEqual(['K']);
  });

  it('formats multi-key sequences', () => {
    const result = formatShortcutKey('g+i');
    expect(result).toEqual(['G', 'I']);
  });

  it('formats special characters', () => {
    expect(formatShortcutKey('?')).toEqual(['?']);
  });
});

// ---------------------------------------------------------------------------
// ShortcutProvider + hooks
// ---------------------------------------------------------------------------

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  return function Wrapper({ children }) {
    return <ShortcutProvider>{children}</ShortcutProvider>;
  };
}

describe('useGlobalShortcut', () => {
  it('throws without ShortcutProvider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() =>
        useGlobalShortcut({
          key: 'a',
          handler: () => {},
          description: 'test',
        })
      );
    }).toThrow(/ShortcutProvider/);
    spy.mockRestore();
  });

  it('registers a shortcut without throwing', () => {
    expect(() => {
      renderHook(
        () =>
          useGlobalShortcut({
            key: 'ctrl+k',
            handler: () => {},
            description: 'Open palette',
            category: 'Global',
          }),
        { wrapper: createWrapper() }
      );
    }).not.toThrow();
  });

  it('fires handler on matching keydown', () => {
    const handler = vi.fn();

    renderHook(
      () =>
        useGlobalShortcut({
          key: 'ctrl+k',
          handler,
          description: 'Open palette',
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire handler for non-matching key', () => {
    const handler = vi.fn();

    renderHook(
      () =>
        useGlobalShortcut({
          key: 'ctrl+k',
          handler,
          description: 'Open palette',
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      fireEvent.keyDown(document, { key: 'j', ctrlKey: true });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not fire when typing in an input', () => {
    const handler = vi.fn();

    const { container } = render(
      <ShortcutProvider>
        <TestShortcutComponent handler={handler} shortcutKey="c" description="Create" />
        <input data-testid="input" type="text" />
      </ShortcutProvider>
    );

    const input = container.querySelector('input')!;
    act(() => {
      fireEvent.keyDown(input, { key: 'c' });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('respects the when condition', () => {
    const handler = vi.fn();
    let enabled = false;

    renderHook(
      () =>
        useGlobalShortcut({
          key: 'x',
          handler,
          description: 'Conditional',
          when: () => enabled,
        }),
      { wrapper: createWrapper() }
    );

    // Should not fire when condition is false
    act(() => {
      fireEvent.keyDown(document, { key: 'x' });
    });
    expect(handler).not.toHaveBeenCalled();

    // Should fire when condition is true
    enabled = true;
    act(() => {
      fireEvent.keyDown(document, { key: 'x' });
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('unregisters on unmount', () => {
    const handler = vi.fn();

    const { unmount } = renderHook(
      () =>
        useGlobalShortcut({
          key: 'u',
          handler,
          description: 'Test unmount',
        }),
      { wrapper: createWrapper() }
    );

    unmount();

    act(() => {
      fireEvent.keyDown(document, { key: 'u' });
    });

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('useGlobalShortcuts', () => {
  it('registers multiple shortcuts', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    renderHook(
      () =>
        useGlobalShortcuts([
          { key: 'a', handler: handler1, description: 'Action A' },
          { key: 'b', handler: handler2, description: 'Action B' },
        ]),
      { wrapper: createWrapper() }
    );

    act(() => {
      fireEvent.keyDown(document, { key: 'a' });
    });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();

    act(() => {
      fireEvent.keyDown(document, { key: 'b' });
    });
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});

describe('useRegisteredShortcuts', () => {
  it('returns registered shortcuts on subsequent reads', () => {
    let readShortcuts: () => ReturnType<typeof useRegisteredShortcuts> = () => [];

    function ShortcutRegistrar() {
      useGlobalShortcut({ key: 'a', handler: () => {}, description: 'Shortcut A', category: 'Cat1' });
      useGlobalShortcut({ key: 'b', handler: () => {}, description: 'Shortcut B', category: 'Cat2' });
      return null;
    }

    function ShortcutReader() {
      const shortcuts = useRegisteredShortcuts();
      readShortcuts = () => shortcuts;
      return null;
    }

    // Render the registrar first so its effects run, then render
    // a reader component. Since useRegisteredShortcuts reads from
    // a ref populated in useEffect, we verify by reading after mount.
    const { rerender } = render(
      <ShortcutProvider>
        <ShortcutRegistrar />
        <ShortcutReader />
      </ShortcutProvider>
    );

    // Force a re-render so ShortcutReader picks up the registered shortcuts
    rerender(
      <ShortcutProvider>
        <ShortcutRegistrar />
        <ShortcutReader />
      </ShortcutProvider>
    );

    const result = readShortcuts();
    expect(result.length).toBe(2);
    expect(result.map((s) => s.key).sort()).toEqual(['a', 'b']);
  });
});

describe('Key sequences', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires handler for key sequence g+i', () => {
    const handler = vi.fn();

    renderHook(
      () =>
        useGlobalShortcut({
          key: 'g+i',
          handler,
          description: 'Go to inbox',
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      fireEvent.keyDown(document, { key: 'g' });
    });

    act(() => {
      fireEvent.keyDown(document, { key: 'i' });
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not fire sequence if timeout elapses', () => {
    const handler = vi.fn();

    renderHook(
      () =>
        useGlobalShortcut({
          key: 'g+i',
          handler,
          description: 'Go to inbox',
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      fireEvent.keyDown(document, { key: 'g' });
    });

    // Advance past the 1s timeout
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    act(() => {
      fireEvent.keyDown(document, { key: 'i' });
    });

    expect(handler).not.toHaveBeenCalled();
  });
});

// Helper component for tests that need a rendered DOM
function TestShortcutComponent({
  handler,
  shortcutKey,
  description,
}: {
  handler: () => void;
  shortcutKey: string;
  description: string;
}) {
  useGlobalShortcut({ key: shortcutKey, handler, description });
  return null;
}
