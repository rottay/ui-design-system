'use client';

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
 * - **Classic**: Wraps Ant Design Switch with full feature support
 * - **Modern**: Uses DaisyUI toggle classes with Tailwind styling
 * - **Rustic**: Pure CSS implementation with comprehensive a11y support
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
 * - `--ds-toggle-{size}-width` - Toggle track width
 * - `--ds-toggle-{size}-height` - Toggle track height
 * - `--ds-toggle-{size}-dot` - Toggle dot size
 * - `--ds-toggle-bg` - Track background color
 * - `--ds-toggle-bg-checked` - Checked track background
 * - `--ds-toggle-border-color` - Track border color
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

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { ToggleProps } from './Toggle.types';

export {
  type ToggleProps,
  type ToggleSize,
  type ToggleVariant,
  type ToggleLabelPlacement,
  TOGGLE_DEFAULTS,
  SIZE_MAP,
  COLOR_MAP,
} from './Toggle.types';


export const Toggle = createEngineComponent<ToggleProps>('Toggle', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});

Toggle.displayName = 'Toggle';
