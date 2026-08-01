'use client';

/**
 * Modern Popover engine.
 *
 * Behavior, semantic relationships and positioning stay code-owned; paint and
 * coordinated material recipes stay token-owned. Native anchor positioning
 * stays in-tree/top-layer; measured positioning uses the shared overlay portal
 * so clipping ancestors cannot cut off the surface.
 *
 * Focus ownership posture (B2.4):
 * - Deliberate initial focus: only activation-driven opens (a click via
 *   pointer or keyboard) move focus into the surface -- the first focusable
 *   descendant, or the surface itself when the content is read-only. Hover
 *   and focus discovery, coarse-pointer taps and controlled/programmatic
 *   opens never steal focus. Without this, portaled interactive content is
 *   unreachable by keyboard because the surface lives at the portal root,
 *   outside the trigger's tab order. The pointer modality persists from
 *   pointerdown, and keyboard/AT-synthesized clicks (`detail: 0`) refresh it
 *   so a stale tap never masks a keyboard activation.
 * - Escape routes through the shared layer stack and returns focus to the
 *   trigger (pinned behavior, unchanged).
 * - Every other close path (light dismiss, controlled close, blur-driven
 *   hide, destroy-on-hide) also returns focus to the trigger when focus is
 *   stranded inside the surface that is about to become inert; a blur toward
 *   a real destination stays user-owned and is never hijacked.
 * - The popover is a non-modal lightweight layer: it joins the shared Escape
 *   route but never locks page scroll.
 */

import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import type {
  PopoverPlacement,
  PopoverProps,
  PopoverRole,
  PopoverTrigger,
} from '../../contracts';
import {
  POPOVER_DEFAULTS,
  POPOVER_TO_OVERLAY_PLACEMENT,
} from '../../contracts';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
  type OverlayPlacement,
} from '../../../../runtime/overlay/positioning';
import { useOverlayLayer } from '../../../../runtime/overlay/layer-stack';
import { Portal } from '../../../../runtime/overlay/portal';
import {
  readDsPortalVariables,
  type DsPortalVariableStyle,
} from '../../../../runtime/overlay/foundation/portal-theme';

type OpenReason = 'hover' | 'focus' | 'click' | 'touch';

type PopoverInstanceStyle = CSSProperties & {
  '--ds-popover-instance-max-width'?: string;
  '--ds-popover-instance-z-index'?: string | number;
  '--ds-popover-arrow-anchor-offset'?: string;
};

type PopoverPortalScope = {
  'data-ds-root'?: string;
  'data-vertical'?: string;
  'data-tenant'?: string;
  'data-theme'?: string;
  'data-engine'?: string;
  'data-density'?: string;
};

const DEFAULT_EXIT_FALLBACK_MS = 240;
const EXIT_FALLBACK_GRACE_MS = 64;

/** Interactive descendants eligible to receive deliberate focus. */
const TRIGGER_FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Menu/listbox surfaces focus their first item before generic controls. */
const SURFACE_FOCUSABLE_SELECTOR = `[role="menuitem"]:not([aria-disabled="true"]), [role="option"]:not([aria-disabled="true"]), ${TRIGGER_FOCUSABLE_SELECTOR}`;

/**
 * Moves focus without scrolling the page. With `fallbackToRoot` the root
 * itself receives focus when no descendant qualifies (read-only content);
 * the surface carries `tabIndex={-1}` precisely so this is possible without
 * entering the tab order.
 */
function focusFirstWithin(
  root: HTMLElement,
  selector: string,
  fallbackToRoot = false
): void {
  const target =
    root.querySelector<HTMLElement>(selector) ?? (fallbackToRoot ? root : null);
  target?.focus({ preventScroll: true });
}

function normalizeTriggers(
  trigger: PopoverTrigger | PopoverTrigger[] | undefined
): Set<PopoverTrigger> {
  const triggers = new Set(
    Array.isArray(trigger)
      ? trigger
      : [trigger ?? (POPOVER_DEFAULTS.trigger as PopoverTrigger)]
  );
  // Anything discoverable by pointer hover must also be keyboard-discoverable.
  if (triggers.has('hover')) triggers.add('focus');
  return triggers;
}

function toCssDimension(value: PopoverProps['maxWidth']): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

