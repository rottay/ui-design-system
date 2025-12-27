/**
 * @fileoverview Drawer Base Component - Rottay Design System
 * @description Base/fallback implementation for the Drawer component.
 * Provides a minimal structure when no engine is available.
 *
 * @remarks
 * The BaseDrawer serves as a fallback implementation used when:
 * - No engine is configured in the application
 * - An engine fails to load (caught by ErrorBoundary)
 * - Server-side rendering requires a minimal markup
 *
 * **Important:** This is NOT the recommended way to use the Drawer.
 * For full functionality, use the Drawer with an engine:
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
 * import { BaseDrawer } from '@rottay/design-system/components/primitives/feedback/Drawer/base';
 *
 * // Only use directly for testing or edge cases
 * <BaseDrawer className="my-drawer">
 *   <p>Content</p>
 * </BaseDrawer>
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Drawer } from '@rottay/design-system';
 *
 * // Always prefer the main Drawer export
 * <Drawer open={open} onClose={onClose} placement="right">
 *   <Drawer.Header>Title</Drawer.Header>
 *   <Drawer.Body>Content</Drawer.Body>
 * </Drawer>
 * ```
 *
 * @see {@link DrawerProps} - Component props interface
 * @see {@link TitanDrawer} - Ant Design implementation
 * @see {@link HermesDrawer} - DaisyUI implementation
 * @see {@link ApolloDrawer} - Vanilla implementation
 * @module Drawer/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { DrawerProps } from '../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Base Drawer component - minimal fallback implementation.
 *
 * @description
 * Provides a simple container element with the `rottay-drawer` class.
 * Does NOT implement drawer functionality (sliding, overlay, etc.).
 * Engine implementations provide the full drawer experience.
 *
 * @remarks
 * - Forwards ref to the container div for DOM access
 * - Merges className with 'rottay-drawer' prefix
 * - Passes through id and data-testid for testing
 * - Destructures all DrawerProps to avoid spreading to DOM
 *
 * **CSS Classes:**
 * - `rottay-drawer`: Base class for styling hooks
 * - Additional classes from `className` prop are appended
 *
 * @param props - {@link DrawerProps}
 * @param ref - Forwarded ref to the container div
 * @returns A simple div wrapper (non-functional drawer)
 *
 * @internal This component is primarily for internal use.
 * Use the main `Drawer` export for application development.
 */
export const BaseDrawer = forwardRef<HTMLDivElement, DrawerProps>((props, ref) => {
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

    // Drawer-specific props (not spread to DOM)
    open: _open,
    defaultOpen: _defaultOpen,
    placement: _placement,
    size: _size,
    title: _title,
    onClose: _onClose,
    onOpenChange: _onOpenChange,
    closable: _closable,
    closeOnOverlayClick: _closeOnOverlayClick,
    closeOnEscape: _closeOnEscape,
    footer: _footer,
    hideFooter: _hideFooter,
    zIndex: _zIndex,
    width: _width,
    height: _height,
    mask: _mask,
    maskOpacity: _maskOpacity,
    engine: _engine,
  } = props;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={ref}
      className={`rottay-drawer ${className}`.trim()}
      style={style}
      id={id}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
});

// Set display name for React DevTools debugging
BaseDrawer.displayName = 'BaseDrawer';
