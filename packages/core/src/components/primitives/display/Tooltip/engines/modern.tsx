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

import React, { forwardRef, useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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

const TOOLTIP_OFFSET = 8;
const VIEWPORT_MARGIN = 8;
const FALLBACK_TOOLTIP_WIDTH = 240;
const FALLBACK_TOOLTIP_HEIGHT = 40;

interface PortalPosition {
  top: number;
  left: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function getPortalPosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect | undefined,
  placement: NonNullable<TooltipProps['placement']>,
): PortalPosition {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const width = tooltipRect?.width || FALLBACK_TOOLTIP_WIDTH;
  const height = tooltipRect?.height || FALLBACK_TOOLTIP_HEIGHT;
  const [side, align = 'center'] = placement.split('-') as [string, string?];

  let top = triggerRect.bottom + TOOLTIP_OFFSET;
  let left = triggerRect.left + triggerRect.width / 2 - width / 2;

  if (side === 'top' || side === 'bottom') {
    top = side === 'top'
      ? triggerRect.top - TOOLTIP_OFFSET - height
      : triggerRect.bottom + TOOLTIP_OFFSET;

    if (align === 'start') {
      left = triggerRect.left;
    } else if (align === 'end') {
      left = triggerRect.right - width;
    }

    if (side === 'top' && top < VIEWPORT_MARGIN) {
      top = triggerRect.bottom + TOOLTIP_OFFSET;
    } else if (side === 'bottom' && top + height > viewportHeight - VIEWPORT_MARGIN) {
      top = triggerRect.top - TOOLTIP_OFFSET - height;
    }
  } else {
    left = side === 'left'
      ? triggerRect.left - TOOLTIP_OFFSET - width
      : triggerRect.right + TOOLTIP_OFFSET;
    top = triggerRect.top + triggerRect.height / 2 - height / 2;

    if (align === 'start') {
      top = triggerRect.top;
    } else if (align === 'end') {
      top = triggerRect.bottom - height;
    }

    if (side === 'left' && left < VIEWPORT_MARGIN) {
      left = triggerRect.right + TOOLTIP_OFFSET;
    } else if (side === 'right' && left + width > viewportWidth - VIEWPORT_MARGIN) {
      left = triggerRect.left - TOOLTIP_OFFSET - width;
    }
  }

  return {
    left: clamp(left, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN)),
    top: clamp(top, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, viewportHeight - height - VIEWPORT_MARGIN)),
  };
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
      maxWidth = TOOLTIP_DEFAULTS.maxWidth,
      zIndex,
      className = '',
      style,
    } = props;

    const triggers = normalizeTriggers(trigger);
    // Detect controlled mode: when the consumer supplies `visible`, we defer
    // to their state and only notify via onVisibleChange instead of self-managing.
    const isControlled = visible !== undefined;

    // Internal state only used in uncontrolled mode
    const [internalVisible, setInternalVisible] = useState(false);
    const [portalPosition, setPortalPosition] = useState<PortalPosition | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
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

    const setWrapperRef = useCallback((node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const updatePortalPosition = useCallback(() => {
      if (!wrapperRef.current) return;
      const triggerRect = wrapperRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      setPortalPosition(getPortalPosition(triggerRect, tooltipRect, placement));
    }, [placement]);

    useLayoutEffect(() => {
      if (!isVisible || disabled || typeof document === 'undefined') {
        setPortalPosition(null);
        return undefined;
      }

      updatePortalPosition();
      const frame = window.requestAnimationFrame(updatePortalPosition);
      window.addEventListener('resize', updatePortalPosition);
      window.addEventListener('scroll', updatePortalPosition, true);

      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener('resize', updatePortalPosition);
        window.removeEventListener('scroll', updatePortalPosition, true);
      };
    }, [disabled, isVisible, updatePortalPosition, content, maxWidth]);

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
      position: 'fixed',
      top: portalPosition?.top ?? 0,
      left: portalPosition?.left ?? 0,
      ...(COLOR_STYLE_MAP[color] || COLOR_STYLE_MAP.default),
      borderRadius: 'var(--ds-radius-md)',
      boxShadow: 'var(--ds-elevation-2)',
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
      zIndex: zIndex ?? 'var(--ds-z-index-tooltip, var(--ds-tooltip-z-index, 1070))',
      opacity: isVisible ? 1 : 0,
      visibility: portalPosition ? 'visible' : 'hidden',
      transform: `scale(${isVisible ? 1 : 0.95})`,
      transformOrigin: 'center',
      transition: 'opacity var(--ds-motion-fast) ease, transform var(--ds-motion-fast) ease',
    };

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
      ...style,
    };

    return (
      <div
        ref={setWrapperRef}
        className={className || undefined}
        style={wrapperStyle}
        {...eventHandlers}
      >
        {children}
        {!disabled && content && isVisible && typeof document !== 'undefined'
          ? createPortal(
              <div ref={tooltipRef} role="tooltip" style={bubbleStyle} aria-hidden={!isVisible}>
                {content}
              </div>,
              document.body,
            )
          : null}
      </div>
    );
  }
);

ModernTooltip.displayName = 'ModernTooltip';

export default ModernTooltip;
