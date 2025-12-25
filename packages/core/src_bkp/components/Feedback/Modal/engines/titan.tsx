/**
 * Titan Modal Engine
 *
 * Adapter that converts unified ModalProps to Ant Design Modal.
 */

'use client';

import { Modal as AntModal } from 'antd';
import type { ModalProps } from '../../../../types/components/modal';

/**
 * Titan Modal - Ant Design implementation with unified ModalProps
 */
function TitanModal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  closable = true,
  maskClosable = true,
  centered,
  destroyOnClose,
  mask = true,
  zIndex,
  width,
  bodyStyle,
  maskStyle,
  onOk,
  onCancel,
  okText,
  cancelText,
  confirmLoading,
  afterClose,
}: ModalProps) {
  // Handle cancel - call both onCancel and onClose
  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  return (
    <AntModal
      open={open}
      title={title}
      footer={footer}
      className={className}
      closable={closable}
      maskClosable={maskClosable}
      centered={centered}
      destroyOnClose={destroyOnClose}
      mask={mask}
      zIndex={zIndex}
      width={width}
      bodyStyle={bodyStyle}
      maskStyle={maskStyle}
      onOk={onOk}
      onCancel={handleCancel}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      afterClose={afterClose}
    >
      {children}
    </AntModal>
  );
}

TitanModal.displayName = 'TitanModal';

export default TitanModal;
