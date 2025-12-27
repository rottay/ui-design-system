/**
 * Modal - Titan Engine (Ant Design)
 */

import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps, ModalSize } from '../../types';
import { MODAL_DEFAULTS } from '../../types';

const SIZE_MAP: Record<ModalSize, number | string> = {
  xs: 320,
  sm: 416,
  md: 520,
  lg: 720,
  xl: 900,
  '2xl': 960,
  '3xl': 1120,
  '4xl': 1280,
  '5xl': 1440,
  full: '100%',
};

export default function TitanModal(props: ModalProps): React.ReactElement {
  const {
    open,
    size = MODAL_DEFAULTS.size as ModalSize,
    title,
    onClose,
    onOpenChange,
    closable = MODAL_DEFAULTS.closable,
    closeOnOverlayClick = MODAL_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,
    centered = MODAL_DEFAULTS.centered,
    footer,
    hideFooter,
    children,
    zIndex = MODAL_DEFAULTS.zIndex,
    okText,
    cancelText,
    onOk,
    onCancel,
    confirmLoading,
    className,
    style,
  } = props;

  const handleCancel = () => {
    onClose?.();
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleOk = () => {
    onOk?.();
  };

  const modalSize = size as ModalSize;

  return (
    <AntModal
      open={open}
      title={title}
      onCancel={handleCancel}
      onOk={handleOk}
      closable={closable}
      maskClosable={closeOnOverlayClick}
      keyboard={closeOnEscape}
      centered={centered}
      footer={hideFooter ? null : footer}
      width={SIZE_MAP[modalSize]}
      zIndex={zIndex}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      className={className}
      style={style}
    >
      {children}
    </AntModal>
  );
}
