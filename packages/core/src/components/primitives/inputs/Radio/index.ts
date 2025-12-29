/**
 * @fileoverview Radio - Rottay Design System
 * @description Single-selection input component for choosing one option from a set.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Radio component provides a single-selection input for choosing one option
 * from a mutually exclusive set. Unlike checkboxes, only one radio in a group
 * can be selected at a time.
 *
 * **Multi-Engine Architecture:**
 * - **Titan** (Ant Design): Enterprise-grade radio with button style support
 * - **Hermes** (DaisyUI/Tailwind): Lightweight utility-first radio styling
 * - **Apollo** (Vanilla HTML/CSS): Headless implementation with full a11y
 *
 * **Multi-Tenant Support:**
 * Radio appearance adapts to tenant themes via CSS custom properties
 * (--radio-*), ensuring consistent branding across tenants.
 *
 * **Compound Components:**
 * - `Radio.Group` - Manages exclusive selection across radio buttons
 *
 * **Key Difference from Checkbox:**
 * - Radios are mutually exclusive within a group (only one selected)
 * - Radios require a `name` attribute to form a group
 * - Clicking a selected radio does NOT deselect it
 *
 * @example Basic Usage
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * // Simple radio
 * <Radio name="fruit" value="apple" label="Apple" />
 * <Radio name="fruit" value="banana" label="Banana" />
 *
 * // Controlled radio
 * <Radio
 *   name="size"
 *   value="large"
 *   checked={size === 'large'}
 *   onChange={() => setSize('large')}
 *   label="Large"
 * />
 * ```
 *
 * @example Radio Group with Options
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * const options = [
 *   { value: 'sm', label: 'Small' },
 *   { value: 'md', label: 'Medium' },
 *   { value: 'lg', label: 'Large' },
 * ];
 *
 * <Radio.Group
 *   options={options}
 *   value={size}
 *   onChange={(val) => setSize(val)}
 *   direction="horizontal"
 * />
 * ```
 *
 * @example Button Style Radio Group
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
 * @example With Descriptions
 * ```tsx
 * import { Radio } from '@rottay/design-system';
 *
 * const plans = [
 *   { value: 'free', label: 'Free', description: 'Basic features' },
 *   { value: 'pro', label: 'Pro', description: 'All features included' },
 * ];
 *
 * <Radio.Group options={plans} value={plan} onChange={setPlan} />
 * ```
 *
 * @see {@link RadioGroup} for grouping radios
 * @see {@link Checkbox} for multi-selection input
 * @see {@link Select} for dropdown selection
 * @module Radio
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { RadioProps } from './types';
import { RadioGroup } from './compound';

export {
  type RadioProps,
  type RadioSize,
  type RadioVariant,
  type RadioLabelPlacement,
  type RadioOption,
  type RadioGroupProps,
  RADIO_DEFAULTS,
  RADIO_GROUP_DEFAULTS,
} from './types';

export { RadioGroup } from './compound';

export const Radio = Object.assign(
  createEngineComponent<RadioProps>('Radio', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Group: RadioGroup,
  }
);
