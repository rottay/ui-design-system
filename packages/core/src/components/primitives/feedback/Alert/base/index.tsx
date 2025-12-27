/**
 * @fileoverview Alert Base Component - Rottay Design System
 * @description Base/fallback implementation for the Alert component.
 * Provides a minimal structure when no engine is available.
 *
 * @remarks
 * The BaseAlert serves as a fallback implementation used when:
 * - No engine is configured in the application
 * - An engine fails to load (caught by ErrorBoundary)
 * - Server-side rendering requires minimal markup
 *
 * **Important:** This is NOT the recommended way to use the Alert.
 * For full functionality, use the Alert with an engine:
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
 * import { BaseAlert } from '@rottay/design-system/components/primitives/feedback/Alert/base';
 *
 * // Only use directly for testing or edge cases
 * <BaseAlert className="my-alert">
 *   <p>Alert content</p>
 * </BaseAlert>
 * ```
 *
 * @example Recommended Usage
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * // Always prefer the main Alert export
 * <Alert type="success" message="Profile updated" showIcon />
 * ```
 *
 * @see {@link AlertProps} - Component props interface
 * @see {@link TitanAlert} - Ant Design implementation
 * @see {@link HermesAlert} - DaisyUI implementation
 * @see {@link ApolloAlert} - Vanilla implementation
 * @module Alert/Base
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { AlertProps } from '../types';

// ============================================================================
// Component
// ============================================================================

/**
 * Base Alert component - minimal fallback implementation.
 *
 * @description
 * Provides a simple container element with the `rottay-alert` class.
 * Does NOT implement full alert functionality (icons, colors, dismiss).
 * Engine implementations provide the complete alert experience.
 *
 * @remarks
 * - Forwards ref to the container div for DOM access
 * - Merges className with 'rottay-alert' prefix
 * - Passes through id and data-testid for testing
 * - Destructures all AlertProps to avoid spreading to DOM
 *
 * **CSS Classes:**
 * - `rottay-alert`: Base class for styling hooks
 * - Additional classes from `className` prop are appended
 *
 * @param props - {@link AlertProps}
 * @param ref - Forwarded ref to the container div
 * @returns A simple div wrapper (non-functional alert)
 *
 * @internal This component is primarily for internal use.
 * Use the main `Alert` export for application development.
 */
export const BaseAlert = forwardRef<HTMLDivElement, AlertProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------
    // Destructure all custom props to prevent them from being spread onto
    // the HTML element, which would cause React warnings for unknown props.

    const {
      // Standard HTML-compatible props
      className = '',
      style = {},
      children,
      id,
      'data-testid': dataTestId,

      // Alert-specific props (not spread to DOM)
      type: _type,
      message: _message,
      description: _description,
      icon: _icon,
      showIcon: _showIcon,
      closable: _closable,
      onClose: _onClose,
      engine: _engine,
    } = props;

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div
        ref={ref}
        className={`rottay-alert ${className}`.trim()}
        style={style}
        id={id}
        data-testid={dataTestId}
      >
        {children}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
BaseAlert.displayName = 'BaseAlert';
