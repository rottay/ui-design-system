'use client';

/**
 * @fileoverview Popover Hermes Engine - Rottay Design System
 * @description Hermes (DaisyUI/Tailwind) implementation of the Popover component.
 * Uses Tailwind CSS utilities with DaisyUI styling conventions.
 *
 * @remarks
 * The Hermes engine provides:
 * - No DaisyUI class of any kind: the panel's chrome comes from this engine's own
 *   skin, keyed on `rottay-popover--modern`. In particular it never renders
 *   `tooltip`/`card`, so nothing in theme.css or personality.css matches it.
 * - Tailwind utility classes for layout and styling
 * - Custom trigger handling for click, hover, and focus
 * - Click-outside dismissal via event listeners
 * - Delay support for hover triggers
 *
 * Implementation details:
 * - Uses controlled/uncontrolled pattern for open state
 * - Placement mapped to inline position styles (only 4 of the 12 typed placements
 *   are actually distinct here; the rest collapse onto their nearest neighbour)
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
        Object.assign(base, { right: '100%', marginRight: 8, top: '50%' });
      } else if (placement?.includes('right') || placement?.includes('Right')) {
        Object.assign(base, { left: '100%', marginLeft: 8, top: '50%' });
      } else {
        // default: top
        Object.assign(base, { bottom: '100%', marginBottom: 8 });
      }
      // Horizontal centering for top/bottom placements. The paired centering
      // transform is keyed on `data-placement` in the skin: this engine resolves
      // to translateY(-50%) for exactly `left`/`right` and translateX(-50%) for
      // every other value (only 4 of the 12 typed placements are distinct here).
      if (placement?.includes('top') || placement?.includes('bottom') || !placement) {
        base.left = '50%';
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
        data-part="trigger"
        data-open={isOpen ? 'true' : 'false'}
        className={`rottay-popover--modern ${className || ''}`}
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
            data-part="surface"
            data-open="true"
            data-placement={placement}
            className={overlayClassName || ''}
            style={{
              ...getContentPositionStyles(),
              padding: 12,
              minWidth: 150,
              ...overlayStyle,
            }}
          >
            {title && (
              <div data-part="title" style={{ fontWeight: 600, marginBottom: 8, paddingBottom: 8 }}>
                {title}
              </div>
            )}
            <div>{content}</div>
            {arrow && (
              <div data-part="arrow" style={{ position: 'absolute', width: 12, height: 12, zIndex: -1 }} />
            )}
          </div>
        )}
      </div>
    );
  }
);

Popover.displayName = 'Popover.Hermes';

export default Popover;
