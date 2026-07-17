import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  ShortcutProvider,
  useGlobalShortcut,
  useGlobalShortcuts,
  useRegisteredShortcuts,
  useHasShortcutProvider,
  useShortcutScope,
  ShortcutScope,
  formatShortcutKey,
} from '../index';

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

// ---------------------------------------------------------------------------
// Scoped shortcuts (WO-CRA-03)
// ---------------------------------------------------------------------------

/**
 * Two-scope harness: registers a "j" shortcut scoped to "scope-a", and
 * mounts both scope-a and scope-b (in that order, so scope-b is the
 * most-recently-mounted / "topmost" scope). Used to prove a scoped
 * shortcut fires only while ITS OWN scope is active.
 */
function TwoScopeHarness({ onFire }: { onFire: () => void }) {
  const scopeARef = useShortcutScope<HTMLDivElement>('scope-a');
  const scopeBRef = useShortcutScope<HTMLDivElement>('scope-b');
  useGlobalShortcut({ key: 'j', handler: onFire, description: 'Next', scope: 'scope-a' });

  return (
    <>
      <div ref={scopeARef} data-testid="scope-a">
        <button data-testid="btn-a">A</button>
      </div>
      <div ref={scopeBRef} data-testid="scope-b">
        <button data-testid="btn-b">B</button>
      </div>
    </>
  );
}

