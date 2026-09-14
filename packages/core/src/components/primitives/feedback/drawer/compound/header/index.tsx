/**
 * @fileoverview Drawer.Header - Rottay Design System
 * @description Header compound component for the Drawer primitive.
 * Provides a consistent header section with title and optional close button.
 *
 * @remarks
 * This component is designed to be used as a child of the Drawer component.
 * It automatically integrates with the Drawer's theming and handles the close
 * action when the close button is clicked.
 *
 * Styling is controlled via CSS custom properties, allowing full customization
 * through Rottay's multi-tenant theming system.
 *
 * @example Basic Usage
 * ```tsx
 * <Drawer open={open} onClose={handleClose}>
 *   <Drawer.Header>Settings</Drawer.Header>
 *   <Drawer.Body>...</Drawer.Body>
 * </Drawer>
 * ```
 *
 * @example With Close Button
 * ```tsx
 * <Drawer.Header onClose={handleClose} closable>
 *   User Profile
 * </Drawer.Header>
 * ```
 *
 * @example With Divider
 * ```tsx
 * <Drawer.Header divider>
 *   Navigation Menu
 * </Drawer.Header>
 * ```
 *
 * @module Drawer/header
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import { partAttributes } from '@/foundation/behavior/kernel/anatomy';
import { useInteractionState } from '@/foundation/behavior/runtime/interaction-state';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the DrawerHeader compound component.
 *
 * @interface DrawerHeaderProps
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface DrawerHeaderProps {
  /**
   * Header content, typically a title string or custom React elements.
   * @example "Settings"
   * @example <><Icon name="settings" /> Settings</>
   */
  children?: ReactNode;

  /**
   * Whether to show a border below the header.
   * Useful for visually separating the header from the body content.
   * @default false
   */
  divider?: boolean;

  /**
   * Whether to show the close button.
   * When true and onClose is provided, displays an X button.
   * @default true
   */
  closable?: boolean;

  /**
   * Callback fired when the close button is clicked.
   * Required if closable is true for the button to appear.
   */
  onClose?: () => void;

  /**
   * Additional CSS class names to apply to the header container.
   * Merged with the default 'ds-drawer-header' class.
   */
  className?: string;

  /**
   * Inline styles to apply to the header container.
   * Applied on top of the compound skin's paint; your styles take precedence.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Drawer header compound component.
 *
 * @description
 * Renders the header section of a Drawer, containing the title and an
 * optional close button. Designed to work seamlessly with Drawer.Body
 * and Drawer.Footer for structured drawer layouts.
 *
 * @remarks
 * - Automatically handles flexbox layout for title and close button
 * - Close button includes proper accessibility attributes
 * - Supports ref forwarding for DOM access
 * - Integrates with tenant theming via CSS custom properties
 *
 * CSS Custom Properties (consumed by the compound skin drawer-compounds.css):
 * - `--ds-drawer-header-divider`: engine-stamped hatch carrying the `divider`
 *   decision (`none` when off)
 * - `--ds-drawer-title-font-size`: title font size (falls back to the
 *   `--ds-font-size-lg` role)
 * - `--ds-drawer-title-font-weight`: title font weight (falls back to the
 *   `--ds-font-weight-semibold` role)
 *
 * @param props - {@link DrawerHeaderProps}
 * @param ref - Forwarded ref to the header container div
 * @returns The rendered header element
 *
 * @example
 * ```tsx
 * <Drawer.Header onClose={() => setOpen(false)} divider>
 *   <span>Edit Profile</span>
 * </Drawer.Header>
 * ```
 */
export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const {
      children,
      divider = false,
      closable = true,
      onClose,
      className = '',
      style = {},
    } = props;

    // Optional channel with an English floor (components.drawer.close ships for
    // en/es/ar): standalone compositions never crash nor echo a raw key.
    const i18n = useOptionalTranslation('components');
    const closeLabel = i18n?.tOr('drawer.close', 'Close') ?? 'Close';
    const close = useInteractionState();

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        data-part="header"
        data-divider={divider ? 'true' : 'false'}
        className={`ds-drawer-header ${className}`.trim()}
        style={style}
      >
        {/* Title container (layout + typography roles in the compound skin) */}
        <div data-part="title" role="heading" aria-level={2}>
          {children}
        </div>

        {/* Close button - only rendered if closable and onClose provided.
            Paint and interaction states live in drawer-compounds.css (the
            engine-agnostic compound skin); the glyph is the governed
            action-close role, never a text character. */}
        {closable && onClose && (
          <button
            type="button"
            {...partAttributes('close-button', close.state)}
            {...close.handlers}
            onClick={onClose}
            aria-label={closeLabel}
            className="ds-drawer-close"
          >
            <ActionCloseIcon decorative size={16} />
          </button>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools
DrawerHeader.displayName = 'Drawer.Header';

// Default export for convenience
export default DrawerHeader;