function parseCssTime(value: string | undefined): number {
  const normalized = value?.trim() ?? '';
  if (normalized.endsWith('ms')) return Number.parseFloat(normalized) || 0;
  if (normalized.endsWith('s'))
    return (Number.parseFloat(normalized) || 0) * 1000;
  return 0;
}

function resolveExitFallbackMs(surface: HTMLElement | null): number {
  if (!surface || typeof window === 'undefined') return DEFAULT_EXIT_FALLBACK_MS;
  const style = window.getComputedStyle(surface);
  const durations = style.animationDuration
    .split(',')
    .map(parseCssTime);
  const delays = style.animationDelay.split(',').map(parseCssTime);
  const slotCount = Math.max(durations.length, delays.length);
  let longest = 0;
  for (let index = 0; index < slotCount; index += 1) {
    longest = Math.max(
      longest,
      durations[index % durations.length] + delays[index % delays.length]
    );
  }
  return longest > 0 ? longest + EXIT_FALLBACK_GRACE_MS : 0;
}

function readLocaleContext(anchor: HTMLElement): {
  direction: 'ltr' | 'rtl';
  language: string | undefined;
  portalScope: PopoverPortalScope;
} {
  const directionOwner = anchor.closest<HTMLElement>('[dir]');
  const languageOwner = anchor.closest<HTMLElement>('[lang]');
  const readNearest = (attribute: keyof PopoverPortalScope): string | undefined =>
    anchor.closest<HTMLElement>(`[${attribute}]`)?.getAttribute(attribute) ??
    undefined;
  const computedDirection = window.getComputedStyle(anchor).direction;
  return {
    direction:
      directionOwner?.dir === 'rtl' || computedDirection === 'rtl'
        ? 'rtl'
        : 'ltr',
    language:
      languageOwner?.lang || document.documentElement.lang || undefined,
    portalScope: {
      'data-ds-root': readNearest('data-ds-root'),
      'data-vertical': readNearest('data-vertical'),
      'data-tenant': readNearest('data-tenant'),
      'data-theme': readNearest('data-theme'),
      'data-engine': readNearest('data-engine'),
      'data-density': readNearest('data-density'),
    },
  };
}

function resolveArrowOffset(
  placement: OverlayPlacement,
  anchor: HTMLElement,
  surface: HTMLElement,
  direction: 'ltr' | 'rtl'
): string {
  const anchorRect = anchor.getBoundingClientRect();
  const surfaceRect = surface.getBoundingClientRect();
  if (placement.startsWith('top') || placement.startsWith('bottom')) {
    const physicalOffset =
      anchorRect.left + anchorRect.width / 2 - surfaceRect.left;
    const logicalOffset =
      direction === 'rtl' ? surfaceRect.width - physicalOffset : physicalOffset;
    return `${logicalOffset}px`;
  }
  return `${anchorRect.top + anchorRect.height / 2 - surfaceRect.top}px`;
}

/** The positioning runtime uses physical alignment; component placement is logical. */
function toPhysicalPlacement(
  placement: OverlayPlacement,
  direction: 'ltr' | 'rtl'
): OverlayPlacement {
  if (direction !== 'rtl') return placement;
  if (placement.startsWith('top-') || placement.startsWith('bottom-')) {
    if (placement.endsWith('-start'))
      return placement.replace('-start', '-end') as OverlayPlacement;
    if (placement.endsWith('-end'))
      return placement.replace('-end', '-start') as OverlayPlacement;
  }
  return placement;
}

/** Convert measured physical alignment back to logical CSS placement. */
function toLogicalPlacement(
  placement: OverlayPlacement,
  direction: 'ltr' | 'rtl'
): OverlayPlacement {
  return toPhysicalPlacement(placement, direction);
}

