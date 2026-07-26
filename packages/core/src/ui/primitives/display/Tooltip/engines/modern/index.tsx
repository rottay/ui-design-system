/**
 * @fileoverview Tooltip Modern Engine - Rottay Design System
 * @description Custom DS token inline-styled tooltip with full trigger support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine renders a custom tooltip bubble positioned by the shared
 * overlay positioning runtime (`runtime/overlay/positioning`). No DaisyUI
 * classes are used.
 *
 * **Enhancements:**
 * - Multi-trigger support: hover, focus, click, manual
 * - Show/hide delay with setTimeout for smooth UX
 * - Controlled visibility via `visible` prop
 * - `onVisibleChange` callback for external state sync
 *
 * **Positioning:**
 * - `useOverlayPosition` resolves the strategy per instance:
 *   `anchor-css` renders the bubble inline and promotes it to the top layer
 *   (popover + CSS anchor positioning); `js` renders it through the shared
 *   overlay portal at a measured fixed position.
 * - The wrapper is the anchor; the bubble stamps
 *   `data-ds-position-strategy` for e2e/debug observability.
 *
 * @example Basic Usage
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip engine="modern" content="DS token tooltip" color="primary">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 *
 * @example Click Trigger
 * ```tsx
 * <Tooltip engine="modern" content="Click tooltip" trigger="click">
 *   <Button>Click me</Button>
 * </Tooltip>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @module Tooltip/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

"use client";

import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import type { TooltipProps } from "../../contracts";
import { TOOLTIP_DEFAULTS } from "../../contracts";
import { formatShortcutKey } from "../../../../../../infrastructure/runtime/application/interaction/shortcuts";
import { Portal } from "../../../../runtime/overlay/portal";
import {
  readDsPortalVariables,
  type DsPortalVariableStyle,
} from "../../../../runtime/overlay/foundation/portal-theme";
import { useOverlayLayer } from "../../../../runtime/overlay/layer-stack";
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from "../../../../runtime/overlay/positioning";

type OpenReason = "hover" | "focus" | "click" | "content" | "touch";

type TooltipInstanceStyle = CSSProperties & {
  "--ds-tooltip-instance-max-width"?: string;
  "--ds-tooltip-instance-z-index"?: string | number;
  "--ds-tooltip-arrow-anchor-offset"?: string;
};

type TooltipPortalScope = {
  "data-ds-root"?: string;
  "data-vertical"?: string;
  "data-tenant"?: string;
  "data-theme"?: string;
  "data-engine"?: string;
  "data-density"?: string;
};

const INTERACTIVE_POINTER_GRACE_MS = 120;
const DEFAULT_EXIT_FALLBACK_MS = 240;
const EXIT_FALLBACK_GRACE_MS = 64;

/**
 * Normalize trigger prop to an array of trigger types.
 */
function normalizeTriggers(trigger?: string | string[]): Set<string> {
  const requested = new Set(
    Array.isArray(trigger) ? trigger : [trigger ?? "hover"]
  );

  // Anything discoverable with a mouse must also be discoverable from the
  // keyboard. Explicit manual and click-only contracts remain untouched.
  if (requested.has("hover")) requested.add("focus");
  return requested;
}

function toCssDimension(value: TooltipProps["maxWidth"]): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function parseCssTime(value: string | undefined): number {
  const normalized = value?.trim() ?? "";
  if (normalized.endsWith("ms")) return Number.parseFloat(normalized) || 0;
  if (normalized.endsWith("s"))
    return (Number.parseFloat(normalized) || 0) * 1000;
  return 0;
}

