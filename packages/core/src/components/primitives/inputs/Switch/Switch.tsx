'use client';

/**
 * @fileoverview Switch -- binary toggle control for on/off states with
 * size variants, loading indicator, and custom checked/unchecked labels.
 *
 * @example
 * ```tsx
 * import { Switch } from '@rottay/design-system';
 *
 * // Basic toggle
 * <Switch defaultChecked onChange={(checked) => console.log(checked)} />
 *
 * // With labels and loading state
 * <Switch
 *   checkedChildren="ON"
 *   unCheckedChildren="OFF"
 *   size="large"
 *   loading={saving}
 * />
 * ```
 *
 * @module Switch
 * @category Inputs
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { SwitchProps } from './Switch.types';

export {
  type SwitchProps,
  type SwitchSize,
  SWITCH_DEFAULTS,
} from './Switch.types';

/** Binary toggle primitive resolved through the active engine. */
export const Switch = createEngineComponent<SwitchProps>('Switch', {
  /** Ant Design Switch with loading spinner and label slots */
  classic: () => import('./engines/classic'),
  /** DaisyUI toggle with custom layout */
  modern: () => import('./engines/modern'),
  /** Pure CSS sliding knob with transition animation */
  rustic: () => import('./engines/rustic'),
});
