/**
 * Checkbox - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { CheckboxProps } from './types';
import { CheckboxGroup } from './compound';

// Export types
export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxVariant,
  CheckboxRadius,
  CheckboxLabelPlacement,
  CheckboxGroupProps,
  CheckboxOption,
} from './types';
export { CHECKBOX_DEFAULTS, CHECKBOX_GROUP_DEFAULTS, SIZE_MAP, COLOR_MAP, RADIUS_MAP } from './types';

// Export compound components
export { CheckboxGroup };

// Export base component
export { BaseCheckbox } from './base';

// Create engine-aware Checkbox component
export const Checkbox = Object.assign(
  createEngineComponent<CheckboxProps>('Checkbox', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Group: CheckboxGroup,
  }
);
