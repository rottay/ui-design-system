/**
 * @fileoverview Checkbox Compound Components - Rottay Design System
 * @description Compound components that extend Checkbox functionality.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module exports compound components that work with the Checkbox component
 * to provide group selection functionality:
 *
 * - **CheckboxGroup**: Manages a group of checkboxes with shared state,
 *   supporting both controlled and uncontrolled modes with options array
 *   or children-based rendering.
 *
 * The compound component can be accessed via `Checkbox.Group` after importing
 * the main Checkbox component.
 *
 * @example Using Checkbox.Group
 * ```tsx
 * import { Checkbox } from '@rottay/design-system';
 *
 * // With options array
 * const options = [
 *   { value: 'read', label: 'Read' },
 *   { value: 'write', label: 'Write' },
 *   { value: 'delete', label: 'Delete' },
 * ];
 *
 * <Checkbox.Group
 *   options={options}
 *   value={permissions}
 *   onChange={(values) => setPermissions(values)}
 *   direction="horizontal"
 *   spacing="lg"
 * />
 *
 * // With children
 * <Checkbox.Group
 *   value={selected}
 *   onChange={setSelected}
 *   direction="vertical"
 * >
 *   <Checkbox value="opt1" label="Option 1" />
 *   <Checkbox value="opt2" label="Option 2" />
 *   <Checkbox value="opt3" label="Option 3" />
 * </Checkbox.Group>
 * ```
 *
 * @see {@link Checkbox} for the main component
 * @see {@link CheckboxGroup} for grouping checkboxes
 * @module CheckboxCompound
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// COMPOUND COMPONENT EXPORTS
// ============================================================================

export { CheckboxGroup } from './Group';
export type { CheckboxGroupComponentProps } from './Group';