describe('Scoped shortcuts', () => {
  it('does NOT fire while a different scope is focused (and topmost)', () => {
    const onFire = vi.fn();
    const { getByTestId } = render(<TwoScopeHarness onFire={onFire} />, { wrapper: createWrapper() });

    // scope-b is both focused AND the most-recently-mounted scope here --
    // either rule alone would exclude scope-a's shortcut from firing.
    act(() => {
      getByTestId('btn-b').focus();
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });

    expect(onFire).not.toHaveBeenCalled();
  });

  it('DOES fire while its own scope is focused, even when a different scope is topmost', () => {
    const onFire = vi.fn();
    const { getByTestId } = render(<TwoScopeHarness onFire={onFire} />, { wrapper: createWrapper() });

    // scope-a is focused but NOT topmost (scope-b mounted after it) --
    // proves focus-within wins over mount order.
    act(() => {
      getByTestId('btn-a').focus();
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it('fires for the only mounted scope when focus is outside every scope', () => {
    const onFire = vi.fn();

    function SoloScope() {
      const ref = useShortcutScope<HTMLDivElement>('solo');
      useGlobalShortcut({ key: 'j', handler: onFire, description: 'Next', scope: 'solo' });
      return <div ref={ref} />;
    }

    render(<SoloScope />, { wrapper: createWrapper() });

    // Nothing inside any scope is focused -- the sole mounted scope is
    // "topmost" by default and should receive the shortcut.
    act(() => {
      (document.activeElement as HTMLElement | null)?.blur?.();
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it('does not fire before its scope mounts, and stops firing after it unmounts', () => {
    const onFire = vi.fn();

    // ToggleableScope itself never unmounts -- only the ref target toggles
    // between null and a real node. useShortcutScope must notice via its
    // callback ref regardless, since neither of its effect deps (ctx,
    // scopeId) change when only `mounted` flips.
    function ToggleableScope({ mounted }: { mounted: boolean }) {
      const ref = useShortcutScope<HTMLDivElement>('toggle');
      useGlobalShortcut({ key: 'j', handler: onFire, description: 'Next', scope: 'toggle' });
      return mounted ? <div ref={ref} /> : null;
    }

    const { rerender } = render(<ToggleableScope mounted={false} />, { wrapper: createWrapper() });

    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });
    expect(onFire).not.toHaveBeenCalled();

    rerender(<ToggleableScope mounted />);
    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });
    expect(onFire).toHaveBeenCalledTimes(1);

    rerender(<ToggleableScope mounted={false} />);
    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });
    expect(onFire).toHaveBeenCalledTimes(1); // unchanged -- scope is gone
  });

  it('global (scope-less) shortcuts keep firing regardless of mounted/focused scopes', () => {
    const onFire = vi.fn();

    function WithScope() {
      const ref = useShortcutScope<HTMLDivElement>('some-scope');
      useGlobalShortcut({ key: 'g', handler: onFire, description: 'Global action' }); // no scope
      return (
        <div ref={ref}>
          <button data-testid="inside">x</button>
        </div>
      );
    }

    const { getByTestId } = render(<WithScope />, { wrapper: createWrapper() });

    act(() => {
      getByTestId('inside').focus();
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'g' });
    });

    expect(onFire).toHaveBeenCalledTimes(1);
  });

  it('a scoped shortcut wins over a same-key global shortcut while its scope is active', () => {
    const globalHandler = vi.fn();
    const scopedHandler = vi.fn();

    function Harness() {
      const ref = useShortcutScope<HTMLDivElement>('panel');
      useGlobalShortcut({ key: 'j', handler: globalHandler, description: 'Global next' });
      useGlobalShortcut({ key: 'j', handler: scopedHandler, description: 'Panel next', scope: 'panel' });
      return (
        <div ref={ref}>
          <button data-testid="inside">x</button>
        </div>
      );
    }

    const { getByTestId } = render(<Harness />, { wrapper: createWrapper() });

    act(() => {
      getByTestId('inside').focus();
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });

    expect(scopedHandler).toHaveBeenCalledTimes(1);
    expect(globalHandler).not.toHaveBeenCalled();
  });

  it('does not warn on conflicting keys registered under two different scopes', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    function TwoDistinctScopes() {
      const refA = useShortcutScope<HTMLDivElement>('list-a');
      const refB = useShortcutScope<HTMLDivElement>('list-b');
      useGlobalShortcut({ key: 'j', handler: () => {}, description: 'Next in A', scope: 'list-a' });
      useGlobalShortcut({ key: 'j', handler: () => {}, description: 'Next in B', scope: 'list-b' });
      return (
        <>
          <div ref={refA} />
          <div ref={refB} />
        </>
      );
    }

    render(<TwoDistinctScopes />, { wrapper: createWrapper() });

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('ShortcutScope (component form) scopes a shortcut the same way as the hook', () => {
    const onFire = vi.fn();

    // Two ShortcutScope regions (not one) so this test actually exercises
    // focus-gating, mirroring TwoScopeHarness above -- with only one scope
    // mounted, that scope is topmost by default and the "not focused" case
    // would trivially fire too (see the "solo scope" test), which would
    // prove nothing about gating specifically.
    function Harness() {
      useGlobalShortcut({ key: 'j', handler: onFire, description: 'Next', scope: 'wrapped-a' });
      return (
        <>
          <ShortcutScope id="wrapped-a">
            <button data-testid="inside-a">a</button>
          </ShortcutScope>
          <ShortcutScope id="wrapped-b">
            <button data-testid="inside-b">b</button>
          </ShortcutScope>
        </>
      );
    }

    const { getByTestId } = render(<Harness />, { wrapper: createWrapper() });

    act(() => {
      getByTestId('inside-b').focus();
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });
    expect(onFire).not.toHaveBeenCalled();

    act(() => {
      getByTestId('inside-a').focus();
    });
    act(() => {
      fireEvent.keyDown(document, { key: 'j' });
    });
    expect(onFire).toHaveBeenCalledTimes(1);
  });
});

describe('useRegisteredShortcuts without a provider', () => {
  it('returns [] instead of throwing when no ShortcutProvider is mounted', () => {
    let result: ReturnType<typeof useRegisteredShortcuts> | undefined;

    function Reader() {
      result = useRegisteredShortcuts();
      return null;
    }

    expect(() => render(<Reader />)).not.toThrow();
    expect(result).toEqual([]);
  });
});

describe('useHasShortcutProvider', () => {
  it('is false without a ShortcutProvider ancestor', () => {
    let result: boolean | undefined;
    function Reader() {
      result = useHasShortcutProvider();
      return null;
    }

    expect(() => render(<Reader />)).not.toThrow();
    expect(result).toBe(false);
  });

  it('is true within a ShortcutProvider', () => {
    let result: boolean | undefined;
    function Reader() {
      result = useHasShortcutProvider();
      return null;
    }

    render(<Reader />, { wrapper: createWrapper() });
    expect(result).toBe(true);
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
