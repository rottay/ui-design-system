/**
 * @fileoverview Tooltip Base Component - Rottay Design System
 * @description CSS variable-based tooltip with dynamic positioning.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The base Tooltip component uses CSS custom properties for theming and serves
 * as the foundation for engine-specific implementations.
 *
 * **Implementation Details:**
 * - Uses CSS variables for all visual properties
 * - Handles controlled and uncontrolled visibility
 * - Manages show/hide delays with timers
 * - Supports multiple trigger types simultaneously
 * - Provides arrow positioning based on placement
 * - Full ARIA accessibility implementation
 *
 * **CSS Custom Properties:**
 * - `--ds-tooltip-bg` - Background color (varies by color prop)
 * - `--ds-tooltip-color` - Text color
 * - `--ds-tooltip-radius` - Border radius (sm, md, lg)
 * - `--ds-tooltip-offset` - Distance from trigger element
 * - `--ds-tooltip-z-index` - Stack order
 * - `--ds-tooltip-padding` - Content padding
 * - `--ds-tooltip-font-size` - Text size
 * - `--ds-tooltip-shadow` - Box shadow
 * - `--ds-tooltip-arrow-size` - Arrow dimensions
 *
 * @example Direct Usage
 * ```tsx
 * import { BaseTooltip } from '@rottay/design-system';
 *
 * <BaseTooltip content="Helpful tip" placement="top">
 *   <Button>Hover me</Button>
 * </BaseTooltip>
 * ```
 *
 * @see {@link Tooltip} for the main component
 * @module Tooltip/base
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import type { TooltipProps } from '../types';
import { TOOLTIP_DEFAULTS, PLACEMENT_MAP } from '../types';

/**
 * Base Tooltip component using CSS variables.
 * This serves as the foundation for all engine-specific implementations.
 *
 * Features:
 * - Multiple placement positions (12 options)
 * - Multiple trigger types (hover, click, focus, manual)
 * - Controlled and uncontrolled visibility modes
 * - Configurable show/hide delays
 * - Arrow support with automatic positioning
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <BaseTooltip content="Helpful information" placement="top">
 *   <Button>Hover me</Button>
 * </BaseTooltip>
 * ```
 */
