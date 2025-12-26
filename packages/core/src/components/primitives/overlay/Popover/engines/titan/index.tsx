'use client';

/**
 * Popover - Titan Engine (Ant Design)
 */
import React from 'react';
import { Popover as AntPopover } from 'antd';
import type { PopoverProps } from '../../types';

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
          destroyTooltipOnHide={destroyTooltipOnHide}
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

Popover.displayName = 'Popover.Titan';

export default Popover;
