/**
 * Modal - Apollo Engine (Vanilla HTML/CSS)
 */

import React, { useEffect } from 'react';
import type { ModalProps, ModalSize } from '../../types';
import { MODAL_DEFAULTS } from '../../types';

const SIZE_STYLES: Record<ModalSize, { maxWidth: string; width?: string }> = {
  sm: { maxWidth: '416px' },
  md: { maxWidth: '520px' },
  lg: { maxWidth: '720px' },
  xl: { maxWidth: '900px' },
  full: { maxWidth: '90vw', width: '100%' },
};

export default function ApolloModal(props: ModalProps): React.ReactElement {
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
    overlayOpacity = MODAL_DEFAULTS.overlayOpacity,
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

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
    display: 'flex',
    alignItems: centered ? 'center' : 'flex-start',
    justifyContent: 'center',
    padding: '20px',
    zIndex,
    overflowY: 'auto',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--rottay-color-background, #fff)',
    borderRadius: 'var(--rottay-border-radius-lg, 8px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    position: 'relative',
    width: '100%',
    ...SIZE_STYLES[modalSize],
    ...style,
  };

  return (
    <div className={`rottay-modal-overlay ${className}`} style={overlayStyle} onClick={closeOnOverlayClick ? handleCancel : undefined}>
      <div className="rottay-modal" style={modalStyle} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {(title || closable) && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--rottay-color-border, #f0f0f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {title && <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>{title}</h3>}
            {closable && (<button style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }} onClick={handleCancel}>✕</button>)}
          </div>
        )}
        <div style={{ padding: '24px' }}>{children}</div>
        {!hideFooter && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {footer || (
              <>
                {onCancel && (<button style={{ padding: '4px 15px', fontSize: '14px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #d9d9d9' }} onClick={handleCancel}>{cancelText}</button>)}
                {onOk && (<button style={{ padding: '4px 15px', fontSize: '14px', borderRadius: '4px', cursor: 'pointer', background: '#1890ff', color: '#fff', border: 'none' }} onClick={handleOk} disabled={confirmLoading}>{confirmLoading ? 'Loading...' : okText}</button>)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
