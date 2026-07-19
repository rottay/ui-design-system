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

'use client';

import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import type { TooltipProps } from '../../contracts';
import { TOOLTIP_DEFAULTS } from '../../contracts';
import { formatShortcutKey } from '../../../../../../infrastructure/runtime/application/interaction/shortcuts';
import { Portal } from '../../../../runtime/overlay/portal';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from '../../../../runtime/overlay/positioning';

/**
 * Layout styles for the optional `shortcut` prop. The chips' own surface is
 * built on `currentColor` in the skin, so it adapts to whichever `color` variant
 * the bubble's `data-tone` selects without a second color map to keep in sync.
 */
const SHORTCUT_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};
const SHORTCUT_CHIPS_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  flexShrink: 0,
};
const SHORTCUT_KBD_STYLE: React.CSSProperties = {
  padding: '1px 5px',
  fontSize: '0.85em',
  fontFamily: 'var(--ds-font-family-mono, monospace)',
  lineHeight: 1.4,
};

/**
 * Normalize trigger prop to an array of trigger types.
 */
function normalizeTriggers(trigger?: string | string[]): string[] {
  if (!trigger) return ['hover'];
  if (Array.isArray(trigger)) return trigger;
  return [trigger];
}

function resolveMaxWidth(maxWidth: TooltipProps['maxWidth']): string | number {
  return maxWidth ?? 'var(--ds-tooltip-max-width, 300px)';
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
const ModernTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) => {
    const {
      content,
      children,
      color = TOOLTIP_DEFAULTS.color,
      placement = TOOLTIP_DEFAULTS.placement,
      disabled = TOOLTIP_DEFAULTS.disabled,
      visible,
      trigger,
      showDelay = TOOLTIP_DEFAULTS.showDelay,
      hideDelay = TOOLTIP_DEFAULTS.hideDelay,
      onVisibleChange,
      maxWidth = TOOLTIP_DEFAULTS.maxWidth,
      offset = TOOLTIP_DEFAULTS.offset,
      zIndex,
      className = '',
      style,
      shortcut,
    } = props;

    const triggers = normalizeTriggers(trigger);
    // Detect controlled mode: when the consumer supplies `visible`, we defer
    // to their state and only notify via onVisibleChange instead of self-managing.
    const isControlled = visible !== undefined;

    // Internal state only used in uncontrolled mode
    const [internalVisible, setInternalVisible] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [bubbleEl, setBubbleEl] = useState<HTMLDivElement | null>(null);
    // Both render paths attach on the client after mount (the portal needs a
    // container; the inline top-layer bubble must not join server markup, or
    // hydration would mismatch for initially-visible tooltips).
    const [mounted, setMounted] = useState(false);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Single source of truth: controlled prop wins over internal state
    const isVisible = isControlled ? visible : internalVisible;

    useEffect(() => {
      setMounted(true);
    }, []);

    // Prevent stale timeouts from firing after the component unmounts
    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, []);

    const setWrapperRef = useCallback((node: HTMLDivElement | null) => {
      setAnchorEl(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    // The wrapper is the anchor; the bubble is the positioned overlay. The
    // bubble only mounts while visible, so element presence drives the
    // positioning lifecycle.
    const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
      anchor: anchorEl,
      overlay: bubbleEl,
      placement,
      offset,
      flip: true,
    });

    const show = useCallback(() => {
      if (disabled) return;
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (showDelay > 0) {
        showTimeoutRef.current = setTimeout(() => {
          if (!isControlled) setInternalVisible(true);
          onVisibleChange?.(true);
        }, showDelay);
      } else {
        if (!isControlled) setInternalVisible(true);
        onVisibleChange?.(true);
      }
    }, [disabled, showDelay, isControlled, onVisibleChange]);

    const hide = useCallback(() => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (hideDelay > 0) {
        hideTimeoutRef.current = setTimeout(() => {
          if (!isControlled) setInternalVisible(false);
          onVisibleChange?.(false);
        }, hideDelay);
      } else {
        if (!isControlled) setInternalVisible(false);
        onVisibleChange?.(false);
      }
    }, [hideDelay, isControlled, onVisibleChange]);

    const toggle = useCallback(() => {
      if (isVisible) {
        hide();
      } else {
        show();
      }
    }, [isVisible, show, hide]);

    // Wire up DOM event handlers based on the requested trigger modes.
    // Multiple triggers can be active simultaneously (e.g. ['hover', 'focus']).
    const eventHandlers: Record<string, any> = {};

    if (triggers.includes('hover')) {
      eventHandlers.onMouseEnter = show;
      eventHandlers.onMouseLeave = hide;
    }

    if (triggers.includes('focus')) {
      eventHandlers.onFocus = show;
      eventHandlers.onBlur = hide;
    }

    if (triggers.includes('click')) {
      eventHandlers.onClick = toggle;
    }

    // Tooltip bubble geometry. Surface, radius, shadow and the open/closed
    // scale are keyed on data-tone/data-open in the skin; the positioning
    // keys come from the shared overlay runtime and spread last so they win.
    const bubbleStyle: React.CSSProperties = {
      padding: '6px 10px',
      fontSize: 12,
      width: 'max-content',
      maxWidth: resolveMaxWidth(maxWidth),
      maxInlineSize: resolveMaxWidth(maxWidth),
      boxSizing: 'border-box',
      whiteSpace: 'normal',
      overflowWrap: 'anywhere',
      wordBreak: 'normal',
      textAlign: 'left',
      lineHeight: 1.35,
      writingMode: 'horizontal-tb',
      textOrientation: 'mixed',
      pointerEvents: 'none',
      // Tokenized overlay stack (spec section 9): route through the canonical
      // scale. The top layer ignores z-index; this only orders the portal
      // branch.
      zIndex: zIndex ?? 'var(--ds-z-tooltip)',
      opacity: isVisible ? 1 : 0,
      transformOrigin: 'center',
      transition: 'opacity var(--ds-motion-fast) ease, transform var(--ds-motion-fast) ease',
      // The skin neutralizes UA [popover] border/overflow for the top-layer
      // branch, keyed on data-ds-position-strategy.
      ...positionStyle,
    };

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
      ...style,
    };

    const bubbleNode = (
      <div
        ref={setBubbleEl}
        role="tooltip"
        className="rottay-tooltip-bubble rottay-tooltip-bubble--modern"
        data-part="bubble"
        data-tone={color}
        data-placement={placement}
        data-open={isVisible ? 'true' : 'false'}
        data-ds-position-strategy={strategy}
        style={bubbleStyle}
        aria-hidden={!isVisible}
      >
        {shortcut ? (
          <span data-part="shortcut-row" style={SHORTCUT_ROW_STYLE}>
            <span>{content}</span>
            <span data-part="shortcut-chips" style={SHORTCUT_CHIPS_STYLE}>
              {formatShortcutKey(shortcut).map((segment, i) => (
                <kbd key={i} data-part="shortcut-key" style={SHORTCUT_KBD_STYLE}>
                  {segment}
                </kbd>
              ))}
            </span>
          </span>
        ) : (
          content
        )}
      </div>
    );

    return (
      <div
        ref={setWrapperRef}
        className={className || undefined}
        data-part="root"
        style={wrapperStyle}
        {...anchorAttrs}
        {...eventHandlers}
      >
        {children}
        {!disabled && content && isVisible && mounted
          ? strategy === 'anchor-css'
            ? bubbleNode
            : (
              <Portal>
                <OverlayPortalBoundary>{bubbleNode}</OverlayPortalBoundary>
              </Portal>
            )
          : null}
      </div>
    );
  }
);

ModernTooltip.displayName = 'ModernTooltip';

export default ModernTooltip;
