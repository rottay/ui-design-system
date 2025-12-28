/**
 * @fileoverview Toggle - Rottay Design System
 * @description Boolean toggle switch for on/off states with visual feedback.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Toggle component provides a sliding switch interface for binary choices,
 * commonly used for settings, preferences, and feature flags. It supports
 * controlled and uncontrolled modes, inline labels, and loading states.
 *
 * **Multi-Engine Architecture:**
 * - **Titan**: Wraps Ant Design Switch with full feature support
 * - **Hermes**: Uses DaisyUI toggle classes with Tailwind styling
 * - **Apollo**: Pure CSS implementation with comprehensive a11y support
 *
 * **Key Features:**
 * - Controlled and uncontrolled state management
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Color variants (default, primary, secondary, success, warning, error)
 * - Label placement (start/end)
 * - Loading state with spinner animation
 * - Inner checked/unchecked labels
 * - Description and helper text support
 * - Full keyboard navigation (Space, Enter)
 * - ARIA switch role with proper attributes
 *
 * **CSS Custom Properties:**
 * - `--toggle-{size}-width` - Toggle track width
 * - `--toggle-{size}-height` - Toggle track height
 * - `--toggle-{size}-dot` - Toggle dot size
 * - `--toggle-bg` - Track background color
 * - `--toggle-bg-checked` - Checked track background
 * - `--toggle-border-color` - Track border color
 *
 * @example Basic Toggle
 * ```tsx
 * import { Toggle } from '@rottay/design-system';
 *
 * <Toggle
 *   label="Enable notifications"
 *   defaultChecked={true}
 *   onChange={(checked) => console.log('Toggled:', checked)}
 * />
 * ```
 *
 * @example Controlled Toggle with Color
 * ```tsx
 * const [enabled, setEnabled] = useState(false);
 *
 * <Toggle
 *   checked={enabled}
 *   onChange={setEnabled}
 *   color="success"
 *   size="lg"
 *   label="Dark mode"
 *   description="Enable dark theme for the application"
 * />
 * ```
 *
 * @example Toggle with Inner Labels
 * ```tsx
 * <Toggle
 *   checkedLabel="ON"
 *   uncheckedLabel="OFF"
 *   color="primary"
 *   size="lg"
 * />
 * ```
 *
 * @see {@link Switch} for an alternative toggle control
 * @see {@link Checkbox} for multi-select boolean inputs
 * @module Toggle
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ToggleProps } from './types';

export {
  type ToggleProps,
  type ToggleSize,
  type ToggleVariant,
  type ToggleLabelPlacement,
  TOGGLE_DEFAULTS,
  SIZE_MAP,
  COLOR_MAP,
} from './types';

export { BaseToggle } from './base';

export const Toggle = createEngineComponent<ToggleProps>('Toggle', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

Toggle.displayName = 'Toggle';
