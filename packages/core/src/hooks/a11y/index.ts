/**
 * @fileoverview Accessibility Hooks - Rottay Design System
 * @description React hooks for keyboard navigation and screen reader announcements.
 *
 * @remarks
 * The accessibility hooks provide:
 *
 * - **useKeyboardNavigation**: Arrow key navigation for lists, menus, grids
 * - **useAriaAnnounce**: Screen reader announcements via aria-live regions
 *
 * All hooks are:
 * - **SSR-safe**: Work correctly during server-side rendering
 * - **WCAG 2.1 compliant**: Follow WAI-ARIA best practices
 *
 * @example Keyboard navigation
 * ```tsx
 * function Menu({ items }: { items: string[] }) {
 *   const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
 *     items: items.length,
 *     onSelect: (index) => activateItem(items[index]),
 *     onEscape: () => closeMenu(),
 *     loop: true,
 *   });
 *
 *   return (
 *     <ul role="menu" onKeyDown={handleKeyDown}>
 *       {items.map((item, i) => (
 *         <li key={item} role="menuitem" tabIndex={i === focusedIndex ? 0 : -1}>
 *           {item}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example Screen reader announcements
 * ```tsx
 * function SearchResults({ results }: { results: Item[] }) {
 *   const { announce, AnnouncerRegion } = useAriaAnnounce();
 *
 *   useEffect(() => {
 *     announce(`${results.length} results found`);
 *   }, [results.length, announce]);
 *
 *   return (
 *     <>
 *       <AnnouncerRegion />
 *       <ResultsList results={results} />
 *     </>
 *   );
 * }
 * ```
 *
 * @see {@link useKeyboardNavigation} - Keyboard navigation hook
 * @see {@link useAriaAnnounce} - Screen reader announcement hook
 * @module System/Hooks/A11y
 * @category System
 * @package @rottay/design-system
 */

import { useState, useCallback, useRef, type KeyboardEvent, type FC } from 'react';
import { createElement } from 'react';

// ---------------------------------------------------------------------------
// useKeyboardNavigation
// ---------------------------------------------------------------------------

/**
 * Configuration for the keyboard navigation hook.
 */
export interface UseKeyboardNavigationOptions {
  /** Total number of navigable items */
  items: number;
  /** Callback invoked when an item is selected (Enter or Space) */
  onSelect?: (index: number) => void;
  /** Callback invoked when Escape is pressed */
  onEscape?: () => void;
  /** Arrow key orientation: 'vertical' (Up/Down), 'horizontal' (Left/Right), or 'both' */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Whether navigation wraps around at the ends (default: false) */
  loop?: boolean;
}

/**
 * Return value of useKeyboardNavigation.
 */
export interface UseKeyboardNavigationResult {
  /** Currently focused item index (-1 means no item focused) */
  focusedIndex: number;
  /** Manually set the focused index */
  setFocusedIndex: (index: number) => void;
  /** Keyboard event handler to attach to the container element */
  handleKeyDown: (e: KeyboardEvent) => void;
  /** Reset focus to the initial state (-1) */
  reset: () => void;
}

/**
 * Provides keyboard navigation for lists, menus, toolbars, and similar
 * composite widgets following WAI-ARIA Authoring Practices.
 *
 * Handles:
 * - Arrow keys (Up/Down for vertical, Left/Right for horizontal)
 * - Home/End to jump to first/last item
 * - Enter/Space to select
 * - Escape to dismiss
 *
 * @param options - Navigation configuration
 * @returns Navigation state and handlers
 *
 * @example
 * ```tsx
 * const { focusedIndex, handleKeyDown, reset } = useKeyboardNavigation({
 *   items: 5,
 *   onSelect: (i) => selectOption(i),
 *   onEscape: () => closeDropdown(),
 *   orientation: 'vertical',
 *   loop: true,
 * });
 * ```
 */
export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions
): UseKeyboardNavigationResult {
  const { items, onSelect, onEscape, orientation = 'vertical', loop = false } = options;

  // Start at -1 (no focus) so the component can render without any item
  // visually focused until the user begins keyboard interaction.
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const reset = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  // Movement callbacks are memoized individually so the main handleKeyDown
  // callback only re-creates when its direct dependencies change, not on
  // every items/loop change that only affects movement logic.
  const movePrevious = useCallback(() => {
    setFocusedIndex((current) => {
      if (current <= 0) {
        // When at the start, wrap to end if loop is enabled; otherwise clamp.
        return loop ? items - 1 : 0;
      }
      return current - 1;
    });
  }, [items, loop]);

  const moveNext = useCallback(() => {
    setFocusedIndex((current) => {
      if (current >= items - 1) {
        return loop ? 0 : items - 1;
      }
      // If nothing focused yet (-1), start at the first item rather than
      // incrementing -1 to 0 via math, which would also work but is less
      // readable and intentional.
      if (current < 0) return 0;
      return current + 1;
    });
  }, [items, loop]);

  const moveToFirst = useCallback(() => {
    setFocusedIndex(0);
  }, []);

  const moveToLast = useCallback(() => {
    setFocusedIndex(items - 1);
  }, [items]);

  // handleKeyDown is the single event handler consumers attach to their
  // container element. It dispatches to the appropriate movement helper
  // based on the configured orientation, keeping the switch statement
  // focused on key mapping rather than movement math.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (items <= 0) return;

      // Pre-compute orientation flags to avoid repeated string comparisons
      // inside the switch cases.
      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';

      switch (e.key) {
        case 'ArrowUp': {
          if (!isVertical) return;
          e.preventDefault();
          movePrevious();
          break;
        }
        case 'ArrowDown': {
          if (!isVertical) return;
          e.preventDefault();
          moveNext();
          break;
        }
        case 'ArrowLeft': {
          if (!isHorizontal) return;
          e.preventDefault();
          movePrevious();
          break;
        }
        case 'ArrowRight': {
          if (!isHorizontal) return;
          e.preventDefault();
          moveNext();
          break;
        }
        case 'Home': {
          e.preventDefault();
          moveToFirst();
          break;
        }
        case 'End': {
          e.preventDefault();
          moveToLast();
          break;
        }
        // Space and Enter both trigger selection per WAI-ARIA Authoring
        // Practices for composite widgets (menus, listboxes, toolbars).
        case 'Enter':
        case ' ': {
          if (focusedIndex >= 0 && focusedIndex < items) {
            e.preventDefault();
            onSelect?.(focusedIndex);
          }
          break;
        }
        // Escape dismisses the widget AND resets focus to -1 so reopening
        // the widget starts with no item pre-focused.
        case 'Escape': {
          e.preventDefault();
          onEscape?.();
          reset();
          break;
        }
        default:
          break;
      }
    },
    [
      items,
      orientation,
      focusedIndex,
      movePrevious,
      moveNext,
      moveToFirst,
      moveToLast,
      onSelect,
      onEscape,
      reset,
    ]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    reset,
  };
}

