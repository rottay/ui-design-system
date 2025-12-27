/**
 * @fileoverview Modal Titan Engine - Rottay Design System
 * @description Ant Design implementation of the Modal component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Titan is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Smooth fade-in/fade-out animations
 * - Native keyboard handling (Escape to close)
 * - Focus trapping for accessibility
 * - Confirmation dialog support (OK/Cancel buttons)
 *
 * **When to Use Titan:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 * - Accessibility-critical applications
 *
 * **Multi-Tenant Theming:**
 * Titan modals inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Size Mapping:**
 * | Size | Width |
 * |------|-------|
 * | xs | 320px |
 * | sm | 416px |
 * | md | 520px |
 * | lg | 720px |
 * | xl | 900px |
 * | 2xl | 960px |
 * | 3xl | 1120px |
 * | 4xl | 1280px |
 * | 5xl | 1440px |
 * | full | 100% |
 *
 * @example Basic Usage
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * // Titan is the default engine
 * <Modal open={open} onClose={onClose} title="Settings">
 *   <p>Modal content</p>
 * </Modal>
 * ```
 *
 * @example Confirmation Dialog
 * ```tsx
 * <Modal
 *   open={open}
 *   title="Confirm Delete"
 *   okText="Delete"
 *   cancelText="Cancel"
 *   onOk={handleDelete}
 *   onCancel={handleClose}
 *   confirmLoading={isDeleting}
 * >
 *   This action cannot be undone.
 * </Modal>
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Modal engine="titan" open={open} onClose={onClose}>
 *   <p>Explicitly using Titan engine</p>
 * </Modal>
 * ```
 *
 * @see {@link ModalProps} - Component props interface
 * @see {@link HermesModal} - DaisyUI alternative
 * @see {@link ApolloModal} - Vanilla alternative
 * @see {@link https://ant.design/components/modal} - Ant Design Modal docs
 * @module Modal/Engines/Titan
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps, ModalSize } from '../../types';
import { MODAL_DEFAULTS } from '../../types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size preset mappings for Titan engine.
 * Maps semantic size names to pixel/percentage values.
 *
 * @remarks
 * These values follow Ant Design's recommendations for modal widths
 * while extending to support larger sizes for complex layouts.
 *
 * @internal
 */
const SIZE_MAP: Record<ModalSize, number | string> = {
  /** Extra small - tooltips, confirmations */
  xs: 320,
  /** Small - simple forms */
  sm: 416,
  /** Medium - standard dialogs (default) */
  md: 520,
  /** Large - complex forms */
  lg: 720,
  /** Extra large - multi-section content */
  xl: 900,
  /** 2X large - wide layouts */
  '2xl': 960,
  /** 3X large - dashboard panels */
  '3xl': 1120,
  /** 4X large - full-width content */
  '4xl': 1280,
  /** 5X large - near full-screen */
  '5xl': 1440,
  /** Full viewport width */
  full: '100%',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Titan Engine implementation of the Modal component.
 *
 * @description
 * Wraps Ant Design's Modal component with Rottay's standardized props API.
 * Provides enterprise-grade modal functionality with full accessibility support.
 *
 * @remarks
 * **Key Features:**
 * - Animated transitions (configurable via Ant Design)
 * - Focus management and keyboard navigation
 * - Body scroll locking when open
 * - Portal rendering to document.body
 * - Built-in OK/Cancel confirmation pattern
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | open | open |
 * | onClose | onCancel |
 * | closeOnOverlayClick | maskClosable |
 * | closeOnEscape | keyboard |
 * | size | width |
 *
 * @param props - {@link ModalProps}
 * @returns The rendered Ant Design Modal
 *
 * @example
 * ```tsx
 * <TitanModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   size="lg"
 *   title="User Settings"
 *   centered
 * >
 *   <SettingsForm />
 * </TitanModal>
 * ```
 */
export default function TitanModal(props: ModalProps): React.ReactElement {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------

  const {
    // Visibility
    open,

    // Layout
    size = MODAL_DEFAULTS.size as ModalSize,
    centered = MODAL_DEFAULTS.centered,
    zIndex = MODAL_DEFAULTS.zIndex,

    // Content
    title,
    children,
    footer,
    hideFooter,

    // Behavior
    onClose,
    onOpenChange,
    closable = MODAL_DEFAULTS.closable,
    closeOnOverlayClick = MODAL_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = MODAL_DEFAULTS.closeOnEscape,

    // Confirmation
    okText,
    cancelText,
    onOk,
    onCancel,
    confirmLoading,

    // Styling
    className,
    style,
  } = props;

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle cancel/close action.
   * Called when X button clicked, overlay clicked, or Escape pressed.
   */
  const handleCancel = () => {
    onClose?.();
    onCancel?.();
    onOpenChange?.(false);
  };

  /**
   * Handle OK/confirm action.
   * Called when OK button is clicked in confirmation dialogs.
   */
  const handleOk = () => {
    onOk?.();
  };

  // ---------------------------------------------------------------------------
  // Size Calculation
  // ---------------------------------------------------------------------------

  const modalSize = size as ModalSize;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AntModal
      // Visibility
      open={open}

      // Layout
      width={SIZE_MAP[modalSize]}
      centered={centered}
      zIndex={zIndex}

      // Content
      title={title}
      footer={hideFooter ? null : footer}

      // Behavior - map Rottay props to Ant Design props
      onCancel={handleCancel}
      onOk={handleOk}
      closable={closable}
      maskClosable={closeOnOverlayClick}
      keyboard={closeOnEscape}

      // Confirmation
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}

      // Styling
      className={className}
      style={style}
    >
      {children}
    </AntModal>
  );
}