function resolvePlacementFromGeometry(
  preferred: OverlayPlacement,
  anchor: HTMLElement,
  surface: HTMLElement
): OverlayPlacement {
  const anchorRect = anchor.getBoundingClientRect();
  const surfaceRect = surface.getBoundingClientRect();
  let side: 'top' | 'bottom' | 'left' | 'right' | undefined;

  if (surfaceRect.bottom <= anchorRect.top + 1) side = 'top';
  if (surfaceRect.top >= anchorRect.bottom - 1) side = 'bottom';
  if (surfaceRect.right <= anchorRect.left + 1) side = 'left';
  if (surfaceRect.left >= anchorRect.right - 1) side = 'right';
  if (!side) {
    // Oversized surfaces can be shifted far enough to overlap the anchor on
    // both axes. Infer the dominant side from centers instead of reverting to
    // a stale preferred side, keeping directional motion and arrow paint in
    // sync with the actual rendered geometry.
    const deltaX =
      surfaceRect.left + surfaceRect.width / 2 -
      (anchorRect.left + anchorRect.width / 2);
    const deltaY =
      surfaceRect.top + surfaceRect.height / 2 -
      (anchorRect.top + anchorRect.height / 2);
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return preferred;
    side =
      Math.abs(deltaY) >= Math.abs(deltaX)
        ? deltaY < 0
          ? 'top'
          : 'bottom'
        : deltaX < 0
          ? 'left'
          : 'right';
  }

  const hasAlignment = preferred.includes('-');
  if (!hasAlignment) return side;
  if (side === 'top' || side === 'bottom') {
    const startDelta = Math.abs(surfaceRect.left - anchorRect.left);
    const endDelta = Math.abs(surfaceRect.right - anchorRect.right);
    return `${side}-${startDelta <= endDelta ? 'start' : 'end'}`;
  }

  const startDelta = Math.abs(surfaceRect.top - anchorRect.top);
  const endDelta = Math.abs(surfaceRect.bottom - anchorRect.bottom);
  return `${side}-${startDelta <= endDelta ? 'start' : 'end'}`;
}

