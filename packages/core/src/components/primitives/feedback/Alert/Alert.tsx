'use client';

/**
 * @fileoverview Alert - contextual feedback messages (info, success, warning, error).
 * Supports a compound `Alert.Description` sub-component for expanded detail text.
 * Multi-engine: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla).
 *
 * @example
 * ```tsx
 * <Alert type="warning" message="Unsaved Changes" closable onClose={() => setVisible(false)}>
 *   <Alert.Description>You have unsaved changes that will be lost.</Alert.Description>
 * </Alert>
 * ```
 *
 * @module Alert
 * @category Feedback
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { AlertProps } from './Alert.types';
import { AlertDescription } from './compound';

export { type AlertProps, type AlertType, ALERT_DEFAULTS } from './Alert.types';
export { AlertDescription };
export type { AlertDescriptionProps } from './compound';

/**
 * Alert component with multi-engine support.
 * Four semantic types (info, success, warning, error), built-in icons,
 * optional dismiss, and ARIA-compliant markup.
 */
export const Alert = Object.assign(
  // Create the engine-switchable base component
  createEngineComponent<AlertProps>('Alert', {
    classic: () => import('./engines/classic'),  // Ant Design
    modern: () => import('./engines/modern'),     // DaisyUI / Tailwind
    rustic: () => import('./engines/rustic'),      // Vanilla HTML/CSS
  }),
  // Attach compound sub-components for dot-notation access (Alert.Description)
  {
    /** Expanded detail text rendered below the main message line. */
    Description: AlertDescription,
  }
);
