'use client';

/**
 * @fileoverview Classic (Ant Design) engine for the Popconfirm overlay component.
 * Wraps Ant Design's Popconfirm providing native animations, 12-position placement,
 * and button customisation including danger type and loading state.
 *
 * @example
 * ```tsx
 * <Popconfirm engine="classic" title="Delete record?"
 *   okText="Delete" okType="danger" onConfirm={handleDelete}>
 *   <Button danger>Delete</Button>
 * </Popconfirm>
 * ```
 */
import React from 'react';
import { Popconfirm as AntPopconfirm } from 'antd';
import type { PopconfirmProps } from '../../contracts';

/**
 * Popconfirm implementation backed by Ant Design's Popconfirm primitive.
 *
 * The engine translates the unified `okType="danger"` into Ant Design's
 * `okButtonProps.danger=true` combined with `okType="primary"`, because Ant
 * does not have a standalone "danger" type -- it is a modifier on "primary".
 * Loading state is forwarded through `okButtonProps.loading`.
 *
 * @param props - {@link PopconfirmProps} shared across all engines.
 * @returns A ref-forwarded inline-block wrapper containing Ant's Popconfirm.
 */
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
          /* Ant has no standalone "danger" okType; map it to primary + danger flag */
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

Popconfirm.displayName = 'Popconfirm.Classic';

export default Popconfirm;
