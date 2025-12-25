/**
 * Titan Popconfirm Engine
 *
 * Adapter that converts unified PopconfirmProps to Ant Design Popconfirm.
 */

'use client';

import { Popconfirm as AntPopconfirm } from 'antd';
import type { PopconfirmProps } from '../../../../types/components/popconfirm';

/**
 * Titan Popconfirm - Ant Design implementation with unified PopconfirmProps
 */
function TitanPopconfirm({
  title,
  description,
  children,
  open,
  defaultOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  okText,
  cancelText,
  okType,
  okButtonProps,
  cancelButtonProps,
  icon,
  showCancel,
  placement,
  trigger,
  disabled,
  className,
  style,
  overlayClassName,
  overlayStyle,
  zIndex,
  'aria-label': ariaLabel,
}: PopconfirmProps) {
  return (
    <AntPopconfirm
      title={title}
      description={description}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okType={okType}
      okButtonProps={okButtonProps}
      cancelButtonProps={cancelButtonProps}
      icon={icon}
      showCancel={showCancel}
      placement={placement}
      trigger={trigger}
      disabled={disabled}
      className={className}
      style={style}
      overlayClassName={overlayClassName}
      overlayStyle={overlayStyle}
      zIndex={zIndex}
      aria-label={ariaLabel}
    >
      {children}
    </AntPopconfirm>
  );
}

TitanPopconfirm.displayName = 'TitanPopconfirm';

export default TitanPopconfirm;