export const BaseTooltip = forwardRef<HTMLDivElement, TooltipProps>(
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
      radius = TOOLTIP_DEFAULTS.radius,
      offset = TOOLTIP_DEFAULTS.offset,
      zIndex = 1000,
      interactive = TOOLTIP_DEFAULTS.interactive,
      className = '',
      style = {},
      ...restProps
    } = props;

    // Internal visibility state for uncontrolled mode
    const [internalVisible, setInternalVisible] = useState(defaultVisible);

    // Determine if component is controlled or uncontrolled
    const isControlled = controlledVisible !== undefined;
    const isVisible = isControlled ? controlledVisible : internalVisible;

    // Refs for elements and timers
    const triggerRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const showTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

    // Parse trigger types into array
    const triggers = Array.isArray(trigger) ? trigger : [trigger];

    /**
     * Updates the visibility state and notifies parent via callback.
     * @param value - The new visibility state
     */
    const setVisible = useCallback(
      (value: boolean) => {
        if (!isControlled) {
          setInternalVisible(value);
        }
        onVisibleChange?.(value);
      },
      [isControlled, onVisibleChange]
    );

    /**
     * Handles showing the tooltip with optional delay.
     */
    const handleShow = useCallback(() => {
      if (disabled) return;

      // Clear any pending hide timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = undefined;
      }

      // Show with delay or immediately
      if (showDelay > 0) {
        showTimerRef.current = setTimeout(() => setVisible(true), showDelay);
      } else {
        setVisible(true);
      }
    }, [disabled, showDelay, setVisible]);

    /**
     * Handles hiding the tooltip with optional delay.
     */
    const handleHide = useCallback(() => {
      // Clear any pending show timer
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = undefined;
      }

      // Hide with delay or immediately
      if (hideDelay > 0) {
        hideTimerRef.current = setTimeout(() => setVisible(false), hideDelay);
      } else {
        setVisible(false);
      }
    }, [hideDelay, setVisible]);

    /**
     * Toggles the tooltip visibility (for click trigger).
     */
    const handleToggle = useCallback(() => {
      if (disabled) return;
      setVisible(!isVisible);
    }, [disabled, isVisible, setVisible]);

    // Cleanup timers on unmount
    useEffect(() => {
      return () => {
        if (showTimerRef.current) clearTimeout(showTimerRef.current);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      };
    }, []);

    // Build CSS variables for theming
    const tooltipVars: React.CSSProperties = {
      '--ds-tooltip-bg': `var(--ds-tooltip-${color}-bg, rgba(0, 0, 0, 0.9))`,
      '--ds-tooltip-color': `var(--ds-tooltip-${color}-color, white)`,
      '--ds-tooltip-radius': `var(--ds-tooltip-${radius}-radius, 0.375rem)`,
      '--ds-tooltip-offset': `${offset}px`,
      '--ds-tooltip-z-index': zIndex,
    } as React.CSSProperties;

    // Compute tooltip position styles
    const positionStyles = PLACEMENT_MAP[placement] || PLACEMENT_MAP.top;

    // Calculate margin offset based on placement
    const marginStyles: React.CSSProperties = {};
    if (placement.startsWith('top')) marginStyles.marginBottom = `${offset}px`;
    if (placement.startsWith('bottom')) marginStyles.marginTop = `${offset}px`;
    if (placement.startsWith('left')) marginStyles.marginRight = `${offset}px`;
    if (placement.startsWith('right')) marginStyles.marginLeft = `${offset}px`;

    // Combined tooltip styles
    const tooltipStyles: React.CSSProperties = {
      ...tooltipVars,
      position: 'absolute',
      zIndex: 'var(--ds-tooltip-z-index)' as any,
      padding: 'var(--ds-tooltip-padding, 0.5rem 0.75rem)',
      backgroundColor: 'var(--ds-tooltip-bg)',
      color: 'var(--ds-tooltip-color)',
      fontSize: 'var(--ds-tooltip-font-size, 0.875rem)',
      borderRadius: 'var(--ds-tooltip-radius)',
      maxWidth: 'var(--ds-tooltip-max-width, 300px)',
      boxShadow: 'var(--ds-tooltip-shadow, 0 4px 6px rgba(0, 0, 0, 0.1))',
      pointerEvents: interactive ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      transition: 'var(--ds-tooltip-transition, opacity 0.2s ease, visibility 0.2s ease)',
      ...positionStyles,
      ...marginStyles,
      ...style,
    };

    // Arrow styles based on placement
    const arrowStyles: React.CSSProperties = {
      position: 'absolute',
      width: 'var(--ds-tooltip-arrow-size, 8px)',
      height: 'var(--ds-tooltip-arrow-size, 8px)',
      backgroundColor: 'var(--ds-tooltip-bg)',
      transform: 'rotate(45deg)',
      ...(placement.startsWith('top') && { bottom: '-4px', left: '50%', marginLeft: '-4px' }),
      ...(placement.startsWith('bottom') && { top: '-4px', left: '50%', marginLeft: '-4px' }),
      ...(placement.startsWith('left') && { right: '-4px', top: '50%', marginTop: '-4px' }),
      ...(placement.startsWith('right') && { left: '-4px', top: '50%', marginTop: '-4px' }),
    };

    // Build trigger props based on trigger types
    const triggerProps: Record<string, any> = {};

    if (triggers.includes('hover')) {
      triggerProps.onMouseEnter = handleShow;
      triggerProps.onMouseLeave = handleHide;
    }

    if (triggers.includes('click')) {
      triggerProps.onClick = handleToggle;
    }

    if (triggers.includes('focus')) {
      triggerProps.onFocus = handleShow;
      triggerProps.onBlur = handleHide;
    }

    // Clone children with trigger props
    const triggerElement = React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<any>, {
          ref: triggerRef,
          ...triggerProps,
          'aria-describedby': isVisible ? 'tooltip-content' : undefined,
        })
      : children;

    return (
      <div
        ref={ref}
        className={`rottay-tooltip-wrapper ${className}`}
        style={{ position: 'relative', display: 'inline-block' }}
        {...restProps}
      >
        {triggerElement}
        <div
          ref={tooltipRef}
          id="tooltip-content"
          className="rottay-tooltip"
          style={tooltipStyles}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          {arrow && <div className="rottay-tooltip-arrow" style={arrowStyles} />}
        </div>
      </div>
    );
  }
);

BaseTooltip.displayName = 'BaseTooltip';