function resolveExitFallbackMs(bubble: HTMLElement | null): number {
  if (!bubble || typeof window === "undefined") return DEFAULT_EXIT_FALLBACK_MS;

  const style = window.getComputedStyle(bubble);
  const durations = style.transitionDuration
    .split(",")
    .map(parseCssTime);
  const delays = style.transitionDelay.split(",").map(parseCssTime);
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

function toPhysicalPlacement(
  placement: NonNullable<TooltipProps["placement"]>,
  direction: "ltr" | "rtl" | undefined
): NonNullable<TooltipProps["placement"]> {
  if (direction !== "rtl") return placement;
  if (placement.startsWith("top-") || placement.startsWith("bottom-")) {
    if (placement.endsWith("-start"))
      return placement.replace("-start", "-end") as NonNullable<
        TooltipProps["placement"]
      >;
    if (placement.endsWith("-end"))
      return placement.replace("-end", "-start") as NonNullable<
        TooltipProps["placement"]
      >;
  }
  return placement;
}

function appendDescribedBy(
  existing: unknown,
  tooltipId: string,
  enabled: boolean
): string | undefined {
  const tokens =
    typeof existing === "string" ? existing.split(/\s+/).filter(Boolean) : [];
  if (enabled && !tokens.includes(tooltipId)) tokens.push(tooltipId);
  return tokens.length > 0 ? tokens.join(" ") : undefined;
}

function describeTrigger(
  children: ReactNode,
  tooltipId: string,
  enabled: boolean,
  interactive: boolean
): ReactNode {
  if (!isValidElement(children) || children.type === React.Fragment)
    return children;

  const child = children as ReactElement<{
    "aria-describedby"?: string;
    "aria-controls"?: string;
    "aria-expanded"?: boolean;
    "aria-haspopup"?: "dialog";
    "aria-label"?: string;
    title?: string;
  }>;

  // A native title tooltip competes with the DS overlay and produces a
  // browser-dependent second bubble. Preserve its accessibility value when it
  // was the trigger's only explicit name, but never leave native tooltip
  // chrome attached to a DS Tooltip trigger.
  const nativeTitle = child.props.title;
  const accessibleName = child.props["aria-label"] ?? nativeTitle;

  if (interactive) {
    return cloneElement(child, {
      "aria-controls": tooltipId,
      "aria-expanded": enabled,
      "aria-haspopup": "dialog",
      "aria-label": accessibleName,
      title: undefined,
    });
  }

  return cloneElement(child, {
    "aria-describedby": appendDescribedBy(
      child.props["aria-describedby"],
      tooltipId,
      enabled
    ),
    "aria-label": accessibleName,
    title: undefined,
  });
}

function resolvePlacementFromGeometry(
  preferred: TooltipProps["placement"],
  anchor: HTMLElement,
  bubble: HTMLElement,
  direction: "ltr" | "rtl" = "ltr"
): NonNullable<TooltipProps["placement"]> {
  const anchorRect = anchor.getBoundingClientRect();
  const bubbleRect = bubble.getBoundingClientRect();
  const preferredHasAlignment = preferred?.includes("-") ?? false;

  let side: "top" | "bottom" | "left" | "right" | undefined;
  if (bubbleRect.bottom <= anchorRect.top + 1) side = "top";
  if (bubbleRect.top >= anchorRect.bottom - 1) side = "bottom";
  if (bubbleRect.right <= anchorRect.left + 1) side = "left";
  if (bubbleRect.left >= anchorRect.right - 1) side = "right";

  if (!side) {
    const deltaX =
      bubbleRect.left + bubbleRect.width / 2 -
      (anchorRect.left + anchorRect.width / 2);
    const deltaY =
      bubbleRect.top + bubbleRect.height / 2 -
      (anchorRect.top + anchorRect.height / 2);
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1)
      return preferred ?? TOOLTIP_DEFAULTS.placement;
    side =
      Math.abs(deltaY) >= Math.abs(deltaX)
        ? deltaY < 0
          ? "top"
          : "bottom"
        : deltaX < 0
        ? "left"
        : "right";
  }
  if (!preferredHasAlignment) return side;

  // Anchor-position fallbacks may flip alignment as well as side. Derive the
  // resolved logical edge so the arrow stays attached after a collision.
  if (side === "top" || side === "bottom") {
    const leftDelta = Math.abs(bubbleRect.left - anchorRect.left);
    const rightDelta = Math.abs(bubbleRect.right - anchorRect.right);
    const physicalAlignment = leftDelta <= rightDelta ? "left" : "right";
    const logicalAlignment =
      direction === "rtl"
        ? physicalAlignment === "left"
          ? "end"
          : "start"
        : physicalAlignment === "left"
        ? "start"
        : "end";
    return `${side}-${logicalAlignment}`;
  }

  const topDelta = Math.abs(bubbleRect.top - anchorRect.top);
  const bottomDelta = Math.abs(bubbleRect.bottom - anchorRect.bottom);
  return `${side}-${topDelta <= bottomDelta ? "start" : "end"}`;
}

