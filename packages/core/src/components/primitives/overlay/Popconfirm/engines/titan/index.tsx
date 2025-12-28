'use client';

/**
 * @fileoverview Popconfirm Titan Engine - Rottay Design System
 * @description Titan (Ant Design) implementation of the Popconfirm component.
 * Wraps Ant Design's Popconfirm with full feature parity and button customization.
 *
 * @remarks
 * The Titan engine provides:
 * - Native Ant Design Popconfirm styling and animations
 * - Full button customization via okButtonProps
 * - All 12 placement positions supported
 * - Description support for additional context
 * - Custom icon support
 *
 * Implementation details:
 * - Maps okType='danger' to okButtonProps.danger=true
 * - Passes okButtonLoading through okButtonProps.loading
 * - Wraps children in container div for ref forwarding
 * - Arrow visibility controlled via showArrow prop
 *
 * @example Using Titan Engine
 * ```tsx
 * import { Popconfirm, Button } from '@rottay/design-system';
 *
 * <Popconfirm
 *   engine="titan"
 *   title="Delete this record?"
 *   description="This action cannot be undone."
 *   okText="Delete"
 *   okType="danger"
 *   onConfirm={handleDelete}
 * >
 *   <Button danger>Delete</Button>
 * </Popconfirm>
 * ```
 *
 * @see {@link Popconfirm} - The main engine-aware component
 * @module Popconfirm/Engines/Titan
 * @category Overlay
 * @package @rottay/design-system
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
