/**
 * @fileoverview Tooltip Rustic Engine - Rottay Design System
 * @description Pure HTML/CSS tooltip implementation with zero dependencies.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine provides a lightweight, dependency-free tooltip using only
 * CSS variables and semantic HTML elements.
 *
 * **Implementation Details:**
 * - Self-contained implementation using CSS variables
 * - Portal-free rendering for simplicity
 * - Full keyboard and screen reader support
 * - All styling via var(--ds-tooltip-*) tokens
 *
 * **CSS Custom Properties:**
 * - `--ds-tooltip-bg` - Background color
 * - `--ds-tooltip-color` - Text color
 * - `--ds-tooltip-radius` - Border radius
 * - `--ds-tooltip-padding` - Content padding
 * - `--ds-tooltip-shadow` - Box shadow
 * - `--ds-tooltip-arrow-size` - Arrow dimensions
 *
 * @example Basic Usage
 * ```tsx
 * import { Tooltip } from '@rottay/design-system';
 *
 * <Tooltip engine="rustic" content="Lightweight tooltip" placement="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @module Tooltip/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import type { TooltipProps } from '../Tooltip.types';
import { TOOLTIP_DEFAULTS, PLACEMENT_MAP } from '../Tooltip.types';

/**
 * Rustic (Vanilla HTML/CSS) implementation of the Tooltip component.
 *
 * Features:
 * - Zero external dependencies
 * - Maximum accessibility compliance
 * - Full CSS variable customization
 * - Semantic HTML structure
 * - ARIA attributes for screen readers
 */
const RusticTooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) => {
    const {
      content,
      children,
      placement = TOOLTIP_DEFAULTS.placement,
      trigger = TOOLTIP_DEFAULTS.trigger,
      arrow = TOOLTIP_DEFAULTS.arrow,
      showDelay = TOOLTIP_DEFAULTS.showDelay,
      hideDelay = TOOLTIP_DEFAULTS.hideDelay,
      visible: controlledVisible,
      defaultVisible = false,
      onVisibleChange,
      disabled = TOOLTIP_DEFAULTS.disabled,
      color = TOOLTIP_DEFAULTS.color,
      maxWidth = TOOLTIP_DEFAULTS.maxWidth,
      zIndex,
      className = '',
      style,
    } = props;

    const [isVisible, setIsVisible] = useState(defaultVisible);
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

    // Controlled mode: external prop overrides internal state.
    // Uncontrolled mode: internal state drives visibility.
    const visible = controlledVisible !== undefined ? controlledVisible : isVisible;
    const triggers = Array.isArray(trigger) ? trigger : [trigger];

    const clearTimeouts = useCallback(() => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    }, []);

    const show = useCallback(() => {
      if (disabled) return;
      clearTimeouts();
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        onVisibleChange?.(true);
      }, showDelay);
    }, [disabled, showDelay, onVisibleChange, clearTimeouts]);

    const hide = useCallback(() => {
      clearTimeouts();
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        onVisibleChange?.(false);
      }, hideDelay);
    }, [hideDelay, onVisibleChange, clearTimeouts]);

    useEffect(() => {
      return () => clearTimeouts();
    }, [clearTimeouts]);

    // Build event handlers based on triggers
    const eventHandlers: Record<string, () => void> = {};
    if (triggers.includes('hover')) {
      eventHandlers.onMouseEnter = show;
      eventHandlers.onMouseLeave = hide;
    }
    if (triggers.includes('focus')) {
      eventHandlers.onFocus = show;
      eventHandlers.onBlur = hide;
    }
    if (triggers.includes('click')) {
      eventHandlers.onClick = () => (visible ? hide() : show());
    }

    // inline-flex keeps the wrapper tight around the trigger element
    // so the tooltip positions relative to the actual child bounds.
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
    };

    // PLACEMENT_MAP provides the absolute positioning offsets (top/left/transform)
    // for each placement value, defined in the shared Tooltip.types module.
    const placementStyle = PLACEMENT_MAP[placement] || PLACEMENT_MAP.top;

    // All visual properties reference CSS custom properties (--ds-tooltip-*)
    // so theming is fully configurable without touching component code.
    const tooltipStyle: React.CSSProperties = {
      position: 'absolute',
      ...placementStyle,
      marginTop: placement.startsWith('bottom') ? 'var(--ds-tooltip-offset, 6px)' : undefined,
      marginBottom: placement.startsWith('top') ? 'var(--ds-tooltip-offset, 6px)' : undefined,
      marginLeft: placement.startsWith('right') ? 'var(--ds-tooltip-offset, 6px)' : undefined,
      marginRight: placement.startsWith('left') ? 'var(--ds-tooltip-offset, 6px)' : undefined,
      backgroundColor: `var(--ds-tooltip-${color}-bg, var(--ds-tooltip-bg))`,
      color: `var(--ds-tooltip-${color}-color, var(--ds-tooltip-color))`,
      padding: 'var(--ds-tooltip-padding, 0.5rem 0.75rem)',
      borderRadius: 'var(--ds-tooltip-radius, 6px)',
      fontSize: 'var(--ds-tooltip-font-size, 0.8125rem)',
      boxShadow: 'var(--ds-tooltip-shadow)',
      maxWidth: maxWidth || 'var(--ds-tooltip-max-width, 300px)',
      zIndex: zIndex || 'var(--ds-tooltip-z-index, 1070)',
      whiteSpace: 'nowrap',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      transform: visible ? 'scale(1)' : 'scale(0.95)',
      transition: 'opacity 0.15s ease-out, visibility 0.15s ease-out, transform 0.15s ease-out',
      pointerEvents: visible ? 'auto' : 'none',
      ...style,
    };

    // Arrow is a rotated square positioned at the edge of the tooltip bubble.
    // Each placement direction offsets the arrow to the appropriate side.
    const arrowStyle: React.CSSProperties = arrow ? {
      position: 'absolute',
      width: 'var(--ds-tooltip-arrow-size, 6px)',
      height: 'var(--ds-tooltip-arrow-size, 6px)',
      backgroundColor: `var(--ds-tooltip-${color}-bg, var(--ds-tooltip-bg))`,
      transform: 'rotate(45deg)',
      ...(placement.startsWith('top') && { bottom: '-3px', left: '50%', marginLeft: '-3px' }),
      ...(placement.startsWith('bottom') && { top: '-3px', left: '50%', marginLeft: '-3px' }),
      ...(placement.startsWith('left') && { right: '-3px', top: '50%', marginTop: '-3px' }),
      ...(placement.startsWith('right') && { left: '-3px', top: '50%', marginTop: '-3px' }),
    } : {};

    return (
      <div
        ref={ref}
        className={`rottay-tooltip rottay-tooltip--rustic ${className}`}
        style={containerStyle}
        {...eventHandlers}
      >
        {children}
        {content && (
          <div
            id={tooltipId.current}
            role="tooltip"
            style={tooltipStyle}
            aria-hidden={!visible}
          >
            {content}
            {arrow && <div style={arrowStyle} />}
          </div>
        )}
      </div>
    );
  }
);

RusticTooltip.displayName = 'RusticTooltip';

export default RusticTooltip;
