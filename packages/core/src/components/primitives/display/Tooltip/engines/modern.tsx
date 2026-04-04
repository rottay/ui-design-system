/**
 * @fileoverview Tooltip Modern Engine - Rottay Design System
 * @description Custom DS token inline-styled tooltip with full trigger support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine renders a custom tooltip bubble via absolutely-positioned divs
 * with DS token inline styles. No DaisyUI classes are used.
 *
 * **Enhancements:**
 * - Multi-trigger support: hover, focus, click, manual
 * - Show/hide delay with setTimeout for smooth UX
 * - Controlled visibility via `visible` prop
 * - Scale entrance animation (0.95 -> 1 with opacity)
 * - `onVisibleChange` callback for external state sync
 *
 * **Implementation Details:**
 * - Wrapper uses `position: relative; display: inline-flex`
 * - Tooltip bubble is absolutely positioned with DS token colors
 * - Placement uses top/bottom/left/right with translate transforms
 * - Color variants map to DS token CSS variables
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

import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import type { TooltipProps } from '../Tooltip.types';
import { TOOLTIP_DEFAULTS } from '../Tooltip.types';

/**
 * Maps color variants to DS token background/color pairs.
 */
const COLOR_STYLE_MAP: Record<string, React.CSSProperties> = {
  default: { background: 'var(--ds-surface-card)', color: 'var(--ds-color-text-primary)' },
  primary: { background: 'var(--ds-color-primary)', color: 'var(--ds-color-text-on-primary)' },
  secondary: { background: 'var(--ds-color-secondary)', color: 'var(--ds-color-text-on-primary)' },
  success: { background: 'var(--ds-color-success)', color: 'var(--ds-color-text-on-primary)' },
  warning: { background: 'var(--ds-color-warning)', color: 'var(--ds-color-text-on-primary)' },
  error: { background: 'var(--ds-color-error)', color: 'var(--ds-color-text-on-primary)' },
};

/**
 * Maps placement to positioning styles for the tooltip bubble.
 */
const PLACEMENT_STYLES: Record<string, React.CSSProperties> = {
  'top':          { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6 },
  'top-start':    { bottom: '100%', left: 0, marginBottom: 6 },
  'top-end':      { bottom: '100%', right: 0, marginBottom: 6 },
  'bottom':       { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6 },
  'bottom-start': { top: '100%', left: 0, marginTop: 6 },
  'bottom-end':   { top: '100%', right: 0, marginTop: 6 },
  'left':         { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 6 },
  'left-start':   { right: '100%', top: 0, marginRight: 6 },
  'left-end':     { right: '100%', bottom: 0, marginRight: 6 },
  'right':        { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 6 },
  'right-start':  { left: '100%', top: 0, marginLeft: 6 },
  'right-end':    { left: '100%', bottom: 0, marginLeft: 6 },
};

/**
 * Normalize trigger prop to an array of trigger types.
 */
function normalizeTriggers(trigger?: string | string[]): string[] {
  if (!trigger) return ['hover'];
  if (Array.isArray(trigger)) return trigger;
  return [trigger];
}

/**
 * Modern (DS token inline-styled) implementation of the Tooltip component.
 *
 * Features:
 * - Multi-trigger support (hover, focus, click, manual)
 * - Show/hide delay with setTimeout
 * - Controlled visibility via `visible` prop
 * - Scale entrance animation
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
      className = '',
      style,
    } = props;

    const triggers = normalizeTriggers(trigger);
    // Detect controlled mode: when the consumer supplies `visible`, we defer
    // to their state and only notify via onVisibleChange instead of self-managing.
    const isControlled = visible !== undefined;

    // Internal state only used in uncontrolled mode
    const [internalVisible, setInternalVisible] = useState(false);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Single source of truth: controlled prop wins over internal state
    const isVisible = isControlled ? visible : internalVisible;

    // Prevent stale timeouts from firing after the component unmounts
    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, []);

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

    // Tooltip bubble styles: DS tokens for colors, shadow, radius
    const bubbleStyle: React.CSSProperties = {
      position: 'absolute',
      ...(PLACEMENT_STYLES[placement] || PLACEMENT_STYLES.top),
      ...(COLOR_STYLE_MAP[color] || COLOR_STYLE_MAP.default),
      borderRadius: 'var(--ds-radius-md)',
      boxShadow: 'var(--ds-elevation-2)',
      padding: '6px 10px',
      fontSize: 12,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: 50,
      opacity: isVisible ? 1 : 0,
      transform: `${(PLACEMENT_STYLES[placement] || PLACEMENT_STYLES.top).transform || ''} scale(${isVisible ? 1 : 0.95})`.trim(),
      transition: 'opacity 0.15s ease, transform 0.15s ease',
    };

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={className || undefined}
        style={wrapperStyle}
        {...eventHandlers}
      >
        {children}
        {!disabled && content && (
          <div role="tooltip" style={bubbleStyle} aria-hidden={!isVisible}>
            {content}
          </div>
        )}
      </div>
    );
  }
);

ModernTooltip.displayName = 'ModernTooltip';

export default ModernTooltip;
