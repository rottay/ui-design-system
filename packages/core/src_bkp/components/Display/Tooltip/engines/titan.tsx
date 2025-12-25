/**
 * Titan Tooltip Engine
 *
 * Adapter that converts unified TooltipProps to Ant Design Tooltip.
 */

'use client';

import { Tooltip as AntTooltip } from 'antd';
import type { TooltipProps } from '../../../../types/components/tooltip';

/**
 * Titan Tooltip - Ant Design implementation with unified TooltipProps
 */
function TitanTooltip({
  title,
  children,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  className,
  style,
  'aria-label': ariaLabel,
  placement,
  color,
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
}: TooltipProps) {
  // Map unified trigger to AntD trigger
  const antTrigger = trigger === 'contextMenu' ? 'contextMenu' : trigger ?? 'hover';

  return (
    <AntTooltip
      title={title}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      trigger={antTrigger}
      className={className}
      style={style}
      aria-label={ariaLabel}
      placement={placement}
      color={color}
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
    </AntTooltip>
  );
}

TitanTooltip.displayName = 'TitanTooltip';

export default TitanTooltip;
