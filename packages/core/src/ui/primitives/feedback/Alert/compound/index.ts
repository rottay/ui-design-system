/**
 * @fileoverview Alert Compound Components - Rottay Design System
 * @description Re-exports all compound components for the Alert primitive.
 *
 * @remarks
 * This barrel file provides convenient access to all Alert compound
 * components. These components are designed to work together to create
 * structured alert layouts with consistent styling and behavior.
 *
 * **Component Hierarchy:**
 * ```
 * <Alert>
 *   <Alert.Description />  ← Additional explanatory text
 * </Alert>
 * ```
 *
 * **Available Compounds:**
 * - `AlertDescription`: Additional descriptive content below the message
 *
 * @example Full Alert Layout
 * ```tsx
 * import { Alert } from '@rottay/design-system';
 *
 * <Alert type="error" message="Connection Failed" closable onClose={retry}>
 *   <Alert.Description>
 *     Unable to connect to the server. Please check your network
 *     connection and try again.
 *   </Alert.Description>
 * </Alert>
 * ```
 *
 * @example Direct Import
 * ```tsx
 * import { AlertDescription } from '@rottay/design-system';
 *
 * // Use directly when building custom alert layouts
 * <div className="custom-alert">
 *   <h4>Custom Title</h4>
 *   <AlertDescription>
 *     Additional details about the alert.
 *   </AlertDescription>
 * </div>
 * ```
 *
 * @module Alert/Compound
 * @category Feedback
 * @package @rottay/design-system
 */

// ============================================================================
// Component Exports
// ============================================================================

export { AlertDescription } from './Description';
export type { AlertDescriptionProps } from './Description';
