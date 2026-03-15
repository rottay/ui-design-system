/**
 * Modal - Classic Engine (Ant Design)
 */

'use client';

import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps } from '../../../../../../contracts/primitives/feedback/Modal';
import { MODAL_DEFAULTS, SIZE_MAP } from '../../Modal.types';

export default function ClassicModal(props: ModalProps): React.ReactElement | null {
  const {
    open,
    onClose,
    children,
    size = MODAL_DEFAULTS.size,
    title,
    footer,
    closeOnBackdropClick = MODAL_DEFAULTS.closeOnBackdropClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,
    closable = MODAL_DEFAULTS.closable,
    showBackdrop = MODAL_DEFAULTS.showBackdrop,
    placement = MODAL_DEFAULTS.placement,
    fullScreen = false,
    preventScroll: _preventScroll = MODAL_DEFAULTS.preventScroll,
    zIndex = MODAL_DEFAULTS.zIndex,
    disableAnimation = MODAL_DEFAULTS.disableAnimation,
    className = '',
    style = {},
  } = props;

  // Calculate width based on size
  const width = fullScreen ? '100vw' : SIZE_MAP[size] || SIZE_MAP.md;

  // Map placement to Ant Design centered prop
  const centered = placement === 'center';

  // Handle modal close
  const handleCancel = () => {
    onClose();
  };

  // Custom modal styles for fullscreen
  const modalStyle: React.CSSProperties = fullScreen
    ? {
        top: 0,
        margin: 0,
        maxWidth: '100vw',
        height: '100vh',
        paddingBottom: 0,
        ...style,
      }
    : style;

  const bodyStyle: React.CSSProperties = fullScreen
    ? {
        height: 'calc(100vh - 110px)',
        overflow: 'auto',
      }
    : {};

  return (
    <AntModal
      open={open}
      onCancel={handleCancel}
      title={title}
      footer={footer}
      width={width}
      centered={centered}
      closable={closable}
      maskClosable={closeOnBackdropClick}
      keyboard={closeOnEscape}
      mask={showBackdrop}
      zIndex={zIndex}
      destroyOnHidden
      className={`rottay-modal rottay-modal--classic ${className}`}
      style={modalStyle}
      styles={{
        body: bodyStyle,
        mask: showBackdrop ? undefined : { display: 'none' },
      }}
      transitionName={disableAnimation ? '' : undefined}
      maskTransitionName={disableAnimation ? '' : undefined}
      getContainer={() => {
        // Get or create portal container
        let root = document.getElementById('rottay-portal-root');
        if (!root) {
          root = document.createElement('div');
          root.id = 'rottay-portal-root';
          document.body.appendChild(root);
        }
        return root;
      }}
    >
      {children}
    </AntModal>
  );
}

ClassicModal.displayName = 'ClassicModal';
