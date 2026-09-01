'use client';

/**
 * @fileoverview Popover Classic Engine - Rottay Design System
 * @description Classic (Ant Design) implementation of the Popover component.
 * Wraps Ant Design's Popover with full feature parity and theming.
 *
 * @remarks
 * The Classic engine provides:
 * - Native Ant Design Popover styling and animations
 * - Full theming integration with Ant Design tokens
 * - Built-in title and content sections
 * - All 12 placement positions supported
 * - Delay configuration for hover triggers
 *
 * Implementation details:
 * - Converts mouseEnterDelay/mouseLeaveDelay from ms to seconds
 * - Wraps children in a container div for ref forwarding
 * - Passes through all overlay styling options
 *
 * @example Using Classic Engine
 * ```tsx
 * import { Popover, Button } from '@rottay/design-system';
 *
 * <Popover
 *   engine="classic"
 *   content={<div>Rich content here</div>}
 *   title="Panel Title"
 *   trigger="click"
 *   placement="bottomRight"
 * >
 *   <Button>Open Popover</Button>
 * </Popover>
 * ```
 *
 * @see {@link Popover} - The main engine-aware component
 * @module Popover/Engines/Classic
 * @category Overlay
 * @package @rottay/design-system
 */
import React from 'react';
import { Popover as AntPopover } from 'antd';
import type { PopoverProps } from '../../contracts';

/**
 * Classic engine implementation of Popover using Ant Design.
 *
 * Wraps children in an inline-block container for ref forwarding and delegates
 * all popover behavior (positioning, animation, trigger) to AntPopover.
 *
 * @param props - Popover configuration props
 * @param ref - Forwarded ref attached to the wrapper div
 * @returns Ant Design Popover wrapping the trigger element
 */
export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (props, ref) => {
    const {
      content,
      title,
      trigger,
      placement,
      open,
      defaultOpen,
      onOpenChange,
      arrow,
      children,
      mouseEnterDelay,
      mouseLeaveDelay,
      destroyTooltipOnHide,
      className,
      style,
      overlayClassName,
      overlayStyle,
      zIndex,
      recipe: _recipe,
      offset: _offset,
      maxWidth: _maxWidth,
      touchBehavior: _touchBehavior,
      closeOnEscape: _closeOnEscape,
      closeOnInteractOutside: _closeOnInteractOutside,
      role: _role,
      'aria-label': _ariaLabel,
      'aria-labelledby': _ariaLabelledBy,
    } = props;

    // Modern-only coordinated behavior/material channels are consumed here so
    // they never leak to Ant or the DOM. Classic keeps Ant's native contract.
    void _recipe;
    void _offset;
    void _maxWidth;
    void _touchBehavior;
    void _closeOnEscape;
    void _closeOnInteractOutside;
    void _role;
    void _ariaLabel;
    void _ariaLabelledBy;

    return (
      <div ref={ref} className={className} style={{ display: 'inline-block', ...style }}>
        <AntPopover
          content={content}
          title={title}
          trigger={trigger}
          placement={placement}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
          arrow={arrow}
          /* DS uses milliseconds; Ant Design expects seconds, so divide by 1000 */
          mouseEnterDelay={mouseEnterDelay ? mouseEnterDelay / 1000 : undefined}
          mouseLeaveDelay={mouseLeaveDelay ? mouseLeaveDelay / 1000 : undefined}
          destroyOnHidden={destroyTooltipOnHide}
          overlayClassName={overlayClassName}
          overlayStyle={overlayStyle}
          zIndex={zIndex}
        >
          {children}
        </AntPopover>
      </div>
    );
  }
);

Popover.displayName = 'Popover.Classic';

export default Popover;
