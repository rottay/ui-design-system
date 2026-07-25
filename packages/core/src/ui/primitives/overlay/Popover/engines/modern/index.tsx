'use client';

/**
 * Modern Popover engine.
 *
 * Behavior, semantic relationships and positioning stay code-owned; paint and
 * coordinated material recipes stay token-owned. Native anchor positioning
 * stays in-tree/top-layer; measured positioning uses the shared overlay portal
 * so clipping ancestors cannot cut off the surface.
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
} from '../../../../runtime/overlay/portal-theme';

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
      anchorEl
        ?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        ?.focus();
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

    const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
      if (!triggers.has('click')) return;
      if (surfaceEl?.contains(event.target as Node)) return;
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
