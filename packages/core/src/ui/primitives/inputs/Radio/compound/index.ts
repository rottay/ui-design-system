/**
 * @fileoverview Radio Compound Components - Rottay Design System
 * @description Compound components that extend Radio functionality.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module exports compound components that work with the Radio component
 * to provide group selection functionality:
 *
 * - **RadioGroup**: Manages a group of radio buttons with exclusive selection,
 *   supporting both controlled and uncontrolled modes with options array
 *   or children-based rendering.
 *
 * The compound component can be accessed via `Radio.Group` after importing
 * the main Radio component.
 *
 * **Key Features:**
 * - Exclusive selection (only one option at a time)
 * - Options array or children-based rendering
 * - Button style variant for segmented control appearance
 * - Horizontal or vertical layout
 * - Option descriptions for additional context
 *
 * @example Using Radio.Group with Options
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * const options = [
 *   { value: 'daily', label: 'Daily' },
 *   { value: 'weekly', label: 'Weekly' },
 *   { value: 'monthly', label: 'Monthly' },
 * ];
 *
 * <Radio.Group
 *   options={options}
 *   value={frequency}
 *   onChange={(val) => setFrequency(val)}
 *   direction="horizontal"
 * />
 * ```
 *
 * @example Button Style Group (Segmented Control)
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * <Radio.Group
 *   options={options}
 *   value={selected}
 *   onChange={setSelected}
 *   buttonStyle="solid"
 *   direction="horizontal"
 * />
 * ```
 *
 * @see {@link Radio} for individual radio buttons
 * @see {@link RadioGroup} for grouping radios
 * @module RadioCompound
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// COMPOUND COMPONENT EXPORTS
// ============================================================================

export { RadioGroup } from './Group';
export type { RadioGroupComponentProps } from './Group';
