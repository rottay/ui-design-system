/**
 * @fileoverview Modal Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Modal component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Smooth fade-in/fade-out animations
 * - Native keyboard handling (Escape to close)
 * - Focus trapping for accessibility
 * - Confirmation dialog support (OK/Cancel buttons)
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 * - Accessibility-critical applications
 *
 * **Multi-Tenant Theming:**
 * Classic modals inherit Ant Design's theme tokens which can be
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
 * // Classic is the default engine
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
 * <Modal engine="classic" open={open} onClose={onClose}>
 *   <p>Explicitly using Classic engine</p>
 * </Modal>
 * ```
 *
 * @see {@link ModalProps} - Component props interface
 * @see {@link ModernModal} - DaisyUI alternative
 * @see {@link RusticModal} - Vanilla alternative
 * @see {@link https://ant.design/components/modal} - Ant Design Modal docs
 * @module Modal/Engines/Classic
 * @category Feedback
 * @package @rottay/design-system
 */

import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps, ModalSize } from '../../contracts';
import { MODAL_DEFAULTS } from '../../contracts';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size preset mappings for Classic engine.
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
 * Classic Engine implementation of the Modal component.
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
 * <ClassicModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   size="lg"
 *   title="User Settings"
 *   centered
 * >
 *   <SettingsForm />
 * </ClassicModal>
 * ```
 */
export default function ClassicModal(props: ModalProps): React.ReactElement {
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

  // Unified close handler fires all three callbacks to support different
  // consumer patterns: onClose (simple toggle), onCancel (confirmation
  // dialogs), and onOpenChange (controlled open state). Ordering matters:
  // onClose first for immediate UI update, then onCancel for side effects.
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

      // Ant Design renders default OK/Cancel buttons when footer is undefined.
      // Passing null explicitly hides the footer entirely, which is what
      // hideFooter=true should achieve.
      title={title}
      footer={hideFooter ? null : footer}

      // Behavior - bridge Rottay's naming conventions to Ant Design's API.
      // "closeOnOverlayClick" is more descriptive than Ant's "maskClosable",
      // and "closeOnEscape" is clearer than "keyboard". This abstraction
      // lets consumers switch engines without learning each library's API.
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
