/**
 * Hermes Modal Engine
 *
 * DaisyUI implementation using native HTML dialog element.
 * Implements unified ModalProps interface.
 */

'use client';

import { useEffect, useRef } from 'react';
import type { ModalProps } from '../../../../types/components/modal';

/**
 * Map unified size to width
 */
function getModalWidth(size?: ModalProps['size']): string {
  switch (size) {
    case 'small':
      return 'max-w-sm';
    case 'large':
      return 'max-w-3xl';
    case 'fullscreen':
      return 'max-w-full h-full';
    default:
      return 'max-w-lg';
  }
}

/**
 * Hermes Modal - DaisyUI implementation with unified ModalProps
 */
function HermesModal({
  open = false,
  onClose,
  title,
  children,
  footer,
  className = '',
  size,
  closable = true,
  maskClosable = true,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading,
  afterClose,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
      afterClose?.();
    }
  }, [open, afterClose]);

  const handleClose = () => {
    onCancel?.();
    onClose?.();
  };

  const handleBackdropClick = () => {
    if (maskClosable) {
      handleClose();
    }
  };

  const widthClass = getModalWidth(size);

  const defaultFooter = (
    <div className="modal-action">
      <button className="btn" onClick={handleClose}>
        {cancelText}
      </button>
      <button
        className="btn btn-primary"
        onClick={onOk}
        disabled={confirmLoading}
      >
        {confirmLoading && <span className="loading loading-spinner loading-sm" />}
        {okText}
      </button>
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      onClose={handleClose}
    >
      <div className={`modal-box ${widthClass}`}>
        {closable && (
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
        )}

        {title && <h3 className="font-bold text-lg mb-4">{title}</h3>}

        <div className="py-4">{children}</div>

        {footer !== null && (footer === undefined ? defaultFooter : footer)}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={handleBackdropClick}>close</button>
      </form>
    </dialog>
  );
}

HermesModal.displayName = 'HermesModal';

export default HermesModal;
