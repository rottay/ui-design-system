/**
 * @fileoverview Select Compound Components - Rottay Design System
 * @description Compound components that extend Select functionality.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module exports compound components that work with the Select component
 * to provide declarative option definition:
 *
 * - **SelectOption**: Individual selectable option with value and label
 * - **SelectOptGroup**: Group of related options with a label
 *
 * These compound components can be accessed via `Select.Option` and
 * `Select.OptGroup` after importing the main Select component.
 *
 * **Note:** While compound components provide a declarative API, using the
 * `options` prop with an array is generally preferred for better performance
 * and easier data management.
 *
 * @example Using Compound Components
 * ```tsx
 * import { Select } from '@rottay/design-system';
 *
 * // Declarative options
 * <Select placeholder="Select a fruit">
 *   <Select.Option value="apple">Apple</Select.Option>
 *   <Select.Option value="banana">Banana</Select.Option>
 *   <Select.Option value="cherry" disabled>Cherry</Select.Option>
 * </Select>
 *
 * // With groups
 * <Select placeholder="Select a food">
 *   <Select.OptGroup label="Fruits">
 *     <Select.Option value="apple">Apple</Select.Option>
 *     <Select.Option value="banana">Banana</Select.Option>
 *   </Select.OptGroup>
 *   <Select.OptGroup label="Vegetables">
 *     <Select.Option value="carrot">Carrot</Select.Option>
 *     <Select.Option value="broccoli">Broccoli</Select.Option>
 *   </Select.OptGroup>
 * </Select>
 * ```
 *
 * @see {@link Select} for the main component
 * @see {@link SelectOption} for individual options
 * @see {@link SelectOptGroup} for option groups
 * @module SelectCompound
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// COMPOUND COMPONENT EXPORTS
// ============================================================================

export { SelectOption } from './Option';
export { SelectOptGroup } from './OptGroup';

export type { SelectOptionProps } from './Option';
export type { SelectOptGroupProps } from './OptGroup';
