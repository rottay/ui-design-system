import React from 'react';
import { Space, Button } from 'antd';
import type { ButtonProps } from 'antd';

export interface ModalFooterProps {
  children?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  okText = 'OK',
  cancelText = 'Cancel',
  onOk,
  onCancel,
  okButtonProps,
  cancelButtonProps,
  align = 'right',
  className,
  style,
}) => {
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[align];

  if (children) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          justifyContent,
          padding: '10px 16px',
          borderTop: '1px solid rgba(5, 5, 5, 0.06)',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent,
        padding: '10px 16px',
        borderTop: '1px solid rgba(5, 5, 5, 0.06)',
        ...style,
      }}
    >
      <Space>
        {onCancel && (
          <Button onClick={onCancel} {...cancelButtonProps}>
            {cancelText}
          </Button>
        )}
        {onOk && (
          <Button type="primary" onClick={onOk} {...okButtonProps}>
            {okText}
          </Button>
        )}
      </Space>
    </div>
  );
};

ModalFooter.displayName = 'ModalFooter';