function readPortalScope(anchor: HTMLElement): TooltipPortalScope {
  const localRoot = anchor.closest<HTMLElement>("[data-ds-root]");
  if (!localRoot) return {};

  const readRoot = (name: string): string | undefined =>
    localRoot.getAttribute(name) ?? undefined;
  const readNearest = (name: string): string | undefined =>
    anchor.closest<HTMLElement>(`[${name}]`)?.getAttribute(name) ?? undefined;

  return {
    "data-ds-root": readRoot("data-ds-root") ?? "",
    "data-vertical":
      readNearest("data-vertical") ?? readRoot("data-vertical"),
    "data-tenant": readNearest("data-tenant") ?? readRoot("data-tenant"),
    "data-theme": readNearest("data-theme"),
    "data-engine": readNearest("data-engine"),
    "data-density": readNearest("data-density"),
  };
}

function readLocaleContext(anchor: HTMLElement): {
  direction: "ltr" | "rtl";
  language: string | undefined;
  portalScope: TooltipPortalScope;
} {
  const directionOwner = anchor.closest<HTMLElement>("[dir]");
  const languageOwner = anchor.closest<HTMLElement>("[lang]");
  const computedDirection = window.getComputedStyle(anchor).direction;
  return {
    direction:
      directionOwner?.dir === "rtl" || computedDirection === "rtl"
        ? "rtl"
        : "ltr",
    language:
      languageOwner?.lang || document.documentElement.lang || undefined,
    portalScope: readPortalScope(anchor),
  };
}

function resolveArrowOffset(
  placement: NonNullable<TooltipProps["placement"]>,
  anchor: HTMLElement,
  bubble: HTMLElement,
  direction: "ltr" | "rtl"
): string {
  const anchorRect = anchor.getBoundingClientRect();
  const bubbleRect = bubble.getBoundingClientRect();
  if (placement.startsWith("top") || placement.startsWith("bottom")) {
    const physicalOffset =
      anchorRect.left + anchorRect.width / 2 - bubbleRect.left;
    const logicalOffset =
      direction === "rtl" ? bubbleRect.width - physicalOffset : physicalOffset;
    return `${logicalOffset}px`;
  }
  return `${anchorRect.top + anchorRect.height / 2 - bubbleRect.top}px`;
}

/**
 * Modern (DS token inline-styled) implementation of the Tooltip component.
 *
 * Features:
 * - Multi-trigger support (hover, focus, click, manual)
 * - Show/hide delay with setTimeout
 * - Controlled visibility via `visible` prop
 * - Shared overlay positioning (anchor-css top layer, or measured portal)
 * - DS token color variants
 * - Smooth transitions
 *
 * @example
 * ```tsx
 * <ModernTooltip content="Helpful tip" color="primary">
 *   <Button>Hover me</Button>
 * </ModernTooltip>
 * ```
 */
