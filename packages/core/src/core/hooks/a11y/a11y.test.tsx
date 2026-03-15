import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardNavigation, useAriaAnnounce } from './index';
import type { UseKeyboardNavigationOptions } from './index';

// ---------------------------------------------------------------------------
// useKeyboardNavigation
// ---------------------------------------------------------------------------

function createKeyEvent(key: string, extras: Partial<React.KeyboardEvent> = {}): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...extras,
  } as unknown as React.KeyboardEvent;
}

describe('useKeyboardNavigation', () => {
  describe('arrow keys - vertical orientation', () => {
    it('moves focus down on ArrowDown', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5 })
      );

      // Initial state: no focus
      expect(result.current.focusedIndex).toBe(-1);

      // ArrowDown from -1 should go to 0
      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(0);

      // ArrowDown again
      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(1);
    });

    it('moves focus up on ArrowUp', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5 })
      );

      // First go to index 2
      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });
      expect(result.current.focusedIndex).toBe(1);
    });

    it('does not respond to ArrowLeft/ArrowRight in vertical mode', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5, orientation: 'vertical' })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowLeft'));
      });
      expect(result.current.focusedIndex).toBe(2);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowRight'));
      });
      expect(result.current.focusedIndex).toBe(2);
    });
  });

  describe('arrow keys - horizontal orientation', () => {
    it('moves focus on ArrowLeft and ArrowRight', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5, orientation: 'horizontal' })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowRight'));
      });
      expect(result.current.focusedIndex).toBe(3);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowLeft'));
      });
      expect(result.current.focusedIndex).toBe(2);
    });

    it('does not respond to ArrowUp/ArrowDown in horizontal mode', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5, orientation: 'horizontal' })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });
      expect(result.current.focusedIndex).toBe(2);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(2);
    });
  });

  describe('Home and End keys', () => {
    it('Home moves focus to first item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5 })
      );

      act(() => {
        result.current.setFocusedIndex(3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('Home'));
      });
      expect(result.current.focusedIndex).toBe(0);
    });

    it('End moves focus to last item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5 })
      );

      act(() => {
        result.current.handleKeyDown(createKeyEvent('End'));
      });
      expect(result.current.focusedIndex).toBe(4);
    });
  });

  describe('loop behavior', () => {
    it('wraps from last to first when loop is true', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 3, loop: true })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(0);
    });

    it('wraps from first to last when loop is true', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 3, loop: true })
      );

      act(() => {
        result.current.setFocusedIndex(0);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });
      expect(result.current.focusedIndex).toBe(2);
    });

    it('stays at boundary when loop is false', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 3, loop: false })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(2);
    });

    it('stays at first item on ArrowUp when loop is false', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 3, loop: false })
      );

      act(() => {
        result.current.setFocusedIndex(0);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });
      expect(result.current.focusedIndex).toBe(0);
    });
  });

  describe('selection', () => {
    it('calls onSelect with focused index on Enter', () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5, onSelect })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('Enter'));
      });
      expect(onSelect).toHaveBeenCalledWith(2);
    });

    it('calls onSelect with focused index on Space', () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5, onSelect })
      );

      act(() => {
        result.current.setFocusedIndex(1);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent(' '));
      });
      expect(onSelect).toHaveBeenCalledWith(1);
    });

    it('does not call onSelect when no item is focused', () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5, onSelect })
      );

      act(() => {
        result.current.handleKeyDown(createKeyEvent('Enter'));
      });
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Escape key', () => {
    it('calls onEscape and resets focus', () => {
      const onEscape = vi.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5, onEscape })
      );

      act(() => {
        result.current.setFocusedIndex(3);
      });

      act(() => {
        result.current.handleKeyDown(createKeyEvent('Escape'));
      });

      expect(onEscape).toHaveBeenCalledTimes(1);
      expect(result.current.focusedIndex).toBe(-1);
    });
  });

  describe('reset', () => {
    it('resets focused index to -1', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5 })
      );

      act(() => {
        result.current.setFocusedIndex(4);
      });
      expect(result.current.focusedIndex).toBe(4);

      act(() => {
        result.current.reset();
      });
      expect(result.current.focusedIndex).toBe(-1);
    });
  });

  describe('both orientation', () => {
    it('responds to all arrow keys when orientation is both', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 5, orientation: 'both' })
      );

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(0);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowRight'));
      });
      expect(result.current.focusedIndex).toBe(1);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });
      expect(result.current.focusedIndex).toBe(0);

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowLeft'));
      });
      expect(result.current.focusedIndex).toBe(0); // At boundary without loop
    });
  });

  describe('empty items', () => {
    it('does nothing when items is 0', () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() =>
        useKeyboardNavigation({ items: 0, onSelect })
      );

      act(() => {
        result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(-1);
    });
  });
});

// ---------------------------------------------------------------------------
// useAriaAnnounce
// ---------------------------------------------------------------------------

