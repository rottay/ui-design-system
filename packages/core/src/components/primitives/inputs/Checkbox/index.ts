/**
 * Checkbox - Engine Router
 * Exports the engine-routed Checkbox component
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { CheckboxProps } from './types';

export {
  type CheckboxProps,
  type CheckboxSize,
  type CheckboxVariant,
  type CheckboxGroupProps,
  type CheckboxOption,
  CHECKBOX_DEFAULTS,
  CHECKBOX_GROUP_DEFAULTS,
} from './types';

export { BaseCheckbox } from './base';

export const Checkbox = createEngineComponent<CheckboxProps>('Checkbox', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
