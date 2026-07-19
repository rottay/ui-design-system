'use client';

/**
 * @fileoverview Modern engine for the Popover overlay component. Positions the
 * content panel via the shared overlay positioning runtime
 * (`runtime/overlay/positioning`): the panel renders in-tree, directly beside
 * the trigger, in BOTH branches -- top-layer promotion (anchor-css branch) is
 * DOM-position-agnostic, so it needs no portal escape hatch, and the measured
 * (js) branch keeps this engine's existing non-portaled posture (checkpoint
 * contract P4: Popover modern never portals; only the rustic engine portals).
 * It applies NO DaisyUI class of any kind: the panel's chrome comes from this
 * engine's own skin, keyed on `rottay-popover--modern`.
 *
 * @remarks
 * **Positioning:**
 * - `useOverlayPosition` resolves the strategy per instance: `anchor-css`
 *   promotes the panel to the top layer (popover + CSS anchor positioning) in
 *   place; `js` pins it at a measured fixed position. Cross-axis centering
 *   comes from the shared runtime, not a CSS transform.
 * - The trigger wrapper is the anchor; the panel stamps
 *   `data-ds-position-strategy` for e2e/debug observability.
 *
 * @example
 * ```tsx
 * import { Popover, Button } from '@rottay/design-system';
 *
 * <Popover
 *   engine="modern"
 *   content="Token styled content"
 *   title="Popover"
 *   trigger="hover"
 * >
 *   <Button>Hover me</Button>
 * </Popover>
 * ```
 *
 * @see {@link Popover} - The main engine-aware component
 * @module Popover/Engines/Modern
 * @category Overlay
 * @package @rottay/design-system
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PopoverProps } from '../../contracts';
import { POPOVER_DEFAULTS, POPOVER_TO_OVERLAY_PLACEMENT } from '../../contracts';
import { useOverlayPosition } from '../../../../runtime/overlay/positioning';

/**
 * Modern engine implementation of Popover using DS token inline styles.
 *
 * Manages open state internally (controlled/uncontrolled pattern), with
 * debounced hover delays via timeout refs. Renders the panel in-tree (never
 * portaled) and positions it via the shared overlay runtime.
 *
 * @param props - Popover configuration props
 * @param ref - Forwarded ref merged with the internal anchor ref
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

    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);
    // The panel renders only after mount: `overlayCapabilities` resolves
    // false/false server-side (no CSS/HTMLElement), so a capable client's
    // first hydration pass would otherwise disagree with the server output
    // for an initially-open Popover.
    const [mounted, setMounted] = useState(false);

    const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

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

    // Dismiss the popover when clicking anywhere outside the trigger. The panel
    // renders in-tree as a descendant of the anchor, so one containment check
    // covers both.
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (anchorEl && !anchorEl.contains(event.target as Node)) {
          handleOpenChange(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, anchorEl, handleOpenChange]);

    // Normalize trigger to array so multi-trigger combos (e.g. ['click', 'hover']) work uniformly
    const triggerArray = Array.isArray(trigger) ? trigger : [trigger];

    // The trigger wrapper is the anchor, the panel is the positioned overlay.
    // `overlay` is null while closed (the panel only mounts while open).
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

    // Positioning keys come from the shared overlay runtime and spread last so
    // they win over the panel's own geometry and any caller-supplied overlayStyle.
    const surfaceStyle: React.CSSProperties = {
      padding: 12,
      minWidth: 150,
      zIndex: zIndex ?? 'var(--ds-z-popover)',
      ...overlayStyle,
      ...positionStyle,
    };

    return (
      <div
        ref={(node) => {
          setAnchorEl(node);
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
        {...anchorAttrs}
      >
        {children}
        {/* Content panel rendered in-tree as a direct child of the trigger wrapper */}
        {isOpen && mounted && (
          <div
            ref={setSurfaceEl}
            data-part="surface"
            data-open="true"
            data-placement={placement}
            data-ds-position-strategy={strategy}
            className={overlayClassName || undefined}
            style={surfaceStyle}
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
