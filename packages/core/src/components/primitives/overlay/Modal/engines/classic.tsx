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
 * Wave 4: Adaptive fullscreen on mobile -- modals automatically expand to
 * fill the viewport on screens < 640px for a native app-like experience.
 * Controlled via the `adaptiveFullscreen` prop (default: true).
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
import { useBreakpoints } from '../../../../../hooks/responsive/useBreakpoints';

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
  const { isMobile } = useBreakpoints();

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
    adaptiveFullscreen = MODAL_DEFAULTS.adaptiveFullscreen,
    preventScroll: _preventScroll = MODAL_DEFAULTS.preventScroll,
    zIndex = MODAL_DEFAULTS.zIndex,
    disableAnimation = MODAL_DEFAULTS.disableAnimation,
    className = '',
    style = {},
  } = props;

  /** Whether the modal should render as fullscreen on the current viewport. */
  const isAdaptiveFullscreen = !fullScreen && adaptiveFullscreen && isMobile;

  /** Whether the panel should behave as fullscreen (explicit or adaptive). */
  const effectiveFullscreen = fullScreen || isAdaptiveFullscreen;

  // Fullscreen bypasses the SIZE_MAP entirely to fill the viewport
  const width = effectiveFullscreen ? '100vw' : SIZE_MAP[size] || SIZE_MAP.md;

  // Ant Design uses a boolean `centered` prop instead of a placement string
  const centered = isAdaptiveFullscreen ? false : placement === 'center';

  const handleCancel = () => {
    onClose();
  };

  // Fullscreen needs margin/padding overrides to eliminate default Ant spacing
  const modalStyle: React.CSSProperties = effectiveFullscreen
    ? {
        top: 0,
        margin: 0,
        maxWidth: 'none',
        height: isAdaptiveFullscreen ? '100dvh' : '100vh',
        paddingBottom: 0,
        borderRadius: 0,
        ...style,
      }
    : style;

  const bodyStyle: React.CSSProperties = effectiveFullscreen
    ? {
        height: isAdaptiveFullscreen ? 'calc(100dvh - 110px)' : 'calc(100vh - 110px)',
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
