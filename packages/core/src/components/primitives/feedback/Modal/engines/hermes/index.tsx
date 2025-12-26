/**
 * Modal - Hermes Engine (DaisyUI)
 */

import React, { useEffect } from 'react';
import type { ModalProps, ModalSize } from '../../types';
import { MODAL_DEFAULTS } from '../../types';

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'modal-box w-96',
  md: 'modal-box w-[520px]',
  lg: 'modal-box w-[720px]',
  xl: 'modal-box w-[900px]',
  full: 'modal-box w-11/12 max-w-7xl',
};

export default function HermesModal(props: ModalProps): React.ReactElement {
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
    okText = 'OK',
    cancelText = 'Cancel',
    onOk,
    onCancel,
    confirmLoading,
    className = '',
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

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return <></>;

  const modalSize = size as ModalSize;

  return (
    <div className={`modal modal-open ${centered ? 'modal-middle' : ''}`} style={style}>
      <div className="modal-backdrop" onClick={closeOnOverlayClick ? handleCancel : undefined} />
      <div className={`${SIZE_CLASSES[modalSize]} ${className}`}>
        {closable && (
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={handleCancel} aria-label="Close">
            ✕
          </button>
        )}
        {title && <h3 className="font-bold text-lg mb-4">{title}</h3>}
        <div className="py-4">{children}</div>
        {!hideFooter && (
          <div className="modal-action">
            {footer || (
              <>
                {onCancel && (<button className="btn" onClick={handleCancel}>{cancelText}</button>)}
                {onOk && (<button className={`btn btn-primary ${confirmLoading ? 'loading' : ''}`} onClick={handleOk} disabled={confirmLoading}>{okText}</button>)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
