/**
 * @fileoverview Modal.CloseButton - Rottay Design System
 * @description Standalone close button component for custom modal layouts.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * This component provides a reusable close button that can be placed
 * anywhere within a modal for custom layouts. It's used internally by
 * Modal.Header but can also be used independently.
 *
 * **Features:**
 * - Three size variants (sm, md, lg)
 * - Governed `action.close` semantic icon (tenant icon profile)
 * - Hover and focus states
 * - Full accessibility support
 * - CSS custom property theming
 *
 * **Accessibility:**
 * - Proper button semantics (`type="button"`)
 * - Customizable aria-label
 * - Focus visible states
 *
 * **Styling via CSS Custom Properties:**
 * - `--ds-modal-close-color`: Button color (fallback: `--ds-color-text-secondary`)
 *
 * @example Basic Usage
 * ```tsx
 * <Modal.CloseButton onClose={handleClose} />
 * ```
 *
 * @example Different Sizes
 * ```tsx
 * <Modal.CloseButton size="sm" onClose={handleClose} />
 * <Modal.CloseButton size="md" onClose={handleClose} />
 * <Modal.CloseButton size="lg" onClose={handleClose} />
 * ```
 *
 * @example Custom Aria Label
 * ```tsx
 * <Modal.CloseButton
 *   onClose={handleClose}
 *   aria-label="Dismiss notification"
 * />
 * ```
 *
 * @example Positioned Independently
 * ```tsx
 * <Modal open={open} onClose={handleClose}>
 *   <div style={{ position: 'relative' }}>
 *     <Modal.CloseButton
 *       onClose={handleClose}
 *       style={{ position: 'absolute', top: 8, right: 8 }}
 *     />
 *     <Modal.Body padding="lg">
 *       Custom layout without header
 *     </Modal.Body>
 *   </div>
 * </Modal>
 * ```
 *
 * @module Modal/Header/CloseButton
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ModalCloseButtonProps } from '../../../contracts';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';

// ============================================================================
// Constants
// ============================================================================

/**
 * Size mappings for the close button.
 * Defines button dimensions and governed icon sizes for each variant.
 * @internal
 */
const SIZE_MAP: Record<'sm' | 'md' | 'lg', { size: string; icon: number }> = {
  /** Small - 24px button, 14px icon */
  sm: { size: '24px', icon: 14 },
  /** Medium - 32px button, 18px icon (default) */
  md: { size: '32px', icon: 18 },
  /** Large - 40px button, 22px icon */
  lg: { size: '40px', icon: 22 },
};

// ============================================================================
// Component
// ============================================================================

/**
 * Modal close button compound component.
 *
 * @description
 * Renders a standalone close button with an X icon. Designed for
 * accessibility with proper button semantics and ARIA attributes.
 *
 * @remarks
 * - Uses the governed `action.close` semantic icon (no private SVG)
 * - Transparent background with hover state
 * - Forwards ref for DOM access
 * - Integrates with tenant theming via CSS custom properties
 *
 * @param props - {@link ModalCloseButtonProps}
 * @param ref - Forwarded ref to the button element
 * @returns The rendered close button
 *
 * @example
 * ```tsx
 * <Modal.CloseButton
 *   onClose={() => setModalOpen(false)}
 *   size="md"
 *   aria-label="Close settings"
 * />
 * ```
 */
export const ModalCloseButton = forwardRef<HTMLButtonElement, ModalCloseButtonProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      onClose,
      size = 'md',
      className = '',
      style = {},
      'aria-label': ariaLabel = 'Close modal',
    } = props;

    // -------------------------------------------------------------------------
    // Size Configuration
    // -------------------------------------------------------------------------

    const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

    // -------------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------------

    /**
     * Instance styles for the close button: only the square size resolves
     * inline (SIZE_MAP contract enum — sanctioned instance geometry). The
     * stable frame (flex centering, cursor, shrink) and the hover/color
     * transition live in the compound skin
     * (modal-compounds.css `[data-part='close-button']`), which consumes pure
     * `--ds-motion-*` channels — no literal duration fallbacks.
     */
    const buttonStyle: React.CSSProperties = {
      // Dimensions - based on size prop
      width: sizeConfig.size,
      height: sizeConfig.size,

      // Merge user styles (takes precedence)
      ...style,
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <button
        ref={ref}
        type="button"
        data-part="close-button"
        className={`rottay-modal-close ${className}`.trim()}
        style={buttonStyle}
        onClick={onClose}
        aria-label={ariaLabel}
      >
        {/* Governed icon role (action.close): tenant icon treatment, sizing
            and stroke follow the icon profile; decorative — the button's
            aria-label owns the accessible name. */}
        <ActionCloseIcon decorative size={sizeConfig.icon} />
      </button>
    );
  }
);

// Set display name for React DevTools
ModalCloseButton.displayName = 'Modal.CloseButton';

// Default export for convenience
export default ModalCloseButton;
