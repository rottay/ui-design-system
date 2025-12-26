'use client';

/**
 * Popconfirm - Titan Engine (Ant Design)
 */
import React from 'react';
import { Popconfirm as AntPopconfirm } from 'antd';
import type { PopconfirmProps } from '../../types';

export const Popconfirm = React.forwardRef<HTMLDivElement, PopconfirmProps>(
  (props, ref) => {
    const {
      title,
      description,
      onConfirm,
      onCancel,
      okText,
      cancelText,
      okType,
      icon,
      open,
      onOpenChange,
      disabled,
      children,
      placement,
      showArrow,
      okButtonLoading,
      className,
      overlayClassName,
      overlayStyle,
    } = props;

    return (
      <div ref={ref} className={className} style={{ display: 'inline-block' }}>
        <AntPopconfirm
          title={title}
          description={description}
          onConfirm={onConfirm}
          onCancel={onCancel}
          okText={okText}
          cancelText={cancelText}
          okType={okType === 'danger' ? 'primary' : okType}
          okButtonProps={{ danger: okType === 'danger', loading: okButtonLoading }}
          icon={icon}
          open={open}
          onOpenChange={onOpenChange}
          disabled={disabled}
          placement={placement}
          arrow={showArrow}
          overlayClassName={overlayClassName}
          overlayStyle={overlayStyle}
        >
          {children}
        </AntPopconfirm>
      </div>
    );
  }
);

Popconfirm.displayName = 'Popconfirm.Titan';

export default Popconfirm;
