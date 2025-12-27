/**
 * @fileoverview Modal Base Component - Rottay Design System
 * @description Base/fallback implementation for the Modal component.
 * Provides a minimal structure when no engine is available.
 *
 * @remarks
 * The BaseModal serves as a fallback implementation used when:
 * - No engine is configured in the application
 * - An engine fails to load (caught by ErrorBoundary)
 * - Server-side rendering requires minimal markup
 *
 * **Important:** This is NOT the recommended way to use the Modal.
 * For full functionality, use the Modal with an engine:
 * - **Titan**: Full-featured with Ant Design animations
 * - **Hermes**: Utility-first with Tailwind/DaisyUI
 * - **Apollo**: Zero-dependency vanilla implementation
 *
 * **Multi-Tenant Integration:**
 * The base component respects tenant-specific CSS variables but
 * provides minimal styling. Engine implementations add the visual
 * polish expected in production applications.
 *
 * @example Direct Usage (Not Recommended)
 * ```tsx
 * import { BaseModal } from '@rottay/design-system/components/primitives/feedback/Modal/base';
 *
 * // Only use directly for testing or edge cases
 * <BaseModal className="my-modal">
 *   <p>Content</p>
 * </BaseModal>
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Modal } from '@rottay/design-system';
 *
 * // Always prefer the main Modal export
 * <Modal open={open} onClose={onClose}>
 *   <Modal.Header>Title</Modal.Header>
 *   <Modal.Body>Content</Modal.Body>
 * </Modal>
 * ```
 *
 * @see {@link ModalProps} - Component props interface
 * @see {@link TitanModal} - Ant Design implementation
 * @see {@link HermesModal} - DaisyUI implementation
 * @see {@link ApolloModal} - Vanilla implementation
 * @module Modal/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { ModalProps } from '../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Base Modal component - minimal fallback implementation.
 *
 * @description
 * Provides a simple container element with the `rottay-modal` class.
 * Does NOT implement modal functionality (overlay, focus trap, etc.).
 * Engine implementations provide the full modal experience.
 *
 * @remarks
 * - Forwards ref to the container div for DOM access
 * - Merges className with 'rottay-modal' prefix
 * - Passes through id and data-testid for testing
 * - Destructures all ModalProps to avoid spreading to DOM
 *
 * **CSS Classes:**
 * - `rottay-modal`: Base class for styling hooks
 * - Additional classes from `className` prop are appended
 *
 * @param props - {@link ModalProps}
 * @param ref - Forwarded ref to the container div
 * @returns A simple div wrapper (non-functional modal)
 *
 * @internal This component is primarily for internal use.
 * Use the main `Modal` export for application development.
 */
export const BaseModal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  // ---------------------------------------------------------------------------
  // Props Destructuring
  // ---------------------------------------------------------------------------
  // Destructure all custom props to prevent them from being spread onto
  // the HTML element, which would cause React warnings for unknown props.

  const {
    // Standard HTML-compatible props
    className = '',
    style = {},
    children,
    id,
    'data-testid': dataTestId,

    // Modal-specific props (not spread to DOM)
    open: _open,
    defaultOpen: _defaultOpen,
    size: _size,
    title: _title,
    onClose: _onClose,
    onOpenChange: _onOpenChange,
    closable: _closable,
    closeOnOverlayClick: _closeOnOverlayClick,
    closeOnEscape: _closeOnEscape,
    centered: _centered,
    footer: _footer,
    hideFooter: _hideFooter,
    zIndex: _zIndex,
    overlayOpacity: _overlayOpacity,
    okText: _okText,
    cancelText: _cancelText,
    onOk: _onOk,
    onCancel: _onCancel,
    confirmLoading: _confirmLoading,
    engine: _engine,
  } = props;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={ref}
      className={`rottay-modal ${className}`.trim()}
      style={style}
      id={id}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
});

// Set display name for React DevTools debugging
BaseModal.displayName = 'BaseModal';
