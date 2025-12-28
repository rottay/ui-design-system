/**
 * @fileoverview Input Compound Components - Rottay Design System
 * @description Compound components that extend Input functionality.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module exports compound components that work with the Input component
 * to provide enhanced functionality:
 *
 * - **InputGroup**: Groups an input with addons for combined visual treatment
 * - **InputAddon**: Decorative/functional addon before or after input
 * - **InputPassword**: Password input with visibility toggle
 * - **InputSearch**: Search input with search button and callback
 * - **InputTextArea**: Multi-line text input
 *
 * These compound components can be accessed via `Input.Group`, `Input.Addon`,
 * `Input.Password`, `Input.Search`, and `Input.TextArea` after importing
 * the main Input component.
 *
 * @example Using Compound Components
 * ```tsx
 * import { Input } from '@rottay/design-system';
 *
 * // Input Group with Addons
 * <Input.Group compact>
 *   <Input.Addon position="before">$</Input.Addon>
 *   <Input placeholder="0.00" type="number" />
 *   <Input.Addon position="after">.00</Input.Addon>
 * </Input.Group>
 *
 * // Password Input
 * <Input.Password
 *   placeholder="Enter password"
 *   visibilityToggle
 * />
 *
 * // Search Input
 * <Input.Search
 *   placeholder="Search..."
 *   onSearch={(value) => handleSearch(value)}
 *   loading={isSearching}
 * />
 *
 * // TextArea
 * <Input.TextArea
 *   rows={4}
 *   placeholder="Enter description..."
 *   maxLength={500}
 *   showCount
 * />
 * ```
 *
 * @see {@link Input} for the main component
 * @see {@link InputGroup} for grouping with addons
 * @see {@link InputPassword} for password inputs
 * @see {@link InputSearch} for search functionality
 * @see {@link InputTextArea} for multi-line input
 * @module InputCompound
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// COMPOUND COMPONENT EXPORTS
// ============================================================================

export { InputGroup } from './Group';
export { InputAddon } from './Addon';
export { InputPassword } from './Password';
export { InputSearch } from './Search';
export { InputTextArea } from './TextArea';

export type { InputGroupProps, InputAddonProps } from '../types';
