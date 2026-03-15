'use client';

/**
 * @fileoverview Input - Rottay Design System
 * @description Text input field for capturing user input in forms.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Input component provides a flexible text input with support for various
 * types (text, password, email, number, etc.), validation states, and
 * decorative elements (prefix, suffix, clearable button).
 *
 * **Multi-Engine Architecture:**
 * - **Classic** (Ant Design): Enterprise-grade input with rich validation states
 * - **Modern** (DaisyUI/Tailwind): Lightweight utility-first input styling
 * - **Rustic** (Vanilla HTML/CSS): Headless implementation with CSS variables
 *
 * **Multi-Tenant Support:**
 * Input appearance adapts to tenant themes via CSS custom properties
 * (--ds-input-*), ensuring consistent branding across tenants.
 *
 * **Compound Components:**
 * - `Input.Group` - Groups input with addons
 * - `Input.Addon` - Decorative addon before/after input
 * - `Input.Password` - Password input with visibility toggle
 * - `Input.Search` - Search input with search button
 * - `Input.TextArea` - Multi-line text input
 *
 * @example Basic Usage
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * // Simple text input
 * <Input placeholder="Enter your name" />
 *
 * // Controlled input
 * const [value, setValue] = useState('');
 * <Input
 *   value={value}
 *   onChange={(val) => setValue(val)}
 *   placeholder="Type here..."
 * />
 * ```
 *
 * @example With Validation and Clear
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input
 *   placeholder="Email address"
 *   type="email"
 *   error={!isValidEmail}
 *   errorMessage="Please enter a valid email"
 *   clearable
 *   onClear={() => setEmail('')}
 * />
 * ```
 *
 * @example With Prefix and Suffix
 * ```tsx
 * import { Input } from '@rottay/design-system';
 * import { UserIcon, SearchIcon } from '@rottay/icons';
 *
 * <Input
 *   prefix={<UserIcon />}
 *   suffix={<SearchIcon />}
 *   placeholder="Search users..."
 * />
 * ```
 *
 * @example Password Input
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Password
 *   placeholder="Enter password"
 *   visibilityToggle
 * />
 * ```
 *
 * @example Input Group with Addons
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * <Input.Group>
 *   <Input.Addon position="before">https://</Input.Addon>
 *   <Input placeholder="example.com" />
 *   <Input.Addon position="after">.com</Input.Addon>
 * </Input.Group>
 * ```
 *
 * @see {@link InputGroup} for grouping inputs with addons
 * @see {@link InputPassword} for password inputs
 * @see {@link InputSearch} for search inputs
 * @see {@link InputTextArea} for multi-line inputs
 * @module Input
 * @category Inputs
 * @package @rottay/design-system
 */

import type { InputProps } from './Input.types';
import { BaseInput } from './base';
import { InputGroup, InputAddon, InputPassword, InputSearch, InputTextArea } from './compound';

// Export types
export type {
  InputProps,
  InputSize,
  InputVariant,
  InputStatus,
  InputType,
  InputGroupProps,
  InputAddonProps,
} from './Input.types';
export { INPUT_DEFAULTS } from './Input.types';

// Export compound components
export { InputGroup, InputAddon, InputPassword, InputSearch, InputTextArea };

// Export base component

export const Input = Object.assign(
  BaseInput,
  {
    Group: InputGroup,
    Addon: InputAddon,
    Password: InputPassword,
    Search: InputSearch,
    TextArea: InputTextArea,
  }
);
