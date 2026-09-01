'use client';

/**
 * @fileoverview Rustic (pure HTML/CSS) engine for the Popover overlay component.
 * Portals the content panel through the shared portal root and positions it via
 * the shared overlay positioning runtime (`runtime/overlay/positioning`): this
 * engine's existing portal posture (checkpoint contract P4: Popover rustic
 * always portals) is preserved in BOTH branches -- top-layer promotion
 * (anchor-css branch) is DOM-position-agnostic, so portaling ahead of it costs
 * nothing.
 *
 * @remarks
 * The rustic engine provides:
 * - Pure inline CSS with no external framework dependencies
 * - Portal rendering through the shared `#rottay-portal-root`, escaping
 *   ancestor `overflow: hidden`/`transform` clipping
 * - Full 12-position placement support, mapped onto the shared engine's
 *   side-align vocabulary; position (including cross-axis centering) is runtime
 *   data from `useOverlayPosition`, not paint
 * - Custom trigger handling for click, hover, and focus
 * - Click-outside dismissal across the trigger and the portaled panel
 *
 * @example Using Rustic Engine
 * ```tsx
 * import { Popover, Button } from '@rottay/design-system';
 *
 * <Popover
 *   engine="rustic"
 *   content="Pure CSS styled content"
 *   title="Popover"
 *   placement="right"
 *   zIndex={2000}
 * >
 *   <Button>Trigger</Button>
 * </Popover>
 * ```
 *
 * @see {@link Popover} - The main engine-aware component
 * @module Popover/Engines/Rustic
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PopoverProps } from '../../contracts';
import { POPOVER_DEFAULTS, POPOVER_TO_OVERLAY_PLACEMENT } from '../../contracts';
import { Portal } from '../../../../runtime/overlay/portal';
import {
  OverlayPortalBoundary,
  useOverlayPosition,
} from '../../../../runtime/overlay/positioning';

/**
 * Rustic engine implementation of Popover using pure inline CSS.
 *
 * Renders the popover panel through the shared portal root for z-index
 * stacking that escapes overflow:hidden ancestors, positioned by the shared
 * overlay runtime.
 *
 * @param props - Popover configuration props
 * @param ref - Forwarded ref merged with the internal anchor ref
 * @returns Trigger element plus a portal-rendered, positioned popover overlay
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
      className,
      style,
      overlayClassName,
      overlayStyle,
      zIndex = POPOVER_DEFAULTS.zIndex,
    } = props;

    // Controlled/uncontrolled pattern: external `open` prop takes precedence
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);
    const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleOpenChange = useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

    // Cleanup timeouts
    useEffect(() => {
      return () => {
        if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      };
    }, []);

    // Dismiss on click outside both the trigger AND the portaled panel, since the
    // panel is portaled out of the trigger's subtree.
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          anchorEl &&
          !anchorEl.contains(target) &&
          (!surfaceEl || !surfaceEl.contains(target))
        ) {
          handleOpenChange(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, anchorEl, surfaceEl, handleOpenChange]);

    const triggerArray = Array.isArray(trigger) ? trigger : [trigger];

    // The trigger is the anchor; the portaled panel is the positioned overlay.
    // The panel only mounts while open, so element presence drives the
    // positioning lifecycle.
    const { strategy, style: positionStyle, anchorAttrs } = useOverlayPosition({
      anchor: anchorEl,
      overlay: surfaceEl,
      placement: POPOVER_TO_OVERLAY_PLACEMENT[placement ?? 'top'],
      flip: true,
    });

    const handleClick = () => {
      if (triggerArray.includes('click')) {
        handleOpenChange(!isOpen);
      }
    };

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

    // Portal the panel through the shared portal root so it escapes
    // overflow:hidden ancestors and participates in global z-index stacking.
    const popoverContent = isOpen ? (
      <Portal>
        <OverlayPortalBoundary>
          <div
            ref={setSurfaceEl}
            role="tooltip"
            data-part="surface"
            data-open="true"
            data-placement={placement}
            data-ds-position-strategy={strategy}
            className={`rottay-popover--rustic ${overlayClassName || ''}`}
            style={{
              zIndex,
              padding: 'var(--ds-popover-padding, 12px 16px)',
              minWidth: 'var(--ds-popover-min-width, 150px)',
              maxWidth: 'var(--ds-popover-max-width, 350px)',
              ...overlayStyle,
              // Positioning keys come from the shared overlay runtime and
              // spread last so they win over a caller's overlayStyle.
              ...positionStyle,
            }}
            /* Re-bind hover handlers on the panel itself so moving the cursor
               from trigger to content does not trigger a premature close. */
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {title && (
              <div
                data-part="title"
                style={{
                  fontWeight: 600,
                  marginBottom: '8px',
                  paddingBottom: '8px',
                }}
              >
                {title}
              </div>
            )}
            <div>{content}</div>
            {arrow && (
              <div
                data-part="arrow"
                style={{
                  position: 'absolute',
                  width: 'var(--ds-popover-arrow-size, 10px)',
                  height: 'var(--ds-popover-arrow-size, 10px)',
                }}
              />
            )}
          </div>
        </OverlayPortalBoundary>
      </Portal>
    ) : null;

    return (
      <>
        <div
          ref={(node) => {
            setAnchorEl(node);
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          data-part="trigger"
          data-open={isOpen ? 'true' : 'false'}
          className={className}
          style={{ display: 'inline-block', ...style }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...anchorAttrs}
        >
          {children}
        </div>
        {popoverContent}
      </>
    );
  }
);

Popover.displayName = 'Popover.Apollo';

export default Popover;
