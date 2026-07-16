'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';

export interface CollectionFilterDropdownProps {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  ariaLabel: string;
  children: ReactNode;
}

type DropdownPlacement = 'top' | 'bottom';

interface DropdownPosition {
  left: number;
  maxHeight: number;
  placement: DropdownPlacement;
  top: number;
}

const VIEWPORT_GUTTER = 12;
const ANCHOR_GAP = 8;
const PREFERRED_PANEL_WIDTH = 360;
const MIN_USEFUL_PANEL_HEIGHT = 240;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const OWNED_PORTAL_SELECTOR = [
  '[data-rottay-portal]',
  '.ant-select-dropdown',
  '.ant-picker-dropdown',
  '.ant-cascader-menus',
  '.ant-dropdown',
].join(',');

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function focusWithoutScrolling(element: HTMLElement): void {
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function firstFocusableControl(container: HTMLElement): HTMLElement | null {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  return candidates.find((candidate) => (
    !candidate.hidden
    && candidate.getAttribute('aria-hidden') !== 'true'
    && !candidate.closest('[hidden], [aria-hidden="true"]')
  )) ?? null;
}

function belongsToNestedControlPortal(target: Node): boolean {
  const element = target instanceof Element ? target : target.parentElement;
  return Boolean(element?.closest(OWNED_PORTAL_SELECTOR));
}

/**
 * Private, in-tree disclosure used by CollectionWorkspace filter controls.
 * It deliberately stays outside the portal/overlay stack: the fixed-positioned
 * sibling escapes the workspace's clipped layout while preserving tenant scope.
 */
export function CollectionFilterDropdown({
  anchorRef,
  open,
  onOpenChange,
  id,
  ariaLabel,
  children,
}: CollectionFilterDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousOpenRef = useRef(false);
  const restoreFocusOnCloseRef = useRef(true);
  const animationFrameRef = useRef<number | null>(null);
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const visualViewport = window.visualViewport;
    const viewportLeft = visualViewport?.offsetLeft ?? 0;
    const viewportTop = visualViewport?.offsetTop ?? 0;
    const viewportWidth = visualViewport?.width
      || document.documentElement.clientWidth
      || window.innerWidth;
    const viewportHeight = visualViewport?.height
      || document.documentElement.clientHeight
      || window.innerHeight;
    const viewportRight = viewportLeft + viewportWidth;
    const viewportBottom = viewportTop + viewportHeight;

    const anchorRect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const availableWidth = Math.max(0, viewportWidth - (VIEWPORT_GUTTER * 2));
    const panelWidth = Math.min(
      panelRect.width || PREFERRED_PANEL_WIDTH,
      availableWidth,
    );
    const left = clamp(
      anchorRect.right - panelWidth,
      viewportLeft + VIEWPORT_GUTTER,
      viewportRight - VIEWPORT_GUTTER - panelWidth,
    );

    const belowSpace = Math.max(
      0,
      viewportBottom - VIEWPORT_GUTTER - anchorRect.bottom - ANCHOR_GAP,
    );
    const aboveSpace = Math.max(
      0,
      anchorRect.top - viewportTop - VIEWPORT_GUTTER - ANCHOR_GAP,
    );
    const desiredHeight = panel.scrollHeight
      || panelRect.height
      || MIN_USEFUL_PANEL_HEIGHT;
    const placement: DropdownPlacement = (
      belowSpace >= Math.min(desiredHeight, MIN_USEFUL_PANEL_HEIGHT)
      || belowSpace >= aboveSpace
    ) ? 'bottom' : 'top';
    const maxHeight = placement === 'bottom' ? belowSpace : aboveSpace;
    const top = placement === 'bottom'
      ? anchorRect.bottom + ANCHOR_GAP
      : anchorRect.top - ANCHOR_GAP - Math.min(desiredHeight, maxHeight);

    setPosition((current) => {
      const next: DropdownPosition = { left, maxHeight, placement, top };
      if (
        current
        && current.left === next.left
        && current.maxHeight === next.maxHeight
        && current.placement === next.placement
        && current.top === next.top
      ) {
        return current;
      }
      return next;
    });
  }, [anchorRef]);

  const schedulePositionUpdate = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      updatePosition();
    });
  }, [updatePosition]);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [children, open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;

    const visualViewport = window.visualViewport;
    window.addEventListener('resize', schedulePositionUpdate);
    window.addEventListener('scroll', schedulePositionUpdate, true);
    visualViewport?.addEventListener('resize', schedulePositionUpdate);
    visualViewport?.addEventListener('scroll', schedulePositionUpdate);

    return () => {
      window.removeEventListener('resize', schedulePositionUpdate);
      window.removeEventListener('scroll', schedulePositionUpdate, true);
      visualViewport?.removeEventListener('resize', schedulePositionUpdate);
      visualViewport?.removeEventListener('scroll', schedulePositionUpdate);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [open, schedulePositionUpdate]);

  useEffect(() => {
    const wasOpen = previousOpenRef.current;
    previousOpenRef.current = open;

    if (open && !wasOpen) {
      restoreFocusOnCloseRef.current = true;
      const panel = panelRef.current;
      if (panel) {
        focusWithoutScrolling(firstFocusableControl(panel) ?? panel);
      }
    } else if (!open && wasOpen) {
      const anchor = anchorRef.current;
      if (restoreFocusOnCloseRef.current && anchor) focusWithoutScrolling(anchor);
      restoreFocusOnCloseRef.current = true;
    }
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      event.stopPropagation();
      restoreFocusOnCloseRef.current = true;
      onOpenChange(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      if (belongsToNestedControlPortal(target)) return;
      // Let the clicked destination keep the browser's natural focus. Escape,
      // Cancel, Apply, and trigger toggles still restore focus to the anchor.
      restoreFocusOnCloseRef.current = false;
      onOpenChange(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [anchorRef, onOpenChange, open]);

  if (!open) return null;

  const style: CSSProperties = {
    left: position?.left,
    maxHeight: position?.maxHeight,
    position: 'fixed',
    top: position?.top,
    visibility: position ? 'visible' : 'hidden',
  };

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label={ariaLabel}
      aria-modal={false}
      className="ds-collection-workspace__filter-dropdown"
      data-open="true"
      data-part="filter-dropdown-surface"
      data-placement={position?.placement ?? 'bottom'}
      data-positioned={position ? 'true' : 'false'}
      style={style}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
