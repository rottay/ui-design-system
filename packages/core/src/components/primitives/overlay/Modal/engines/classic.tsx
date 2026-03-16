/**
 * @fileoverview Modal Classic Engine - Rottay Design System.
 * Wraps Ant Design's Modal component, mapping the unified ModalProps interface
 * to Ant Design's API. Supports fullscreen mode, configurable placement, and
 * lazy portal container creation for isolated z-index stacking.
 *
 * @example
 * ```tsx
 * <Modal engine="classic" open={open} onClose={close} title="Confirm" size="md">
 *   <Text>Are you sure?</Text>
 * </Modal>
 * ```
 *
 * @module Modal/Engines/Classic
 * @category Overlay
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps } from '../Modal.types';
import { MODAL_DEFAULTS, SIZE_MAP } from '../Modal.types';

/**
 * Classic engine implementation of Modal using Ant Design.
 *
 * Converts the design-system ModalProps to Ant Design's Modal API, handling
 * fullscreen overrides (100vw width, full-height body), placement via
 * the `centered` prop, and animation disabling through empty transitionNames.
 * The portal container is lazily created under a dedicated `#rottay-portal-root`
 * element to prevent z-index collisions with other Ant Design overlays.
 *
 * @param props - Modal configuration props
 * @returns Ant Design Modal element, or null when closed
 */
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

  // Fullscreen bypasses the SIZE_MAP entirely to fill the viewport
  const width = fullScreen ? '100vw' : SIZE_MAP[size] || SIZE_MAP.md;

  // Ant Design uses a boolean `centered` prop instead of a placement string
  const centered = placement === 'center';

  const handleCancel = () => {
    onClose();
  };

  // Fullscreen needs margin/padding overrides to eliminate default Ant spacing
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
      /* Empty string disables the CSS transition; undefined keeps Ant Design defaults */
      transitionName={disableAnimation ? '' : undefined}
      maskTransitionName={disableAnimation ? '' : undefined}
      getContainer={() => {
        // Lazily create a dedicated portal root to isolate modal z-index stacking
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