describe('useAriaAnnounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock requestAnimationFrame for synchronous behavior in tests
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the announcer region with aria-live attributes', () => {
    function TestComponent() {
      const { AnnouncerRegion } = useAriaAnnounce();
      return <AnnouncerRegion />;
    }

    render(<TestComponent />);

    const announcer = screen.getByTestId('ds-aria-announcer');
    expect(announcer).toBeInTheDocument();

    // Should have two regions: polite and assertive
    const politeRegion = announcer.querySelector('[aria-live="polite"]');
    const assertiveRegion = announcer.querySelector('[aria-live="assertive"]');
    expect(politeRegion).not.toBeNull();
    expect(assertiveRegion).not.toBeNull();
  });

  it('announces a polite message', () => {
    let announceFn: (msg: string, priority?: 'polite' | 'assertive') => void = () => {};

    function TestComponent() {
      const { announce, AnnouncerRegion } = useAriaAnnounce();
      announceFn = announce;
      return <AnnouncerRegion />;
    }

    render(<TestComponent />);

    act(() => {
      announceFn('3 items found');
    });

    const announcer = screen.getByTestId('ds-aria-announcer');
    const politeRegion = announcer.querySelector('[aria-live="polite"]');
    expect(politeRegion?.textContent).toBe('3 items found');
  });

  it('announces an assertive message', () => {
    let announceFn: (msg: string, priority?: 'polite' | 'assertive') => void = () => {};

    function TestComponent() {
      const { announce, AnnouncerRegion } = useAriaAnnounce();
      announceFn = announce;
      return <AnnouncerRegion />;
    }

    render(<TestComponent />);

    act(() => {
      announceFn('Error occurred', 'assertive');
    });

    const announcer = screen.getByTestId('ds-aria-announcer');
    const assertiveRegion = announcer.querySelector('[aria-live="assertive"]');
    expect(assertiveRegion?.textContent).toBe('Error occurred');
  });

  it('clears polite message after timeout', () => {
    let announceFn: (msg: string, priority?: 'polite' | 'assertive') => void = () => {};

    function TestComponent() {
      const { announce, AnnouncerRegion } = useAriaAnnounce();
      announceFn = announce;
      return <AnnouncerRegion />;
    }

    const { container } = render(<TestComponent />);

    act(() => {
      announceFn('Temporary message');
    });

    const politeRegion = container.querySelector('[aria-live="polite"]');
    expect(politeRegion?.textContent).toBe('Temporary message');

    // Advance past the 7s timeout and flush pending React updates
    act(() => {
      vi.advanceTimersByTime(7500);
    });

    // Re-query after React state update
    const updatedPoliteRegion = container.querySelector('[aria-live="polite"]');
    expect(updatedPoliteRegion?.textContent).toBe('');
  });

  it('clears assertive message after timeout', () => {
    let announceFn: (msg: string, priority?: 'polite' | 'assertive') => void = () => {};

    function TestComponent() {
      const { announce, AnnouncerRegion } = useAriaAnnounce();
      announceFn = announce;
      return <AnnouncerRegion />;
    }

    const { container } = render(<TestComponent />);

    act(() => {
      announceFn('Critical alert', 'assertive');
    });

    const assertiveRegion = container.querySelector('[aria-live="assertive"]');
    expect(assertiveRegion?.textContent).toBe('Critical alert');

    act(() => {
      vi.advanceTimersByTime(7500);
    });

    const updatedAssertiveRegion = container.querySelector('[aria-live="assertive"]');
    expect(updatedAssertiveRegion?.textContent).toBe('');
  });

  it('replaces previous message with a new one', () => {
    let announceFn: (msg: string, priority?: 'polite' | 'assertive') => void = () => {};

    function TestComponent() {
      const { announce, AnnouncerRegion } = useAriaAnnounce();
      announceFn = announce;
      return <AnnouncerRegion />;
    }

    render(<TestComponent />);

    act(() => {
      announceFn('First message');
    });

    act(() => {
      announceFn('Second message');
    });

    const announcer = screen.getByTestId('ds-aria-announcer');
    const politeRegion = announcer.querySelector('[aria-live="polite"]');
    expect(politeRegion?.textContent).toBe('Second message');
  });

  it('handles polite and assertive messages independently', () => {
    let announceFn: (msg: string, priority?: 'polite' | 'assertive') => void = () => {};

    function TestComponent() {
      const { announce, AnnouncerRegion } = useAriaAnnounce();
      announceFn = announce;
      return <AnnouncerRegion />;
    }

    render(<TestComponent />);

    act(() => {
      announceFn('Status update', 'polite');
    });

    act(() => {
      announceFn('Error alert', 'assertive');
    });

    const announcer = screen.getByTestId('ds-aria-announcer');
    const politeRegion = announcer.querySelector('[aria-live="polite"]');
    const assertiveRegion = announcer.querySelector('[aria-live="assertive"]');

    expect(politeRegion?.textContent).toBe('Status update');
    expect(assertiveRegion?.textContent).toBe('Error alert');
  });

  it('defaults to polite priority when not specified', () => {
    let announceFn: (msg: string, priority?: 'polite' | 'assertive') => void = () => {};

    function TestComponent() {
      const { announce, AnnouncerRegion } = useAriaAnnounce();
      announceFn = announce;
      return <AnnouncerRegion />;
    }

    render(<TestComponent />);

    act(() => {
      announceFn('Default priority message');
    });

    const announcer = screen.getByTestId('ds-aria-announcer');
    const politeRegion = announcer.querySelector('[aria-live="polite"]');
    expect(politeRegion?.textContent).toBe('Default priority message');
  });
});
