/**
 * @fileoverview Alert Description Compound Component - Rottay Design System
 * @description Additional descriptive content for the Alert component.
 * Part of the Alert compound component family.
 *
 * @remarks
 * The AlertDescription component provides supplementary information below
 * the main alert message. It's designed to work seamlessly with all three
 * engines (Classic, Modern, Rustic) and inherits styling from the parent Alert.
 *
 * **Visual Characteristics:**
 * - Smaller font size than the main message
 * - Slightly reduced opacity for visual hierarchy
 * - Consistent spacing from the message
 * - Inherits parent alert's color scheme
 *
 * **Multi-Tenant Support:**
 * The description inherits CSS custom properties from the parent Alert,
 * ensuring consistent theming across different tenant configurations.
 *
 * @example Basic Usage
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert type="warning" message="Storage Almost Full">
 *   <Alert.Description>
 *     You have used 95% of your storage quota. Consider removing
 *     unused files or upgrading your plan.
 *   </Alert.Description>
 * </Alert>
 * ```
 *
 * @example With Custom Styling
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert type="info" message="Tip">
 *   <Alert.Description
 *     className="custom-description"
 *     style={{ fontStyle: 'italic' }}
 *   >
 *     Press Ctrl+S to save your work at any time.
 *   </Alert.Description>
 * </Alert>
 * ```
 *
 * @example Standalone Usage
 * ```tsx
 * import { AlertDescription } from '@rottay/design-system';
 *
 * // Can be used independently for custom alert layouts
 * <div className="my-custom-alert">
 *   <AlertDescription>
 *     Detailed information goes here.
 *   </AlertDescription>
 * </div>
 * ```
 *
 * @see {@link Alert} - Parent alert component
 * @see {@link AlertProps} - Alert props interface
 * @module Alert/Compound/Description
 * @category Feedback
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Props for the AlertDescription compound component.
 *
 * @interface AlertDescriptionProps
 *
 * @example
 * ```tsx
 * const descProps: AlertDescriptionProps = {
 *   children: 'Additional details about the alert.',
 *   className: 'my-custom-class',
 *   style: { maxWidth: '400px' },
 * };
 * ```
 */
export interface AlertDescriptionProps {
  /**
   * The description content.
   * Can be text, React elements, or a combination.
   */
  children?: ReactNode;

  /**
   * Additional CSS classes to apply.
   * Merged with the base 'rottay-alert-description' class.
   */
  className?: string;

  /**
   * Inline styles to apply.
   * Merged with the default description styling.
   */
  style?: React.CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Alert Description compound component.
 *
 * @description
 * Renders additional descriptive text below the main alert message.
 * Provides visual hierarchy through reduced font size and opacity.
 *
 * @remarks
 * **Default Styling:**
 * - `marginTop`: 4px (spacing from message)
 * - `fontSize`: 14px (smaller than message)
 * - `lineHeight`: 1.6 (readable text)
 * - `opacity`: 0.85 (subtle de-emphasis)
 *
 * **CSS Classes:**
 * - `rottay-alert-description`: Base class for styling hooks
 * - Additional classes from `className` prop are appended
 *
 * @param props - {@link AlertDescriptionProps}
 * @param ref - Forwarded ref to the container div
 * @returns A styled div containing the description content
 *
 * @example
 * ```tsx
 * <AlertDescription>
 *   This action cannot be undone. Please proceed with caution.
 * </AlertDescription>
 * ```
 */
export const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(
  (props, ref) => {
    // -------------------------------------------------------------------------
    // Props Destructuring
    // -------------------------------------------------------------------------

    const { children, className = '', style = {} } = props;

    // -------------------------------------------------------------------------
    // Style Definitions
    // -------------------------------------------------------------------------

    /**
     * Default styles for the description container.
     * Creates visual hierarchy below the main alert message.
     */
    const descriptionStyle: React.CSSProperties = {
      marginTop: '4px',
      fontSize: '14px',
      lineHeight: 1.6,
      opacity: 0.85,
      ...style,
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <div ref={ref} className={`rottay-alert-description ${className}`} style={descriptionStyle}>
        {children}
      </div>
    );
  }
);

// Set display name for React DevTools debugging
AlertDescription.displayName = 'Alert.Description';

export default AlertDescription;