function describeTrigger(
  children: ReactNode,
  surfaceId: string,
  open: boolean,
  role: PopoverRole
): ReactNode {
  if (!isValidElement(children) || children.type === React.Fragment)
    return children;

  const child = children as ReactElement<{
    'aria-controls'?: string;
    'aria-expanded'?: boolean;
    'aria-haspopup'?: PopoverRole;
    'aria-label'?: string;
    title?: string;
  }>;
  const nativeTitle = child.props.title;

  return cloneElement(child, {
    'aria-controls': surfaceId,
    'aria-expanded': open,
    'aria-haspopup': role,
    'aria-label': child.props['aria-label'] ?? nativeTitle,
    // Prevent a second, browser-native tooltip competing with the DS surface.
    title: undefined,
  });
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (props, ref) => {
    const {
      content,
      title,
      trigger = POPOVER_DEFAULTS.trigger,
      placement = POPOVER_DEFAULTS.placement,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      arrow = POPOVER_DEFAULTS.arrow,
      recipe = POPOVER_DEFAULTS.recipe,
      density,
      children,
      mouseEnterDelay = POPOVER_DEFAULTS.mouseEnterDelay,
      mouseLeaveDelay = POPOVER_DEFAULTS.mouseLeaveDelay,
      offset = POPOVER_DEFAULTS.offset,
      maxWidth = POPOVER_DEFAULTS.maxWidth,
      touchBehavior = POPOVER_DEFAULTS.touchBehavior,
      closeOnEscape = POPOVER_DEFAULTS.closeOnEscape,
      closeOnInteractOutside = POPOVER_DEFAULTS.closeOnInteractOutside,
      role = POPOVER_DEFAULTS.role,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      destroyTooltipOnHide = POPOVER_DEFAULTS.destroyTooltipOnHide,
      zIndex,
      className,
      style,
      overlayClassName,
      overlayStyle,
    } = props;

    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const [present, setPresent] = useState(Boolean(isOpen));
    const [positioningActive, setPositioningActive] = useState(Boolean(isOpen));
    const [mounted, setMounted] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);
    const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
    const [language, setLanguage] = useState<string | undefined>();
    const [portalScope, setPortalScope] = useState<PopoverPortalScope>({});
    const [portalVariables, setPortalVariables] =
      useState<DsPortalVariableStyle>({});
    const resolvedPlacementProp = (placement ?? 'top') as PopoverPlacement;
    const preferredOverlayPlacement =
      POPOVER_TO_OVERLAY_PLACEMENT[resolvedPlacementProp];
    const physicalPlacement = toPhysicalPlacement(
      preferredOverlayPlacement,
      direction
    );
    const [resolvedPlacement, setResolvedPlacement] = useState<OverlayPlacement>(
      preferredOverlayPlacement
    );
    const [arrowOffset, setArrowOffset] = useState<string>();

    const surfaceId = useId();
    const titleId = `${surfaceId}-title`;
    const triggers = normalizeTriggers(trigger);
    const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const focusResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const touchStartedOpenRef = useRef(false);
    const pointerDownTypeRef = useRef<string | null>(null);
    const suppressNextFocusRef = useRef(false);
    const activeReasonsRef = useRef<Set<OpenReason>>(new Set());
    const requestedOpenRef = useRef(Boolean(isOpen));
    const hasBeenOpenRef = useRef(Boolean(isOpen));
    // Focus-ownership state: whether focus currently lives inside the surface,
    // whether this open session already ran its initial-focus pass, and the
    // pointer modality of the latest activation (coarse taps never move focus).
    const focusInsideSurfaceRef = useRef(false);
    const didInitialFocusRef = useRef(false);
    const lastPointerModalityRef = useRef<string | null>(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
      requestedOpenRef.current = Boolean(isOpen);
      if (isOpen) {
        if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
        hasBeenOpenRef.current = true;
        setPresent(true);
        setPositioningActive(true);
        return;
      }
      activeReasonsRef.current.clear();
      if (!present || !hasBeenOpenRef.current) return;
      exitTimeoutRef.current = setTimeout(
        () => {
          exitTimeoutRef.current = null;
          setPositioningActive(false);
          if (destroyTooltipOnHide) setPresent(false);
        },
        resolveExitFallbackMs(surfaceEl)
      );
      return () => {
        if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      };
    }, [destroyTooltipOnHide, isOpen, present, surfaceEl]);

    useEffect(
      () => () => {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
        if (focusResetTimeoutRef.current)
          clearTimeout(focusResetTimeoutRef.current);
      },
      []
    );

    useLayoutEffect(() => {
      if (!anchorEl || typeof window === 'undefined') return undefined;
      const update = (): void => {
        const locale = readLocaleContext(anchorEl);
        setDirection(locale.direction);
        setLanguage(locale.language);
        setPortalScope(locale.portalScope);
        setPortalVariables(readDsPortalVariables(anchorEl));
      };
      update();

      // Runtime locale/theme switches are common in white-labelled shells.
      // Track only inheritable DS/locale attributes and project them onto the
      // measured portal branch rather than observing document subtrees.
      const observer =
        typeof MutationObserver === 'undefined'
          ? null
          : new MutationObserver(update);
      let owner: HTMLElement | null = anchorEl;
      while (owner) {
        observer?.observe(owner, {
          attributes: true,
          attributeFilter: [
            'dir',
            'lang',
            'class',
            'style',
            'data-theme',
            'data-engine',
            'data-density',
            'data-tenant',
            'data-vertical',
          ],
        });
        owner = owner.parentElement;
      }
      return () => observer?.disconnect();
    }, [anchorEl]);

    const requestOpen = useCallback(
      (nextOpen: boolean) => {
        if (requestedOpenRef.current === nextOpen) return;
        requestedOpenRef.current = nextOpen;
        if (!isControlled) setInternalOpen(nextOpen);
        onOpenChange?.(nextOpen);
      },
      [isControlled, onOpenChange]
    );

    const show = useCallback((reason: OpenReason) => {
      activeReasonsRef.current.add(reason);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
      if (requestedOpenRef.current || enterTimeoutRef.current) return;
      const effectiveDelay = reason === 'hover' ? (mouseEnterDelay ?? 0) : 0;
      if (effectiveDelay <= 0) {
        requestOpen(true);
        return;
      }
      enterTimeoutRef.current = setTimeout(() => {
        enterTimeoutRef.current = null;
        if (activeReasonsRef.current.has(reason)) requestOpen(true);
      }, effectiveDelay);
    }, [mouseEnterDelay, requestOpen]);

    const hide = useCallback((reason: OpenReason) => {
      activeReasonsRef.current.delete(reason);
      if (activeReasonsRef.current.size > 0) return;
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
        enterTimeoutRef.current = null;
      }
      if (!requestedOpenRef.current || leaveTimeoutRef.current) return;
      const effectiveDelay = reason === 'hover' ? (mouseLeaveDelay ?? 0) : 0;
      if (effectiveDelay <= 0) {
        requestOpen(false);
        return;
      }
      leaveTimeoutRef.current = setTimeout(() => {
        leaveTimeoutRef.current = null;
        if (activeReasonsRef.current.size === 0) requestOpen(false);
      }, effectiveDelay);
    }, [mouseLeaveDelay, requestOpen]);

    const closeAll = useCallback(() => {
      activeReasonsRef.current.clear();
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      enterTimeoutRef.current = null;
      leaveTimeoutRef.current = null;
      requestOpen(false);
    }, [requestOpen]);

    const handleEscape = useCallback(() => {
      closeAll();
      suppressNextFocusRef.current = true;
      if (anchorEl) focusFirstWithin(anchorEl, TRIGGER_FOCUSABLE_SELECTOR);
      focusResetTimeoutRef.current = setTimeout(() => {
        suppressNextFocusRef.current = false;
        focusResetTimeoutRef.current = null;
      }, 0);
    }, [anchorEl, closeAll]);

    const { isTopMost, zIndex: layerZIndex, layerProps } = useOverlayLayer({
      kind: 'popover',
      active: Boolean(isOpen),
      // Lightweight layers still join the shared Escape route so a nested
      // popover blocks lower dialogs from consuming the same key press.
      modal: true,
      lockScroll: false,
      restoreFocus: false,
      onEscape: closeOnEscape ? handleEscape : undefined,
    });

    const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
      anchor: anchorEl,
      overlay: positioningActive ? surfaceEl : null,
      placement: physicalPlacement,
      offset,
      flip: true,
    });

    useLayoutEffect(() => {
      if (!isOpen || !anchorEl || !surfaceEl || typeof window === 'undefined')
        return undefined;

      const update = (): void => {
        const resolvedPhysical = resolvePlacementFromGeometry(
          physicalPlacement,
          anchorEl,
          surfaceEl
        );
        const resolvedLogical = toLogicalPlacement(resolvedPhysical, direction);
        setResolvedPlacement(resolvedLogical);
        setArrowOffset(
          resolveArrowOffset(resolvedLogical, anchorEl, surfaceEl, direction)
        );
      };
      const frame = window.requestAnimationFrame(update);
      const observer =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
      observer?.observe(anchorEl);
      observer?.observe(surfaceEl);
      const visualViewport = window.visualViewport;
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      visualViewport?.addEventListener('resize', update);
      visualViewport?.addEventListener('scroll', update);
      return () => {
        window.cancelAnimationFrame(frame);
        observer?.disconnect();
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
        visualViewport?.removeEventListener('resize', update);
        visualViewport?.removeEventListener('scroll', update);
      };
    }, [
      anchorEl,
      direction,
      isOpen,
      physicalPlacement,
      preferredOverlayPlacement,
      positionStyle.left,
      positionStyle.top,
      surfaceEl,
    ]);

    useEffect(() => {
      if (!isOpen || typeof document === 'undefined') return undefined;

      const onPointerDown = (event: PointerEvent): void => {
        if (!closeOnInteractOutside || !isTopMost()) return;
        const target = event.target as Node | null;
        if (
          target &&
          (anchorEl?.contains(target) || surfaceEl?.contains(target))
        )
          return;
        closeAll();
      };
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => {
        document.removeEventListener('pointerdown', onPointerDown, true);
      };
    }, [
      anchorEl,
      closeAll,
      closeOnInteractOutside,
      isTopMost,
      isOpen,
      surfaceEl,
    ]);

    // Focus ownership, tracking: remember whether focus lives inside the
    // surface. A blur toward a real destination clears the flag (that focus
    // move stays user-owned); an inert/unmount blur has no destination and
    // keeps the flag so the close path can return the stranded focus.
    useEffect(() => {
      const surface = surfaceEl;
      if (!surface) return undefined;
      const onFocusIn = (): void => {
        focusInsideSurfaceRef.current = true;
      };
      const onFocusOut = (event: FocusEvent): void => {
        if (event.relatedTarget) focusInsideSurfaceRef.current = false;
      };
      surface.addEventListener('focusin', onFocusIn);
      surface.addEventListener('focusout', onFocusOut);
      return () => {
        surface.removeEventListener('focusin', onFocusIn);
        surface.removeEventListener('focusout', onFocusOut);
      };
    }, [surfaceEl]);

    // Focus ownership, initial focus: only activation-driven opens (a click
    // via pointer or keyboard) move focus into the surface -- the first
    // menuitem/option or focusable descendant, else the surface itself.
    // Hover/focus discovery, coarse taps and controlled opens never steal
    // focus. Deferred one frame so the measured position lands first.
    useEffect(() => {
      if (!isOpen) {
        didInitialFocusRef.current = false;
        return undefined;
      }
      const surface = surfaceEl;
      if (!surface || didInitialFocusRef.current) return undefined;
      if (!activeReasonsRef.current.has('click')) return undefined;
      if (lastPointerModalityRef.current === 'touch') return undefined;
      if (typeof window === 'undefined') return undefined;
      didInitialFocusRef.current = true;
      const frame = window.requestAnimationFrame(() => {
        // The open may have been cancelled (Escape, light dismiss) while the
        // frame was pending; never land focus inside a closing surface.
        if (!requestedOpenRef.current || !surface.isConnected) return;
        const active = document.activeElement;
        if (active && surface.contains(active)) return;
        focusFirstWithin(surface, SURFACE_FOCUSABLE_SELECTOR, true);
      });
      return () => window.cancelAnimationFrame(frame);
    }, [isOpen, surfaceEl]);

    // Focus ownership, return: closing paths beyond Escape (light dismiss,
    // controlled close, blur-driven hide, destroy-on-hide) must not strand
    // focus inside a surface that just became inert. When focus lived inside,
    // it returns to the trigger's focusable child.
    useEffect(() => {
      if (isOpen || typeof document === 'undefined') return;
      const focusWasInside =
        focusInsideSurfaceRef.current ||
        Boolean(surfaceEl?.contains(document.activeElement));
      focusInsideSurfaceRef.current = false;
      if (!focusWasInside || !anchorEl) return;
      focusFirstWithin(anchorEl, TRIGGER_FOCUSABLE_SELECTOR);
    }, [anchorEl, isOpen, surfaceEl]);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
      if (!triggers.has('click')) return;
      if (surfaceEl?.contains(event.target as Node)) return;
      // Keyboard/AT-synthesized clicks carry `detail: 0` and no pointerdown:
      // refresh the modality or a stale 'touch' from an earlier tap would
      // wrongly skip the deliberate initial focus for a keyboard activation.
      if (event.detail === 0) lastPointerModalityRef.current = 'keyboard';
      if (activeReasonsRef.current.has('click')) hide('click');
      else if (
        requestedOpenRef.current &&
        activeReasonsRef.current.size === 0
      )
        closeAll();
      else show('click');
    };

    const handlePointerEnter = (
      event: ReactPointerEvent<HTMLDivElement>
    ): void => {
      if (event.pointerType !== 'touch' && triggers.has('hover')) show('hover');
    };

    const handlePointerLeave = (
      event: ReactPointerEvent<HTMLDivElement>
    ): void => {
      if (event.pointerType !== 'touch' && triggers.has('hover')) hide('hover');
    };

    const handleFocus = (): void => {
      if (suppressNextFocusRef.current) {
        suppressNextFocusRef.current = false;
        return;
      }
      // Do not count focus synthesized by the same pointer activation as a
      // second open reason. Keyboard focus remains immediately discoverable.
      if (
        pointerDownTypeRef.current === 'touch' ||
        (pointerDownTypeRef.current && triggers.has('click'))
      )
        return;
      if (triggers.has('focus')) show('focus');
    };

    const handleBlur = (event: ReactFocusEvent<HTMLDivElement>): void => {
      if (!triggers.has('focus')) return;
      const nextTarget = event.relatedTarget as Node | null;
      if (
        nextTarget &&
        (anchorEl?.contains(nextTarget) || surfaceEl?.contains(nextTarget))
      )
        return;
      hide('focus');
    };

    const handlePointerDown = (
      event: ReactPointerEvent<HTMLDivElement>
    ): void => {
      pointerDownTypeRef.current = event.pointerType || 'mouse';
      // The modality must survive pointerup: the click that activates the
      // trigger fires after pointerup clears pointerDownTypeRef.
      lastPointerModalityRef.current = event.pointerType || 'mouse';
      if (event.pointerType === 'touch')
        touchStartedOpenRef.current = requestedOpenRef.current;
    };

    const handlePointerUp = (
      event: ReactPointerEvent<HTMLDivElement>
    ): void => {
      const wasTouch = event.pointerType === 'touch';
      pointerDownTypeRef.current = null;
      if (
        !wasTouch ||
        touchBehavior !== 'toggle' ||
        triggers.has('click') ||
        surfaceEl?.contains(event.target as Node)
      )
        return;
      if (touchStartedOpenRef.current) hide('touch');
      else show('touch');
    };

    const handlePointerCancel = (): void => {
      pointerDownTypeRef.current = null;
    };

    const surfaceStyle: PopoverInstanceStyle = {
      ...(maxWidth === undefined
        ? {}
        : { '--ds-popover-instance-max-width': toCssDimension(maxWidth) }),
      '--ds-popover-instance-z-index': zIndex ?? layerZIndex,
      ...(arrowOffset === undefined
        ? {}
        : { '--ds-popover-arrow-anchor-offset': arrowOffset }),
      ...overlayStyle,
      ...positionStyle,
    };

    const resolvedRole = (role ?? 'dialog') as PopoverRole;
    const describedTrigger = describeTrigger(
      children,
      surfaceId,
      Boolean(isOpen),
      resolvedRole
    );
    const arrowCentered =
      typeof arrow === 'object' ? arrow.pointAtCenter : false;

    const surfaceNode = present && mounted ? (
      <div
        ref={setSurfaceEl}
        {...layerProps}
        id={surfaceId}
        role={resolvedRole}
        aria-modal={resolvedRole === 'dialog' ? false : undefined}
        aria-label={title || ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (title ? titleId : undefined)}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        tabIndex={-1}
        dir={direction}
        lang={language}
        data-part="surface"
        data-open={isOpen ? 'true' : 'false'}
        data-placement={resolvedPlacement}
        data-preferred-placement={resolvedPlacementProp}
        data-collision-adjusted={
          resolvedPlacement !== preferredOverlayPlacement ? 'true' : undefined
        }
        data-recipe={recipe}
        data-density={density ?? portalScope['data-density']}
        data-has-title={Boolean(title)}
        data-has-arrow={Boolean(arrow)}
        data-arrow-centered={arrowCentered ? 'true' : 'false'}
        data-arrow-tracked={arrowOffset ? 'true' : 'false'}
        data-layer-kind="popover"
        data-ds-position-strategy={strategy}
        className={overlayClassName || undefined}
        style={surfaceStyle}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget || isOpen) return;
          if (exitTimeoutRef.current) {
            clearTimeout(exitTimeoutRef.current);
            exitTimeoutRef.current = null;
          }
          setPositioningActive(false);
          if (destroyTooltipOnHide) setPresent(false);
        }}
      >
        {title ? (
          <div id={titleId} data-part="title">
            {title}
          </div>
        ) : null}
        <div data-part="body">{content}</div>
        {arrow ? <span data-part="arrow" aria-hidden="true" /> : null}
      </div>
    ) : null;

    return (
      <div
        ref={(node) => {
          setAnchorEl(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        data-part="trigger"
        data-open={isOpen ? 'true' : 'false'}
        data-trigger={Array.from(triggers).join(' ')}
        data-density={density}
        data-touch-behavior={touchBehavior}
        className={`rottay-popover--modern${className ? ` ${className}` : ''}`}
        style={{ position: 'relative', display: 'inline-flex', ...style }}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...anchorAttrs}
      >
        {describedTrigger}
        {surfaceNode && strategy === 'anchor-css' ? surfaceNode : null}
        {surfaceNode && strategy === 'js' ? (
          <Portal>
            <OverlayPortalBoundary>
              <div
                className="rottay-popover--modern"
                data-part="trigger"
                data-portal-scope="true"
                dir={direction}
                lang={language}
                {...portalScope}
                data-density={density ?? portalScope['data-density']}
                style={{ display: 'contents', ...portalVariables }}
              >
                {surfaceNode}
              </div>
            </OverlayPortalBoundary>
          </Portal>
        ) : null}
      </div>
    );
  }
);

Popover.displayName = 'Popover.Hermes';

export default Popover;
