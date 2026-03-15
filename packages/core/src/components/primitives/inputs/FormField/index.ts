'use client';

/**
 * @fileoverview FormField - Rottay Design System
 * @description A convenience wrapper that combines Label + Input + Error message + Help text
 * into a single component. Simplifies form layouts significantly.
 *
 * @remarks
 * FormField is a DX improvement that eliminates the boilerplate of manually composing
 * label, input, error, and help elements. It works standalone (no Form parent required)
 * and integrates with all three rendering engines.
 *
 * **Multi-Engine Architecture:**
 * - **Classic** (Ant Design): Wraps Form.Item for enterprise-grade field layout
 * - **Modern** (DaisyUI/Tailwind): Uses form-control with utility classes
 * - **Rustic** (Vanilla HTML/CSS): Semantic HTML with inline styles
 *
 * **Key Features:**
 * - Standalone usage (no Form context needed)
 * - Vertical and horizontal layouts
 * - Size variants (sm, md, lg)
 * - Accessible label-input linking via htmlFor/id
 * - Error and help text with proper ARIA attributes
 * - Required field indicator
 * - Disabled state
 *
 * @example Basic Usage
 * ```tsx
 * import { FormField, Input } from '@rottay/design-system';
 *
 * <FormField label="Email" name="email" required error={errors.email} help="We'll never share your email">
 *   <Input value={email} onChange={setEmail} />
 * </FormField>
 * ```
 *
 * @example Horizontal Layout
 * ```tsx
 * <FormField label="Username" name="username" layout="horizontal" labelWidth="160px">
 *   <Input value={username} onChange={setUsername} />
 * </FormField>
 * ```
 *
 * @see {@link FormFieldProps} for complete prop documentation
 * @module FormField
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { FormFieldProps } from './types';

// Type Exports
export type {
  FormFieldProps,
  FormFieldLayout,
  FormFieldSize,
} from './types';
export { FORMFIELD_DEFAULTS } from './types';

// Main Component
export const FormField = createEngineComponent<FormFieldProps>('FormField', {
  /** Ant Design implementation - wraps Form.Item */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});
