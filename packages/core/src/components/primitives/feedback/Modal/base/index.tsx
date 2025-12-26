'use client';
import { forwardRef } from 'react';
import type { ModalProps } from '../types';

export const BaseModal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const {
    className = '',
    style = {},
    children,
    // Destructure custom props to avoid spreading them onto HTML element
    open: _open,
    defaultOpen: _defaultOpen,
    size: _size,
    title: _title,
    onClose: _onClose,
    onOpenChange: _onOpenChange,
    closable: _closable,
    closeOnOverlayClick: _closeOnOverlayClick,
    closeOnEscape: _closeOnEscape,
    centered: _centered,
    footer: _footer,
    hideFooter: _hideFooter,
    zIndex: _zIndex,
    overlayOpacity: _overlayOpacity,
    okText: _okText,
    cancelText: _cancelText,
    onOk: _onOk,
    onCancel: _onCancel,
    confirmLoading: _confirmLoading,
    engine: _engine,
    id,
    'data-testid': dataTestId,
  } = props;

  return (
    <div
      ref={ref}
      className={`rottay-modal ${className}`}
      style={style}
      id={id}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
});
BaseModal.displayName = 'BaseModal';
