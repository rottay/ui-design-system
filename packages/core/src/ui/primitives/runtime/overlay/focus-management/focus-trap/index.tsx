/**
 * @fileoverview FocusTrap - traps keyboard focus within a container for WCAG 2.1 compliance.
 * Used by Modal/Drawer/AlertDialog to prevent Tab from escaping the overlay.
 * Exports both a `<FocusTrap>` component and a `useFocusTrap` hook.
 *
 * @example
 * ```tsx
 * <FocusTrap active={isOpen} autoFocus restoreFocus>
 *   <dialog>...focusable content...</dialog>
 * </FocusTrap>
 * ```
 */

'use client';

import React, {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  ReactNode,
} from 'react';

export interface FocusTrapProps {
  /** Content to trap focus within */
  children: ReactNode;
  /** Whether the focus trap is active */
  active?: boolean;
  /** Whether to auto-focus the first focusable element on mount */
  autoFocus?: boolean;
  /** Whether to restore focus to the previously focused element on unmount */
  restoreFocus?: boolean;
  /** Initial element to focus (selector or element) */
  initialFocus?: string | HTMLElement | null;
  /** Element to focus when trap is deactivated (selector or element) */
  finalFocus?: string | HTMLElement | null;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

// Comprehensive list of focusable element selectors per WCAG guidelines.
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Returns visible, enabled focusable elements inside `container`. */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
  return Array.from(elements).filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      !el.getAttribute('aria-hidden') &&
      el.offsetParent !== null // Element is visible
  );
}

/** Resolves a focus target from a CSS selector string or direct element reference. */
function resolveFocusTarget(
  target: string | HTMLElement | null | undefined,
  container?: HTMLElement
): HTMLElement | null {
  if (!target) return null;
  if (typeof target === 'string') {
    const scope = container || document;
    return scope.querySelector<HTMLElement>(target);
  }
  return target;
}

/**
 * FocusTrap component -- wraps children in a div that intercepts Tab/Shift+Tab
 * to cycle focus through focusable descendants. Auto-focuses the first element
 * on mount and restores the previously focused element on unmount.
 */
export const FocusTrap = forwardRef<HTMLDivElement, FocusTrapProps>(
  (props, ref) => {
    const {
      children,
      active = true,
      autoFocus = true,
      restoreFocus = true,
      initialFocus,
      finalFocus,
      className = '',
      style = {},
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);

    // Capture which element had focus before the trap activated (for restore on unmount)
    useEffect(() => {
      if (active && restoreFocus) {
        previouslyFocusedRef.current = document.activeElement as HTMLElement;
      }
    }, [active, restoreFocus]);

    // On activation, move focus to initialFocus target or the first focusable child
    useEffect(() => {
      if (!active || !autoFocus) return;

      const container = containerRef.current;
      if (!container) return;

      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        const initialTarget = resolveFocusTarget(initialFocus, container);

        if (initialTarget) {
          initialTarget.focus();
        } else {
          // Focus first focusable element
          const focusable = getFocusableElements(container);
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            // If no focusable elements, focus the container itself
            container.setAttribute('tabindex', '-1');
            container.focus();
          }
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }, [active, autoFocus, initialFocus]);

    // On unmount/deactivation, return focus to finalFocus or the previously focused element
    useEffect(() => {
      return () => {
        if (!restoreFocus) return;

        const finalTarget = resolveFocusTarget(finalFocus);
        const targetToFocus = finalTarget || previouslyFocusedRef.current;

        if (targetToFocus && typeof targetToFocus.focus === 'function') {
          // Small delay to ensure cleanup happens after DOM updates
          setTimeout(() => {
            targetToFocus.focus();
          }, 0);
        }
      };
    }, [finalFocus, restoreFocus]);

    // Tab/Shift+Tab handler -- wraps focus at boundaries so it never leaves the trap
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!active) return;
        if (e.key !== 'Tab') return;

        const container = containerRef.current;
        if (!container) return;

        const focusable = getFocusableElements(container);
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        // Shift + Tab on first element -> focus last
        if (e.shiftKey && activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
          return;
        }

        // Tab on last element -> focus first
        if (!e.shiftKey && activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
          return;
        }

        // If focus is outside container, bring it back
        if (!container.contains(activeElement)) {
          e.preventDefault();
          if (e.shiftKey) {
            lastElement.focus();
          } else {
            firstElement.focus();
          }
        }
      },
      [active]
    );

    const containerStyle: React.CSSProperties = {
      ...style,
    };

    return (
      <div
        ref={(node) => {
          // Handle both refs
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={`rottay-focus-trap ${className}`}
        style={containerStyle}
        onKeyDown={active ? handleKeyDown : undefined}
        data-focus-trap-active={active}
      >
        {children}
      </div>
    );
  }
);

FocusTrap.displayName = 'FocusTrap';

export default FocusTrap;

/** Imperative hook alternative -- call `trapFocus(el)` and `releaseFocus()` manually. */
export function useFocusTrap(active: boolean = true) {
  const containerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [active]);

  const trapFocus = useCallback((container: HTMLElement) => {
    containerRef.current = container;
    const focusable = getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }, []);

  const releaseFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
    containerRef.current = null;
  }, []);

  return { containerRef, trapFocus, releaseFocus };
}
