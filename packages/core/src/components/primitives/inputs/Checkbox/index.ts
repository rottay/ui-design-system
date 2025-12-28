/**
 * @fileoverview Checkbox - Rottay Design System
 * @description Boolean input component for toggling options on or off.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Checkbox component provides a binary selection input with support for
 * indeterminate states, custom colors, sizes, and grouping functionality.
 * It's ideal for forms, settings, and multi-select scenarios.
 *
 * **Multi-Engine Architecture:**
 * - **Titan** (Ant Design): Enterprise-grade checkbox with native Ant styling
 * - **Hermes** (DaisyUI/Tailwind): Lightweight utility-first checkbox
 * - **Apollo** (Vanilla HTML/CSS): Headless implementation with full a11y support
 *
 * **Multi-Tenant Support:**
 * Checkbox appearance adapts to tenant themes via CSS custom properties
 * (--checkbox-*), ensuring consistent branding across tenants.
 *
 * **Compound Components:**
 * - `Checkbox.Group` - Groups multiple checkboxes with shared state management
 *
 * @example Basic Usage
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * // Simple checkbox
 * <Checkbox label="Accept terms and conditions" />
 *
 * // Controlled checkbox
 * const [checked, setChecked] = useState(false);
 * <Checkbox
 *   checked={checked}
 *   onChange={(value) => setChecked(value)}
 *   label="Subscribe to newsletter"
 * />
 * ```
 *
 * @example With Color and Size Variants
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * <Checkbox size="lg" color="success" label="Completed" />
 * <Checkbox size="sm" color="warning" label="Pending review" />
 * <Checkbox color="error" error label="Has errors" />
 * ```
 *
 * @example Indeterminate State
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * // Parent checkbox with indeterminate state
 * <Checkbox
 *   indeterminate={someChecked && !allChecked}
 *   checked={allChecked}
 *   onChange={handleSelectAll}
 *   label="Select all"
 * />
 * ```
 *
 * @example Checkbox Group
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * const options = [
 *   { value: 'apple', label: 'Apple' },
 *   { value: 'banana', label: 'Banana' },
 *   { value: 'orange', label: 'Orange' },
 * ];
 *
 * <Checkbox.Group
 *   options={options}
 *   value={selectedFruits}
 *   onChange={(values) => setSelectedFruits(values)}
 *   direction="vertical"
 * />
 * ```
 *
 * @see {@link CheckboxGroup} for grouping checkboxes
 * @see {@link Radio} for single-selection from options
 * @see {@link Switch} for toggle-style boolean input
 * @module Checkbox
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { CheckboxProps } from './types';
import { CheckboxGroup } from './compound';

// Export types
export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxVariant,
  CheckboxRadius,
  CheckboxLabelPlacement,
  CheckboxGroupProps,
  CheckboxOption,
} from './types';
export { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS, SIZE_MAP, COLOR_MAP, RADIUS_MAP } from './types';

// Export compound components
export { CheckboxGroup };

// Export base component
export { BaseCheckbox } from './base';

// Create engine-aware Checkbox component
export const Checkbox = Object.assign(
  createEngineComponent<CheckboxProps>('Checkbox', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Group: CheckboxGroup,
  }
);
