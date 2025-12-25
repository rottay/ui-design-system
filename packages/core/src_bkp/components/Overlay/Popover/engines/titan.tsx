/**
 * Titan Popover Engine
 *
 * Adapter that converts unified PopoverProps to Ant Design Popover.
 */

'use client';

import { Popover as AntPopover } from 'antd';
import type { PopoverProps } from '../../../../types/components/popover';

/**
 * Titan Popover - Ant Design implementation with unified PopoverProps
 */
function TitanPopover({
  title,
  content,
  children,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  className,
  style,
  'aria-label': ariaLabel,
  placement,
  overlayClassName,
  overlayStyle,
  overlayInnerStyle,
  arrow,
  zIndex,
  mouseEnterDelay,
  mouseLeaveDelay,
  align,
  autoAdjustOverflow,
  destroyTooltipOnHide,
  getPopupContainer,
  fresh,
  afterOpenChange,
}: PopoverProps) {
  return (
    <AntPopover
      title={title}
      content={content}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      trigger={trigger}
      className={className}
      style={style}
      aria-label={ariaLabel}
      placement={placement}
      overlayClassName={overlayClassName}
      overlayStyle={overlayStyle}
      overlayInnerStyle={overlayInnerStyle}
      arrow={arrow}
      zIndex={zIndex}
      mouseEnterDelay={mouseEnterDelay}
      mouseLeaveDelay={mouseLeaveDelay}
      align={align}
      autoAdjustOverflow={autoAdjustOverflow}
      destroyTooltipOnHide={destroyTooltipOnHide}
      getPopupContainer={getPopupContainer}
      fresh={fresh}
      afterOpenChange={afterOpenChange}
    >
      {children}
    </AntPopover>
  );
}

TitanPopover.displayName = 'TitanPopover';

export default TitanPopover;
