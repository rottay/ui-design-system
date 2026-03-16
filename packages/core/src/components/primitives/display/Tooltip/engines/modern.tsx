/**
 * @fileoverview Tooltip Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based tooltip with full trigger support.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI's tooltip component classes with Tailwind utilities
 * for lightweight tooltip rendering, now enhanced with:
 *
 * **Enhancements:**
 * - Multi-trigger support: hover, focus, click, manual
 * - Show/hide delay with setTimeout for smooth UX
 * - Controlled visibility via `visible` prop
 * - Scale entrance animation (0.95 -> 1 with opacity)
 * - `onVisibleChange` callback for external state sync
 *
 * **Implementation Details:**
 * - Uses DaisyUI `tooltip` class for styling base
 * - Uses `tooltip-{position}` for placement
 * - Uses `tooltip-{color}` for color variants
 * - JS-controlled visibility for trigger flexibility beyond CSS-only
 *
 * **Class Mappings:**
 * - `tooltip-top`, `tooltip-bottom`, `tooltip-left`, `tooltip-right`
 * - `tooltip-primary`, `tooltip-secondary`, `tooltip-success`, etc.
 *
 * @example Basic Usage
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip engine="modern" content="DaisyUI tooltip" color="primary">
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
 * @see {@link https://daisyui.com/components/tooltip/} DaisyUI Tooltip
 * @module Tooltip/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import type { TooltipProps } from '../Tooltip.types';
import { TOOLTIP_DEFAULTS } from '../Tooltip.types';

/**
 * Maps color variants to DaisyUI tooltip color classes.
 */
const COLOR_CLASS_MAP: Record<string, string> = {
  default: '',
  primary: 'tooltip-primary',
  secondary: 'tooltip-secondary',
  success: 'tooltip-success',
  warning: 'tooltip-warning',
  error: 'tooltip-error',
};

/**
 * Maps placement to DaisyUI tooltip position classes.
 */
const PLACEMENT_CLASS_MAP: Record<string, string> = {
  'top': 'tooltip-top',
  'top-start': 'tooltip-top',
  'top-end': 'tooltip-top',
  'bottom': 'tooltip-bottom',
  'bottom-start': 'tooltip-bottom',
  'bottom-end': 'tooltip-bottom',
  'left': 'tooltip-left',
  'left-start': 'tooltip-left',
  'left-end': 'tooltip-left',
  'right': 'tooltip-right',
  'right-start': 'tooltip-right',
  'right-end': 'tooltip-right',
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
 * Modern (DaisyUI/Tailwind) implementation of the Tooltip component.
 *
 * Features:
 * - Multi-trigger support (hover, focus, click, manual)
 * - Show/hide delay with setTimeout
 * - Controlled visibility via `visible` prop
 * - Scale entrance animation
 * - DaisyUI color variants
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

    // Assemble DaisyUI classes; tooltip-open forces visibility via CSS
    const tooltipClasses = [
      'tooltip',
      isVisible ? 'tooltip-open' : '',
      COLOR_CLASS_MAP[color] || '',
      PLACEMENT_CLASS_MAP[placement] || 'tooltip-top',
      disabled && 'opacity-50 cursor-not-allowed',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={tooltipClasses}
        data-tip={disabled ? undefined : content}
        style={{
          ...style,
          // DaisyUI renders the tooltip content via ::before (text) and ::after
          // (arrow) pseudo-elements. --tooltip-tail controls the arrow size.
          '--tooltip-tail': '6px',
        } as React.CSSProperties}
        {...eventHandlers}
      >
        {children}
      </div>
    );
  }
);

ModernTooltip.displayName = 'ModernTooltip';

export default ModernTooltip;
