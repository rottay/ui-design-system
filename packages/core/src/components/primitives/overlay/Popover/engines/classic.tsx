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
import type { PopoverProps } from '../Popover.types';

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
      overlayClassName,
      overlayStyle,
      zIndex,
    } = props;

    return (
      <div ref={ref} className={className} style={{ display: 'inline-block' }}>
        <AntPopover
          content={content}
          title={title}
          trigger={trigger}
          placement={placement}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
          arrow={arrow}
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