const ModernTooltip = forwardRef<HTMLDivElement, TooltipProps>((props, ref) => {
  const {
    content,
    children,
    color = TOOLTIP_DEFAULTS.color,
    recipe = TOOLTIP_DEFAULTS.recipe,
    density,
    placement = TOOLTIP_DEFAULTS.placement,
    arrow = TOOLTIP_DEFAULTS.arrow,
    radius = TOOLTIP_DEFAULTS.radius,
    interactive = false,
    disabled = TOOLTIP_DEFAULTS.disabled,
    visible,
    defaultVisible = false,
    trigger,
    showDelay = TOOLTIP_DEFAULTS.showDelay,
    hideDelay = TOOLTIP_DEFAULTS.hideDelay,
    touchBehavior = TOOLTIP_DEFAULTS.touchBehavior,
    touchLongPressDelay = TOOLTIP_DEFAULTS.touchLongPressDelay,
    onVisibleChange,
    maxWidth,
    offset = TOOLTIP_DEFAULTS.offset,
    zIndex,
    className = "",
    style,
    shortcut,
  } = props;

  const triggers = normalizeTriggers(trigger);
  // Detect controlled mode: when the consumer supplies `visible`, we defer
  // to their state and only notify via onVisibleChange instead of self-managing.
  const isControlled = visible !== undefined;

  // Internal state only used in uncontrolled mode
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [bubbleEl, setBubbleEl] = useState<HTMLDivElement | null>(null);
  // Both render paths attach on the client after mount (the portal needs a
  // container; the inline top-layer bubble must not join server markup, or
  // hydration would mismatch for initially-visible tooltips).
  const [mounted, setMounted] = useState(false);
  const tooltipId = useId();
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeReasonsRef = useRef<Set<OpenReason>>(new Set());
  const suppressNextFocusRef = useRef(false);
  const pointerDownTypeRef = useRef<string | null>(null);

  // Single source of truth: controlled prop wins over internal state
  const isVisible = isControlled ? visible : internalVisible;
  const hasRenderableContent =
    content !== null && content !== undefined && content !== false;
  const requestedVisibleRef = useRef(Boolean(isVisible));
  const [present, setPresent] = useState(Boolean(isVisible));
  const [resolvedPlacement, setResolvedPlacement] = useState(placement);
  const [arrowOffset, setArrowOffset] = useState<string>();
  const [direction, setDirection] = useState<"ltr" | "rtl" | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const [portalScope, setPortalScope] = useState<TooltipPortalScope>({});
  const [portalVariables, setPortalVariables] =
    useState<DsPortalVariableStyle>({});
  const positioningPlacement = toPhysicalPlacement(placement, direction);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent stale timeouts from firing after the component unmounts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      if (focusResetTimeoutRef.current)
        clearTimeout(focusResetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    requestedVisibleRef.current = Boolean(isVisible);
    if (isVisible) {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      setPresent(true);
      return;
    }

    activeReasonsRef.current.clear();

    if (!present) return;
    exitTimeoutRef.current = setTimeout(
      () => {
        exitTimeoutRef.current = null;
        setPresent(false);
      },
      resolveExitFallbackMs(bubbleEl)
    );
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, [bubbleEl, isVisible, present]);

  const setWrapperRef = useCallback(
    (node: HTMLDivElement | null) => {
      setAnchorEl(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  // The wrapper is the anchor; the bubble is the positioned overlay. The
  // bubble only mounts while visible, so element presence drives the
  // positioning lifecycle.
  const {
    strategy,
    style: positionStyle,
    anchorAttrs,
  } = useOverlayPosition({
    anchor: anchorEl,
    overlay: bubbleEl,
    placement: positioningPlacement,
    offset,
    flip: true,
  });

  // Portals leave the trigger's DOM ancestry. Carry the two locale
  // attributes that affect reading direction, hyphenation and pronunciation
  // onto the bubble so RTL/i18n behavior is identical in both branches.
  useLayoutEffect(() => {
    if (!anchorEl || typeof window === "undefined") return undefined;
    const update = (): void => {
      const locale = readLocaleContext(anchorEl);
      setDirection(locale.direction);
      setLanguage(locale.language);
      setPortalScope(locale.portalScope);
      setPortalVariables(readDsPortalVariables(anchorEl));
    };
    update();

    const observer =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(update);
    let owner: HTMLElement | null = anchorEl;
    while (owner) {
      observer?.observe(owner, {
        attributes: true,
        attributeFilter: [
          "dir",
          "lang",
          "class",
          "style",
          "data-theme",
          "data-engine",
          "data-density",
          "data-tenant",
          "data-vertical",
        ],
      });
      owner = owner.parentElement;
    }
    return () => observer?.disconnect();
  }, [anchorEl]);

  const requestVisibility = useCallback(
    (nextVisible: boolean) => {
      if (requestedVisibleRef.current === nextVisible) return;
      requestedVisibleRef.current = nextVisible;
      if (!isControlled) setInternalVisible(nextVisible);
      onVisibleChange?.(nextVisible);
    },
    [isControlled, onVisibleChange]
  );

  const show = useCallback(
    (reason: OpenReason) => {
      if (disabled) return;
      activeReasonsRef.current.add(reason);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (showTimeoutRef.current && reason !== "hover") {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (requestedVisibleRef.current || showTimeoutRef.current) return;

      // Keyboard and explicit activation must respond immediately; only
      // incidental pointer hover observes the discoverability delay.
      const effectiveDelay = reason === "hover" ? showDelay : 0;
      if (effectiveDelay > 0) {
        showTimeoutRef.current = setTimeout(() => {
          showTimeoutRef.current = null;
          if (activeReasonsRef.current.has(reason)) requestVisibility(true);
        }, effectiveDelay);
      } else {
        requestVisibility(true);
      }
    },
    [disabled, requestVisibility, showDelay]
  );

  const hide = useCallback(
    (reason: OpenReason) => {
      activeReasonsRef.current.delete(reason);
      if (activeReasonsRef.current.size > 0) return;
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      const effectiveDelay = interactive
        ? Math.max(hideDelay, INTERACTIVE_POINTER_GRACE_MS)
        : hideDelay;
      if (effectiveDelay > 0) {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
          hideTimeoutRef.current = null;
          if (activeReasonsRef.current.size === 0) requestVisibility(false);
        }, effectiveDelay);
      } else {
        requestVisibility(false);
      }
    },
    [hideDelay, interactive, requestVisibility]
  );

  const closeAll = useCallback(() => {
    activeReasonsRef.current.clear();
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    showTimeoutRef.current = null;
    hideTimeoutRef.current = null;
    touchTimeoutRef.current = null;
    requestVisibility(false);
  }, [requestVisibility]);

  useEffect(() => {
    if (disabled) closeAll();
  }, [closeAll, disabled]);

  const handleEscape = useCallback(() => {
    const shouldRestoreFocus =
      interactive ||
      activeReasonsRef.current.has("click") ||
      activeReasonsRef.current.has("touch");
    closeAll();
    if (!shouldRestoreFocus) return;
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
  }, [anchorEl, closeAll, interactive]);

  const { isTopMost, zIndex: layerZIndex, layerProps } = useOverlayLayer({
    kind: "tooltip",
    active: Boolean(isVisible && !disabled && hasRenderableContent),
    modal: true,
    lockScroll: false,
    restoreFocus: false,
    onEscape: handleEscape,
  });

  const toggle = useCallback(() => {
    if (disabled) return;
    if (activeReasonsRef.current.has("click")) {
      activeReasonsRef.current.delete("click");
      hide("click");
    } else if (
      requestedVisibleRef.current &&
      activeReasonsRef.current.size === 0
    ) {
      closeAll();
    } else {
      show("click");
    }
  }, [closeAll, disabled, hide, show]);

  useEffect(() => {
    if (!isVisible || typeof document === "undefined") return undefined;

    const onPointerDown = (event: PointerEvent): void => {
      if (!isTopMost()) return;
      if (
        !activeReasonsRef.current.has("click") &&
        !activeReasonsRef.current.has("touch")
      )
        return;
      const target = event.target as Node | null;
      if (target && (anchorEl?.contains(target) || bubbleEl?.contains(target)))
        return;
      closeAll();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [anchorEl, bubbleEl, closeAll, isTopMost, isVisible]);

  useLayoutEffect(() => {
    if (!present || !anchorEl || !bubbleEl || typeof window === "undefined")
      return undefined;

    const update = (): void => {
      const nextPlacement = resolvePlacementFromGeometry(
        placement,
        anchorEl,
        bubbleEl,
        direction
      );
      setResolvedPlacement(nextPlacement);
      setArrowOffset(
        resolveArrowOffset(
          nextPlacement,
          anchorEl,
          bubbleEl,
          direction ?? "ltr"
        )
      );
    };
    const frame = window.requestAnimationFrame(update);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(anchorEl);
    observer?.observe(bubbleEl);
    const visualViewport = window.visualViewport;
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    visualViewport?.addEventListener("resize", update);
    visualViewport?.addEventListener("scroll", update);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      visualViewport?.removeEventListener("resize", update);
      visualViewport?.removeEventListener("scroll", update);
    };
  }, [
    anchorEl,
    bubbleEl,
    placement,
    positionStyle.left,
    positionStyle.top,
    present,
    direction,
  ]);

  // Wire up DOM event handlers based on the requested trigger modes.
  // Multiple triggers can be active simultaneously (e.g. ['hover', 'focus']).
  const eventHandlers: HTMLAttributes<HTMLDivElement> = {};

  if (triggers.has("hover")) {
    eventHandlers.onPointerEnter = (
      event: ReactPointerEvent<HTMLDivElement>
    ) => {
      if (event.pointerType !== "touch") show("hover");
    };
    eventHandlers.onPointerLeave = (
      event: ReactPointerEvent<HTMLDivElement>
    ) => {
      if (event.pointerType !== "touch") hide("hover");
    };

    // Hover has no touch equivalent. A deliberate long press exposes the same
    // description without stealing an ordinary tap from the wrapped control.
    // Click-enabled tooltips already have a direct coarse-pointer contract.
    if (touchBehavior === "long-press" && !triggers.has("click")) {
      eventHandlers.onPointerDown = (
        event: ReactPointerEvent<HTMLDivElement>
      ) => {
        if (event.pointerType !== "touch") return;
        pointerDownTypeRef.current = "touch";
        if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = setTimeout(() => {
          touchTimeoutRef.current = null;
          show("touch");
        }, touchLongPressDelay);
      };
      const cancelPendingTouch = () => {
        pointerDownTypeRef.current = null;
        if (!touchTimeoutRef.current) return;
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      };
      eventHandlers.onPointerUp = cancelPendingTouch;
      eventHandlers.onPointerCancel = () => {
        cancelPendingTouch();
        if (activeReasonsRef.current.has("touch")) closeAll();
      };
      eventHandlers.onContextMenu = (event) => {
        if (activeReasonsRef.current.has("touch")) event.preventDefault();
      };
    }
  }

  if (triggers.has("focus")) {
    eventHandlers.onFocus = () => {
      if (suppressNextFocusRef.current) {
        suppressNextFocusRef.current = false;
        return;
      }
      if (
        pointerDownTypeRef.current === "touch" ||
        (pointerDownTypeRef.current && triggers.has("click"))
      )
        return;
      show("focus");
    };
    eventHandlers.onBlur = (event) => {
      const nextTarget = event.relatedTarget as Node | null;
      if (
        nextTarget &&
        (anchorEl?.contains(nextTarget) || bubbleEl?.contains(nextTarget))
      )
        return;
      hide("focus");
    };
  }

  if (triggers.has("click")) {
    eventHandlers.onClick = toggle;
    eventHandlers.onPointerDown = (
      event: ReactPointerEvent<HTMLDivElement>
    ) => {
      pointerDownTypeRef.current = event.pointerType || "mouse";
    };
    const clearPointerActivation = () => {
      pointerDownTypeRef.current = null;
    };
    eventHandlers.onPointerUp = clearPointerActivation;
    eventHandlers.onPointerCancel = clearPointerActivation;
  }

  // Tooltip bubble geometry. Surface, radius, shadow and the open/closed
  // scale are keyed on data-tone/data-open in the skin; the positioning
  // keys come from the shared overlay runtime and spread last so they win.
  const bubbleStyle: TooltipInstanceStyle = {
    ...(strategy === "js" ? portalVariables : {}),
    ...(maxWidth === undefined
      ? {}
      : { "--ds-tooltip-instance-max-width": toCssDimension(maxWidth) }),
    "--ds-tooltip-instance-z-index": zIndex ?? layerZIndex,
    ...(arrowOffset === undefined
      ? {}
      : { "--ds-tooltip-arrow-anchor-offset": arrowOffset }),
    // The skin neutralizes UA [popover] border/overflow for the top-layer
    // branch, keyed on data-ds-position-strategy.
    ...positionStyle,
  };

  const describedTrigger = describeTrigger(
    children,
    tooltipId,
    Boolean(isVisible && !disabled && hasRenderableContent),
    interactive
  );

  const bubbleNode = (
    <div
      ref={setBubbleEl}
      {...layerProps}
      id={tooltipId}
      role={interactive ? "dialog" : "tooltip"}
      aria-labelledby={interactive ? `${tooltipId}-content` : undefined}
      aria-hidden={!isVisible}
      inert={!isVisible ? true : undefined}
      tabIndex={interactive ? -1 : undefined}
      dir={direction}
      lang={language}
      className="rottay-tooltip-bubble rottay-tooltip-bubble--modern"
      data-part="bubble"
      {...(strategy === "js" ? portalScope : {})}
      data-tone={color}
      data-recipe={recipe}
      data-density={density ?? portalScope["data-density"]}
      data-placement={resolvedPlacement}
      data-preferred-placement={placement}
      data-collision-adjusted={
        resolvedPlacement !== placement ? "true" : undefined
      }
      data-radius={radius}
      data-interactive={interactive}
      data-has-shortcut={Boolean(shortcut)}
      data-has-arrow={Boolean(arrow)}
      data-arrow-tracked={arrowOffset ? "true" : "false"}
      data-touch-behavior={touchBehavior}
      data-open={isVisible ? "true" : "false"}
      data-layer-kind="tooltip"
      data-ds-position-strategy={strategy}
      style={bubbleStyle}
      onPointerEnter={interactive ? () => show("content") : undefined}
      onPointerLeave={interactive ? () => hide("content") : undefined}
      onFocus={interactive ? () => show("focus") : undefined}
      onBlur={
        interactive
          ? (event) => {
              const nextTarget = event.relatedTarget as Node | null;
              if (nextTarget && anchorEl?.contains(nextTarget)) return;
              hide("focus");
            }
          : undefined
      }
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && !isVisible)
          setPresent(false);
      }}
    >
      {shortcut ? (
        <div data-part="shortcut-row">
          <div id={`${tooltipId}-content`} data-part="content">
            {content}
          </div>
          <span data-part="shortcut-chips">
            {formatShortcutKey(shortcut).map((segment, i) => (
              <kbd key={i} data-part="shortcut-key">
                {segment}
              </kbd>
            ))}
          </span>
        </div>
      ) : (
        <div id={`${tooltipId}-content`} data-part="content">
          {content}
        </div>
      )}
      {arrow && <span data-part="arrow" aria-hidden="true" />}
    </div>
  );

  return (
    <div
      ref={setWrapperRef}
      className={`rottay-tooltip-root rottay-tooltip-root--modern${
        className ? ` ${className}` : ""
      }`}
      data-part="root"
      data-disabled={disabled ? "true" : "false"}
      data-state={isVisible ? "open" : "closed"}
      data-trigger={Array.from(triggers).join(" ")}
      data-density={density}
      style={style}
      {...anchorAttrs}
      {...eventHandlers}
    >
      {describedTrigger}
      {!disabled &&
      hasRenderableContent &&
      present &&
      mounted ? (
        strategy === "anchor-css" ? (
          bubbleNode
        ) : (
          <Portal>
            <OverlayPortalBoundary>{bubbleNode}</OverlayPortalBoundary>
          </Portal>
        )
      ) : null}
    </div>
  );
});

ModernTooltip.displayName = "ModernTooltip";

export default ModernTooltip;
