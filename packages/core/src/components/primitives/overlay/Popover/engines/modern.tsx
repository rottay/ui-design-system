'use client';

/**
 * @fileoverview Popover Hermes Engine - Rottay Design System
 * @description Hermes (DaisyUI/Tailwind) implementation of the Popover component.
 * Uses Tailwind CSS utilities with DaisyUI styling conventions.
 *
 * @remarks
 * The Hermes engine provides:
 * - DaisyUI tooltip/card component base classes
 * - Tailwind utility classes for layout and styling
 * - Custom trigger handling for click, hover, and focus
 * - Click-outside dismissal via event listeners
 * - Delay support for hover triggers
 *
 * Implementation details:
 * - Uses controlled/uncontrolled pattern for open state
 * - Placement mapped to DaisyUI tooltip position classes
 * - Timeout refs for enter/leave delay management
 * - Arrow styling with rotated div element
 *
 * @example Using Hermes Engine
 * ```tsx
 * import { Popover, Button } from '@rottay/design-system';
 *
 * <Popover
 *   engine="modern"
 *   content="Tailwind styled content"
 *   title="Hermes Popover"
 *   trigger="hover"
 * >
 *   <Button>Hover me</Button>
 * </Popover>
 * ```
 *
 * @see {@link Popover} - The main engine-aware component
 * @module Popover/Engines/Hermes
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PopoverProps } from '../Popover.types';
import { POPOVER_DEFAULTS } from '../Popover.types';

/**
 * Modern engine implementation of Popover using DS token inline styles.
 *
 * Manages open state internally (controlled/uncontrolled pattern), with
 * debounced hover delays via timeout refs. Renders the popover content
 * inline (not portaled) using absolute positioning for placement.
 *
 * @param props - Popover configuration props
 * @param ref - Forwarded ref merged with the internal container ref
 * @returns DS token-styled popover with trigger handling
 */
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
      children,
      mouseEnterDelay = POPOVER_DEFAULTS.mouseEnterDelay,
      mouseLeaveDelay = POPOVER_DEFAULTS.mouseLeaveDelay,
      zIndex,
      className,
      overlayClassName,
      overlayStyle,
    } = props;

    // Controlled/uncontrolled pattern: external `open` prop takes precedence
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const containerRef = useRef<HTMLDivElement>(null);
    const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Clear pending hover timeouts on unmount to prevent state updates after disposal
    useEffect(() => {
      return () => {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      };
    }, []);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          handleOpenChange(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, handleOpenChange]);

    // Normalize trigger to array so multi-trigger combos (e.g. ['click', 'hover']) work uniformly
    const triggerArray = Array.isArray(trigger) ? trigger : [trigger];

    /** Maps the placement prop to CSS positioning styles for the content panel. */
    const getContentPositionStyles = (): React.CSSProperties => {
      // Tokenized overlay stack (spec section 9): an explicit numeric
      // override still wins; otherwise route through the popover tier
      // instead of a magic 50 (the zIndex prop / POPOVER_DEFAULTS.zIndex
      // were previously unused by this engine).
      const base: React.CSSProperties = { position: 'absolute', zIndex: zIndex ?? 'var(--ds-z-popover)' };
      if (placement?.includes('top')) {
        Object.assign(base, { bottom: '100%', marginBottom: 8 });
      } else if (placement?.includes('bottom')) {
        Object.assign(base, { top: '100%', marginTop: 8 });
      } else if (placement?.includes('left') || placement?.includes('Left')) {
        Object.assign(base, { right: '100%', marginRight: 8, top: '50%', transform: 'translateY(-50%)' });
      } else if (placement?.includes('right') || placement?.includes('Right')) {
        Object.assign(base, { left: '100%', marginLeft: 8, top: '50%', transform: 'translateY(-50%)' });
      } else {
        // default: top
        Object.assign(base, { bottom: '100%', marginBottom: 8 });
      }
      // Horizontal centering for top/bottom placements
      if (placement?.includes('top') || placement?.includes('bottom') || !placement) {
        base.left = '50%';
        base.transform = 'translateX(-50%)';
      }
      return base;
    };

    const handleClick = () => {
      if (triggerArray.includes('click')) {
        handleOpenChange(!isOpen);
      }
    };

    // Cancel any pending leave timeout before starting the enter delay, and vice versa,
    // to prevent flickering when the cursor rapidly enters/leaves the trigger area.
    const handleMouseEnter = () => {
      if (triggerArray.includes('hover')) {
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        enterTimeoutRef.current = setTimeout(() => {
          handleOpenChange(true);
        }, mouseEnterDelay);
      }
    };

    const handleMouseLeave = () => {
      if (triggerArray.includes('hover')) {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        leaveTimeoutRef.current = setTimeout(() => {
          handleOpenChange(false);
        }, mouseLeaveDelay);
      }
    };

    const handleFocus = () => {
      if (triggerArray.includes('focus')) {
        handleOpenChange(true);
      }
    };

    const handleBlur = () => {
      if (triggerArray.includes('focus')) {
        handleOpenChange(false);
      }
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={className || ''}
        style={{ position: 'relative', display: 'inline-flex' }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
        {/* Content panel rendered conditionally, absolutely positioned relative to the wrapper */}
        {isOpen && (
          <div
            className={overlayClassName || ''}
            style={{
              ...getContentPositionStyles(),
              borderRadius: 'var(--ds-radius-lg)',
              padding: 12,
              background: 'var(--ds-surface-card)',
              boxShadow: 'var(--ds-elevation-2)',
              minWidth: 150,
              ...overlayStyle,
            }}
          >
            {title && (
              <div style={{ fontWeight: 600, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--ds-color-border)' }}>
                {title}
              </div>
            )}
            <div>{content}</div>
            {arrow && (
              <div style={{ position: 'absolute', width: 12, height: 12, transform: 'rotate(45deg)', zIndex: -1, background: 'var(--ds-surface-card)' }} />
            )}
          </div>
        )}
      </div>
    );
  }
);

Popover.displayName = 'Popover.Hermes';

export default Popover;