// ---------------------------------------------------------------------------
// useAriaAnnounce
// ---------------------------------------------------------------------------

/**
 * Return value of useAriaAnnounce.
 */
export interface UseAriaAnnounceResult {
  /**
   * Announce a message to screen readers.
   * @param message - Text to announce
   * @param priority - 'polite' waits for idle, 'assertive' interrupts (default: 'polite')
   */
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  /**
   * React component that renders the hidden aria-live regions.
   * Mount this once in your component tree (typically near the root or
   * within the announcing component).
   */
  AnnouncerRegion: FC;
}

/**
 * Provides screen reader announcements via an aria-live region following
 * WAI-ARIA live region best practices.
 *
 * The hook manages two hidden regions (polite and assertive) and updates
 * their content to trigger screen reader announcements. Messages are
 * cleared after a short delay to prevent stale content.
 *
 * @returns Announce function and the AnnouncerRegion component
 *
 * @example
 * ```tsx
 * function Notifications() {
 *   const { announce, AnnouncerRegion } = useAriaAnnounce();
 *
 *   const handleSave = async () => {
 *     await save();
 *     announce('Changes saved successfully');
 *   };
 *
 *   const handleError = () => {
 *     announce('An error occurred', 'assertive');
 *   };
 *
 *   return (
 *     <>
 *       <AnnouncerRegion />
 *       <button onClick={handleSave}>Save</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useAriaAnnounce(): UseAriaAnnounceResult {
  // Separate state for polite vs assertive because screen readers treat them
  // differently: polite waits for idle, assertive interrupts immediately.
  // Keeping them independent ensures one priority lane never clobbers the other.
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const politeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const assertiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // announce is dependency-free (stable identity) because it only writes
  // to state and refs. This lets consumers safely include it in their own
  // useEffect/useCallback deps without triggering re-runs.
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (priority === 'assertive') {
        // Clear-then-set pattern: screen readers only announce when the
        // aria-live region content CHANGES. Setting to '' first guarantees
        // a change even when the same message is announced twice in a row.
        setAssertiveMessage('');
        if (assertiveTimerRef.current) clearTimeout(assertiveTimerRef.current);

        // requestAnimationFrame ensures the browser paints the empty state
        // before we set the new message, so the screen reader detects two
        // distinct content updates rather than a no-op.
        requestAnimationFrame(() => {
          setAssertiveMessage(message);
          // Auto-clear after 7s to prevent stale announcements from
          // lingering in the DOM if the user revisits the region.
          assertiveTimerRef.current = setTimeout(() => {
            setAssertiveMessage('');
          }, 7000);
        });
      } else {
        setPoliteMessage('');
        if (politeTimerRef.current) clearTimeout(politeTimerRef.current);

        requestAnimationFrame(() => {
          setPoliteMessage(message);
          politeTimerRef.current = setTimeout(() => {
            setPoliteMessage('');
          }, 7000);
        });
      }
    },
    []
  );

  // AnnouncerRegion is wrapped in useCallback so it keeps a stable component
  // identity across renders where messages haven't changed, preventing
  // unnecessary unmount/remount of the aria-live DOM nodes.
  const AnnouncerRegion: FC = useCallback(() => {
    // sr-only styles: visually hidden but still accessible to screen readers.
    // Using clip + 1px dimensions is the most reliable cross-browser technique.
    const srOnlyStyle = {
      position: 'absolute' as const,
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden' as const,
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap' as const,
      borderWidth: 0,
    };

    // Two separate aria-live regions: role="status" for polite announcements
    // and role="alert" for assertive ones. aria-atomic ensures the entire
    // content is announced each time, not just the delta.
    return createElement(
      'div',
      { 'data-testid': 'ds-aria-announcer' },
      createElement(
        'div',
        {
          role: 'status',
          'aria-live': 'polite',
          'aria-atomic': true,
          style: srOnlyStyle,
        },
        politeMessage
      ),
      createElement(
        'div',
        {
          role: 'alert',
          'aria-live': 'assertive',
          'aria-atomic': true,
          style: srOnlyStyle,
        },
        assertiveMessage
      )
    );
  }, [politeMessage, assertiveMessage]);

  return {
    announce,
    AnnouncerRegion,
  };
}
