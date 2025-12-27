/**
 * @fileoverview Alert Component - Rottay Design System
 * @description Contextual feedback messages for user actions and system status.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Alert component provides visual feedback for important messages such as
 * success confirmations, warnings, errors, and informational notices. It
 * supports multiple types, custom icons, and dismissible functionality.
 *
 * **Available Engines:**
 * - **Titan** (Ant Design): Full-featured with animations and theme integration
 * - **Hermes** (DaisyUI): Utility-first styling with Tailwind classes
 * - **Apollo** (Vanilla): Zero-dependency with CSS custom properties
 *
 * **Compound Components:**
 * - `Alert.Description`: Additional descriptive content below the message
 *
 * **Multi-Tenant Theming:**
 * Alert colors and styles can be customized per tenant using CSS variables.
 * Each alert type (info, success, warning, error) has its own color palette.
 *
 * @example Basic Usage
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert type="success" message="Changes saved successfully!" />
 * ```
 *
 * @example With Description
 * ```tsx
 * <Alert
 *   type="warning"
 *   message="Unsaved Changes"
 *   description="You have unsaved changes that will be lost if you leave."
 * />
 * ```
 *
 * @example Dismissible Alert
 * ```tsx
 * <Alert
 *   type="info"
 *   message="New features available"
 *   closable
 *   onClose={() => console.log('Alert dismissed')}
 * />
 * ```
 *
 * @example With Compound Component
 * ```tsx
 * <Alert type="error" message="Upload Failed">
 *   <Alert.Description>
 *     The file exceeds the maximum size of 10MB. Please try again.
 *   </Alert.Description>
 * </Alert>
 * ```
 *
 * @see {@link AlertProps} - Component props interface
 * @see {@link AlertDescription} - Description compound component
 * @see {@link Modal} - For dialog-based feedback
 * @see {@link Toast} - For temporary notifications
 * @module Alert
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Imports
// ============================================================================

import { createEngineComponent } from '../../../../system/engines/factory';
import type { AlertProps } from './types';
import { AlertDescription } from './compound';

// ============================================================================
// Type Exports
// ============================================================================

export { type AlertProps, type AlertType, ALERT_DEFAULTS } from './types';

// ============================================================================
// Component Exports
// ============================================================================

/** Base Alert component for fallback/SSR scenarios */
export { BaseAlert } from './base';

/** Description compound component for additional alert content */
export { AlertDescription };
export type { AlertDescriptionProps } from './compound';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Alert component with multi-engine support.
 *
 * @description
 * Creates an Alert component using the engine factory pattern.
 * Automatically selects the appropriate engine implementation based on
 * context or explicit prop.
 *
 * @remarks
 * The Alert is composed with its compound components using Object.assign:
 * - `Alert.Description`: For additional descriptive text
 *
 * @example
 * ```tsx
 * // Uses context engine (default: Titan)
 * <Alert type="success" message="Profile updated" />
 *
 * // Explicit engine selection
 * <Alert engine="hermes" type="info" message="Loading..." />
 * ```
 */
export const Alert = Object.assign(
  createEngineComponent<AlertProps>('Alert', {
    /** Ant Design implementation - full animations and theme support */
    titan: () => import('./engines/titan'),
    /** DaisyUI implementation - utility-first Tailwind styling */
    hermes: () => import('./engines/hermes'),
    /** Vanilla implementation - zero dependencies, CSS variables */
    apollo: () => import('./engines/apollo'),
  }),
  {
    /** Compound component for additional alert description text */
    Description: AlertDescription,
  }
);
