'use client';

/**
 * @fileoverview Select - Rottay Design System
 * @description Dropdown selection component for choosing from a list of options.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Select component provides a feature-rich dropdown for single or multiple
 * selection from a list of options. It supports searching, grouping, custom
 * rendering, and keyboard navigation.
 *
 * **Multi-Engine Architecture:**
 * - **Classic** (Ant Design): Full-featured select with advanced filtering
 * - **Modern** (DaisyUI/Tailwind): Lightweight utility-first select styling
 * - **Rustic** (Vanilla HTML/CSS): Headless implementation with full keyboard support
 *
 * **Multi-Tenant Support:**
 * Select appearance adapts to tenant themes via CSS custom properties
 * (--ds-select-*), ensuring consistent branding across tenants.
 *
 * **Compound Components:**
 * - `Select.Option` - Individual selectable option
 * - `Select.OptGroup` - Group of related options
 *
 * @example Basic Usage
 * ```tsx
 * import { Select } from '@rottay/design-system';
 *
 * const options = [
 *   { value: 'react', label: 'React' },
 *   { value: 'vue', label: 'Vue' },
 *   { value: 'angular', label: 'Angular' },
 * ];
 *
 * <Select
 *   options={options}
 *   placeholder="Select a framework"
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 *
 * @example Multiple Selection with Search
 * ```tsx
 * import { Select } from '@rottay/design-system';
 *
 * <Select
 *   options={options}
 *   multiple
 *   searchable
 *   placeholder="Select frameworks..."
 *   maxTagCount={3}
 *   onChange={(values) => setSelectedFrameworks(values)}
 * />
 * ```
 *
 * @example With Icons and Grouping
 * ```tsx
 * import { Select } from '@rottay/design-system';
 * import { ReactIcon, VueIcon } from '@rottay/icons';
 *
 * const options = [
 *   { value: 'react', label: 'React', icon: <ReactIcon />, group: 'Frontend' },
 *   { value: 'vue', label: 'Vue', icon: <VueIcon />, group: 'Frontend' },
 *   { value: 'node', label: 'Node.js', group: 'Backend' },
 * ];
 *
 * <Select
 *   options={options}
 *   placeholder="Select technology"
 *   clearable
 * />
 * ```
 *
 * @example Controlled with Validation
 * ```tsx
 * import { Select } from '@rottay/design-system';
 *
 * const [value, setValue] = useState<string>('');
 *
 * <Select
 *   value={value}
 *   options={options}
 *   onChange={(val) => setValue(val)}
 *   status={!value ? 'error' : 'success'}
 *   clearable
 * />
 * ```
 *
 * @see {@link SelectOption} for option component
 * @see {@link SelectOptGroup} for grouping options
 * @see {@link Input} for text input
 * @see {@link Checkbox} for checkbox input
 * @module Select
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { SelectProps } from './Select.types';
import { SelectOption, SelectOptGroup } from './compound';

// Export types
export type {
  SelectProps,
  SelectSize,
  SelectVariant,
  SelectStatus,
  SelectMode,
  SelectOption as SelectOptionType,
  SelectOptionGroup,
  SelectOptionProps,
  SelectOptGroupProps,
  SelectSearchState,
  SelectDropdownState,
} from './Select.types';

// Export constants
export {
  SELECT_DEFAULTS,
  SIZE_MAP,
  SELECT_CSS_PREFIX,
  SELECT_CSS_VARS,
} from './Select.types';

// Export compound components
export { SelectOption, SelectOptGroup };

/**
 * Engine-aware Select namespace.
 *
 * The wrapper intentionally stays thin: engines own most of the interaction
 * complexity, while this entry point keeps compounds and the public contract stable.
 */
export const Select = Object.assign(
  createEngineComponent<SelectProps>('Select', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Declarative option helper for JSX-based select configuration. */
    Option: SelectOption,
    /** Groups related options while preserving the same filtering contract. */
    OptGroup: SelectOptGroup,
  }
);
