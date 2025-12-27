/**
 * @fileoverview Alert Component - Rottay Design System
 * @description Contextual feedback messages for user actions and system status.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Alert component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - alert styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens. Each alert
 * type (info, success, warning, error) has its own customizable color palette.
 *
 * @example Basic Usage
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   return (
 *     <Alert type="success" message="Changes saved successfully!" />
 *   );
 * }
 * ```
 *
 * @example With Description
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert
 *   type="warning"
 *   message="Unsaved Changes"
 *   description="You have unsaved changes that will be lost if you leave."
 * />
 * ```
 *
 * @example Dismissible Alert
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * function NotificationBanner() {
 *   const [visible, setVisible] = useState(true);
 *
 *   if (!visible) return null;
 *
 *   return (
 *     <Alert
 *       type="info"
 *       message="New features available"
 *       description="Check out the latest updates to improve your workflow."
 *       closable
 *       onClose={() => setVisible(false)}
 *     />
 *   );
 * }
 * ```
 *
 * @example With Compound Component
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert type="error" message="Upload Failed">
 *   <Alert.Description>
 *     The file exceeds the maximum size of 10MB. Please compress
 *     your file or try uploading a smaller one.
 *   </Alert.Description>
 * </Alert>
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Alert automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Alert type="success" message="Welcome back!">
 *     {/* Uses ACME Corp's brand colors and styling *\/}
 *   </Alert>
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Alert engine="hermes" type="info" message="Using DaisyUI styling">
 *   {/* Renders with DaisyUI/Tailwind styling *\/}
 * </Alert>
 * ```
 *
 * @see {@link AlertProps} for complete prop documentation
 * @see {@link AlertDescription} for description compound component
 * @see {@link Modal} for dialog-based feedback
 * @see {@link Toast} for temporary notifications
 *
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
// Compound Component Exports
// ============================================================================

export { AlertDescription };
export type { AlertDescriptionProps } from './compound';

// ============================================================================
// Base Component Export
// ============================================================================

/** Base Alert component for fallback/SSR scenarios */
export { BaseAlert } from './base';

// ============================================================================
// Main Component
// ============================================================================

/**
 * Alert component with multi-engine support and compound components.
 *
 * @description
 * A contextual feedback component for displaying important messages. Ideal for:
 * - Success confirmations
 * - Warning notices
 * - Error messages
 * - Informational tips
 * - System status updates
 *
 * @remarks
 * - Supports four semantic types (info, success, warning, error)
 * - Includes built-in icons per type (customizable)
 * - Optional dismiss functionality with callback
 * - Fully accessible with ARIA attributes
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link AlertProps}
 * @returns React component with Description compound component
 *
 * @example
 * ```tsx
 * <Alert type="success" message="Profile updated" showIcon>
 *   <Alert.Description>
 *     Your changes have been saved to the server.
 *   </Alert.Description>
 * </Alert>
 * ```
 */
export const Alert = Object.assign(
  createEngineComponent<AlertProps>('Alert', {
    /** Ant Design implementation - full-featured with animations */
    titan: () => import('./engines/titan'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    hermes: () => import('./engines/hermes'),
    /** Vanilla HTML/CSS implementation - zero dependencies */
    apollo: () => import('./engines/apollo'),
  }),
  {
    /**
     * Description section of the alert.
     * Contains additional explanatory text below the main message.
     * @see {@link AlertDescription}
     */
    Description: AlertDescription,
  }
);
