'use client';

/**
 * @fileoverview Switch - Rottay Design System
 * @description Binary toggle control for on/off states.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The Switch component provides a toggle control for binary choices,
 * similar to Toggle but with a different visual style. It's commonly
 * used for settings that take effect immediately without confirmation.
 *
 * **Multi-Engine Architecture:**
 * - **Classic**: Wraps Ant Design Switch with all features
 * - **Modern**: Uses DaisyUI toggle classes with custom layout
 * - **Rustic**: Pure CSS implementation with sliding knob animation
 *
 * **Key Features:**
 * - Controlled and uncontrolled modes
 * - Size variants (small, default, large)
 * - Loading state with spinner
 * - Custom checked/unchecked children labels
 * - Keyboard accessible (role="switch")
 * - Form integration via name attribute
 *
 * **CSS Custom Properties:**
 * - `--switch-width` - Track width
 * - `--switch-height` - Track height
 * - `--switch-handle-size` - Handle diameter
 * - `--switch-bg` - Track background color
 * - `--switch-handle-bg` - Handle background color
 *
 * @example Basic Switch
 * ```tsx
 * import { Switch } from '@rottay/design-system';
 *
 * <Switch
 *   defaultChecked
 *   onChange={(checked) => console.log('Switch:', checked)}
 * />
 * ```
 *
 * @example With Labels
 * ```tsx
 * <Switch
 *   checkedChildren="ON"
 *   unCheckedChildren="OFF"
 *   size="large"
 * />
 * ```
 *
 * @example Controlled with Loading
 * ```tsx
 * const [enabled, setEnabled] = useState(false);
 * const [loading, setLoading] = useState(false);
 *
 * <Switch
 *   checked={enabled}
 *   loading={loading}
 *   onChange={async (checked) => {
 *     setLoading(true);
 *     await updateSetting(checked);
 *     setEnabled(checked);
 *     setLoading(false);
 *   }}
 * />
 * ```
 *
 * @see {@link Toggle} for an alternative toggle control
 * @see {@link Checkbox} for multiple-selection boolean inputs
 * @module Switch
 * @category Inputs
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { SwitchProps } from './Switch.types';

export {
  type SwitchProps,
  type SwitchSize,
  SWITCH_DEFAULTS,
} from './Switch.types';

export const Switch = createEngineComponent<SwitchProps>('Switch', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
